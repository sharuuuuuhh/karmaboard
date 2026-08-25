import json
import os
import requests
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

MUIDS_FILE = "muids.json"
# Real muLearn JSON API — no headless browser needed
MULEARN_API = "https://mulearn.org/api/v1/dashboard/profile/user-profile/{}/"


# ── persistence helpers ──────────────────────────────────────────────────────

def load_muids():
    if not os.path.exists(MUIDS_FILE):
        return []
    with open(MUIDS_FILE) as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_muids(muids):
    with open(MUIDS_FILE, "w") as f:
        json.dump(muids, f, indent=2)


# ── karma extraction ─────────────────────────────────────────────────────────

def extract_karma(data):
    """
    Pull the karma value out of muLearn's API response.
    The response envelope looks like:
        { "hasError": false, "statusCode": 200, "message": "...",
          "response": { "karma": 1234, "full_name": "...", ... } }

    If the shape ever changes, fix the key path here — nowhere else.
    """
    if not isinstance(data, dict):
        return None, None

    # unwrap envelope
    response = data.get("response", data)

    if not isinstance(response, dict):
        return None, None

    karma = response.get("karma") or response.get("karma_points") or response.get("total_karma")
    name  = (
        response.get("full_name")
        or response.get("name")
        or response.get("firstName")
        or None
    )
    return karma, name


# ── core fetch ───────────────────────────────────────────────────────────────

def fetch_karma(muid):
    """Return a dict: {muid, name, karma, rank, error, raw_json}"""
    url = MULEARN_API.format(muid)
    try:
        resp = requests.get(url, timeout=12,
                            headers={"Accept": "application/json"})
        resp.raise_for_status()
        data = resp.json()

        karma, name = extract_karma(data)

        # also try to grab rank if present
        response_body = data.get("response", data) if isinstance(data, dict) else {}
        rank = response_body.get("rank") if isinstance(response_body, dict) else None

        return {
            "muid":  muid,
            "name":  name or muid,
            "karma": karma,
            "rank":  rank,
            "error": None if karma is not None else "karma key not found — check extract_karma()",
            "raw":   data,
        }

    except requests.exceptions.HTTPError as e:
        if e.response is not None and e.response.status_code in (400, 403):
            try:
                search_url = "https://mulearn.org/api/v1/dashboard/user/search/"
                s_resp = requests.get(search_url, params={"search": muid}, timeout=12,
                                      headers={"Accept": "application/json"})
                s_resp.raise_for_status()
                s_data = s_resp.json()
                results = s_data.get("response", {}).get("data", [])
                found = next((r for r in results if r.get("muid", "").lower() == muid.lower()), None)
                if found:
                    karma_val = found.get("karma")
                    karma = int(karma_val) if karma_val is not None else None
                    return {
                        "muid":  muid,
                        "name":  found.get("full_name") or muid,
                        "karma": karma,
                        "rank":  None,
                        "error": None if karma is not None else "karma key not found in search fallback",
                        "raw":   s_data,
                    }
            except Exception:
                pass
        return {"muid": muid, "name": muid, "karma": None, "rank": None,
                "error": f"HTTP {e.response.status_code}", "raw": None}
    except requests.exceptions.ConnectionError:
        return {"muid": muid, "name": muid, "karma": None, "rank": None,
                "error": "Connection failed — check network", "raw": None}
    except requests.exceptions.Timeout:
        return {"muid": muid, "name": muid, "karma": None, "rank": None,
                "error": "Request timed out", "raw": None}
    except Exception as e:
        return {"muid": muid, "name": muid, "karma": None, "rank": None,
                "error": str(e), "raw": None}


# ── routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    muids   = load_muids()
    results = [fetch_karma(m) for m in muids]
    # sort by karma descending (None / errors go to the bottom)
    results.sort(key=lambda r: r["karma"] if r["karma"] is not None else -1,
                 reverse=True)
    return render_template("index.html", results=results)


@app.route("/add", methods=["POST"])
def add():
    muid = request.form.get("muid", "").strip()
    if muid:
        muids = load_muids()
        if muid not in muids:
            muids.append(muid)
            save_muids(muids)
    return redirect(url_for("index"))


@app.route("/remove/<path:muid>", methods=["POST"])
def remove(muid):
    muids = [m for m in load_muids() if m != muid]
    save_muids(muids)
    return redirect(url_for("index"))


# ── debug endpoint: inspect raw API response for a muid ──────────────────────

@app.route("/debug/<path:muid>")
def debug(muid):
    result = fetch_karma(muid)
    return app.response_class(
        response=json.dumps(result, indent=2, default=str),
        mimetype="application/json"
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
