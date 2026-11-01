import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Download, Copy, Check, Share2 } from "lucide-react";
import { SegmentedControl } from "./common/SegmentedControl";

export function RecapModal({ personalRecap, groupRecap, onClose }) {
  const canvasRef = useRef(null);
  const [subject, setSubject] = useState("personal"); // 'personal' | 'group'
  const [copied, setCopied] = useState(false);

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle top border accent
    ctx.fillStyle = "#4F46E5";
    ctx.fillRect(0, 0, width, 12);

    // Inner White Card
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#E7E5E4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(60, 60, width - 120, height - 120, 32);
    ctx.fill();
    ctx.stroke();

    // Top Brand Watermark
    ctx.fillStyle = "#1C1917";
    ctx.font = "bold 38px Inter, system-ui, sans-serif";
    ctx.fillText("Karmayodha", 120, 160);

    ctx.fillStyle = "#A8A29E";
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.fillText("MuLearn TLY Season Recap", 120, 200);

    if (subject === "personal" && personalRecap) {
      const { member, periodLabel, rank, karma, movement, groupName, streak, isMVP, isUnderdog } = personalRecap;

      // Period Badge
      ctx.fillStyle = "#EEF2FF";
      ctx.beginPath();
      ctx.roundRect(120, 240, 360, 48, 24);
      ctx.fill();
      ctx.fillStyle = "#4F46E5";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText(periodLabel.toUpperCase(), 144, 272);

      // Member Name
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 64px Inter, sans-serif";
      ctx.fillText(member.name, 120, 370);

      ctx.fillStyle = "#57534E";
      ctx.font = "500 30px Inter, sans-serif";
      ctx.fillText(`${member.muid} • ${groupName}`, 120, 420);

      // Primary Stats Box
      ctx.fillStyle = "#F5F5F4";
      ctx.beginPath();
      ctx.roundRect(120, 480, width - 240, 260, 24);
      ctx.fill();

      // Karma Stat
      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText("KARMA EARNED", 170, 540);

      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 88px Inter, sans-serif";
      ctx.fillText(karma.toLocaleString("en-IN"), 170, 650);

      // Rank Stat
      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText("CAMPUS RANK", 620, 540);

      ctx.fillStyle = "#4F46E5";
      ctx.font = "bold 88px Inter, sans-serif";
      ctx.fillText(`#${rank}`, 620, 650);

      // Movement & Streak row
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("Season Performance", 120, 810);

      // Metric 1: Movement
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#E7E5E4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(120, 840, 400, 140, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillText("RANK MOVEMENT", 150, 885);
      ctx.fillStyle = movement.type === "up" ? "#16A34A" : movement.type === "down" ? "#DC2626" : "#57534E";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.fillText(movement.type === "up" ? `+${movement.places} places` : movement.type === "down" ? `-${movement.places} places` : "Steady rank", 150, 945);

      // Metric 2: Daily Streak
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(560, 840, 400, 140, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillText("ACTIVE STREAK", 590, 885);
      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.fillText(`${streak.currentStreak} Days`, 590, 945);

      // Awards row
      let awardY = 1040;
      if (isMVP) {
        ctx.fillStyle = "#FEFCE8";
        ctx.strokeStyle = "#FEF08A";
        ctx.beginPath();
        ctx.roundRect(120, awardY, 390, 60, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#CA8A04";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText("★ GROUP MVP OF THE WEEK", 150, awardY + 40);
      }
      if (isUnderdog) {
        ctx.fillStyle = "#FEF3C7";
        ctx.strokeStyle = "#FDE68A";
        ctx.beginPath();
        ctx.roundRect(540, awardY, 390, 60, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#B45309";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText("⚡ MOST IMPROVED UNDERDOG", 570, awardY + 40);
      }

    } else if (groupRecap) {
      const { group, periodLabel, rank, karma, goal, mvp, topContributors } = groupRecap;

      // Period Badge
      ctx.fillStyle = "#EEF2FF";
      ctx.beginPath();
      ctx.roundRect(120, 240, 360, 48, 24);
      ctx.fill();
      ctx.fillStyle = "#4F46E5";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText(periodLabel.toUpperCase(), 144, 272);

      // Group Name
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 64px Inter, sans-serif";
      ctx.fillText(group.name, 120, 370);

      ctx.fillStyle = "#57534E";
      ctx.font = "500 30px Inter, sans-serif";
      ctx.fillText(`Rank #${rank} Group • ${goal.paceText}`, 120, 420);

      // Stats Box
      ctx.fillStyle = "#F5F5F4";
      ctx.beginPath();
      ctx.roundRect(120, 480, width - 240, 260, 24);
      ctx.fill();

      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText("TOTAL GROUP KARMA", 170, 540);
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 88px Inter, sans-serif";
      ctx.fillText(karma.toLocaleString("en-IN"), 170, 650);

      ctx.fillStyle = "#A8A29E";
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText("GOAL PROGRESS", 620, 540);
      ctx.fillStyle = goal.isReached ? "#16A34A" : "#4F46E5";
      ctx.font = "bold 88px Inter, sans-serif";
      ctx.fillText(`${goal.percent}%`, 620, 650);

      // Top contributors
      ctx.fillStyle = "#1C1917";
      ctx.font = "bold 32px Inter, sans-serif";
      ctx.fillText("Top Group Contributors", 120, 810);

      topContributors.forEach((c, i) => {
        const rowY = 850 + i * 80;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#E7E5E4";
        ctx.beginPath();
        ctx.roundRect(120, rowY, width - 240, 64, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#1C1917";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText(`${i + 1}. ${c.name}`, 150, rowY + 42);

        ctx.fillStyle = "#57534E";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText(`${c.karma.toLocaleString("en-IN")} karma`, 740, rowY + 42);
      });

      if (mvp) {
        ctx.fillStyle = "#FEFCE8";
        ctx.strokeStyle = "#FEF08A";
        ctx.beginPath();
        ctx.roundRect(120, 1110, width - 240, 60, 30);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#CA8A04";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText(`★ GROUP MVP: ${mvp.name} (${mvp.karma.toLocaleString("en-IN")} karma)`, 150, 1150);
      }
    }

    // Footer Watermark
    ctx.fillStyle = "#A8A29E";
    ctx.font = "500 20px Inter, sans-serif";
    ctx.fillText("Powered by MuLearn Platform • Read-Only Analytics", 120, 1220);
  }, [subject, personalRecap, groupRecap]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.download = `karmayodha-recap-${subject}.png`;
    a.href = url;
    a.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard) return;

    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Image copy failed:", err);
      }
    });
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="drawer-panel"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Share2 size={20} color="var(--accent)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Shareable Season Recap Card
            </h2>
          </div>

          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body" style={{ alignItems: "center", gap: "var(--space-4)" }}>
          <SegmentedControl
            options={[
              { value: "personal", label: "Personal Card" },
              { value: "group", label: "Group Card" },
            ]}
            value={subject}
            onChange={setSubject}
            ariaLabel="Recap type switcher"
          />

          {/* Canvas Preview */}
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              aspectRatio: "1080 / 1350",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "4px" }}>
            <button
              type="button"
              className="sync-button-secondary"
              onClick={handleDownload}
              style={{ padding: "8px 18px", fontSize: "0.875rem" }}
            >
              <Download size={16} />
              <span>Download PNG (1080x1350)</span>
            </button>

            <button
              type="button"
              className="sync-button-secondary"
              onClick={handleCopyImage}
              style={{ padding: "8px 18px", fontSize: "0.875rem" }}
            >
              {copied ? <Check size={16} color="var(--status-up)" /> : <Copy size={16} />}
              <span>{copied ? "Copied image!" : "Copy Image"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

