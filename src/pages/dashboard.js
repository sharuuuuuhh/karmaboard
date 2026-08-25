import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Import the shared stylesheet

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamInputs, setTeamInputs] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          navigate("/");
        } else {
          setUser(data.user);
        }
      } catch (e) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .or(`full_name.ilike.%${searchTerm}%,team.ilike.%${searchTerm}%`)
        .order("karma", { ascending: false });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function assignTeam(event, studentId) {
    event.preventDefault();
    const newTeamName = teamInputs[studentId];
    if (!newTeamName || !newTeamName.trim()) return;

    try {
      setError(null);
      const { data: updatedStudent, error } = await supabase
        .from("students")
        .update({ team: newTeamName })
        .eq("user_id", studentId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (updatedStudent) {
        setResults((currentResults) =>
          currentResults.map((student) =>
            student.user_id === studentId ? updatedStudent : student
          )
        );
      } else {
        console.warn(`Could not find or update student with ID: ${studentId}`);
      }
      setTeamInputs((prev) => ({ ...prev, [studentId]: "" }));
    } catch (error) {
      setError(error.message);
    }
  }

  async function removeTeam(event, studentId) {
    event.preventDefault();
    try {
      setError(null);
      const { data: updatedStudent, error } = await supabase
        .from("students")
        .update({ team: null })
        .eq("user_id", studentId)
        .select()
        .maybeSingle();
      if (error) throw error;

      if (updatedStudent) {
        setResults((currentResults) =>
          currentResults.map((student) =>
            student.user_id === studentId ? updatedStudent : student
          )
        );
      } else {
        console.warn(`Could not find or update student with ID: ${studentId}`);
      }
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading && !user) {
    return (
      <div className="auth-page">
        <p className="auth-subtitle">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="auth-title">Dashboard</h1>
        {user && (
          <p className="auth-subtitle">
            Signed in as <b>{user.email}</b>
          </p>
        )}
        <button
          onClick={handleLogout}
          className="auth-button secondary logout-btn"
        >
          Log Out
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          className="auth-input"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search student or team name"
          value={searchTerm}
        />
        <button type="submit" className="auth-button primary">
          Search
        </button>
      </form>

      <div className="results-container">
        {loading && <p className="auth-subtitle">Searching...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {results.length > 0
          ? results.map((student) => (
              <div key={student.user_id} className="result-item">
                <p className="result-name">{student.full_name}</p>
                <p className="result-details">
                  Rank: {student.rank} | Karma: {student.karma} | Team:{" "}
                  <b>{student.team || "None"}</b>
                  <br />
                  {student.muid}
                </p>
                <form
                  onSubmit={(e) => assignTeam(e, student.user_id)}
                  className="assign-form"
                >
                  <input
                    className="auth-input"
                    placeholder="Assign team"
                    value={teamInputs[student.user_id] || ""}
                    onChange={(e) =>
                      setTeamInputs((prev) => ({
                        ...prev,
                        [student.user_id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="submit"
                    className="auth-button secondary go-btn"
                  >
                    Assign
                  </button>
                </form>
                <button
                  className="auth-button secondary go-btn"
                  onClick={(e) => removeTeam(e, student.user_id)}
                >
                  Remove Team
                </button>
              </div>
            ))
          : !loading &&
            searchTerm && <p className="auth-subtitle">No results found.</p>}
      </div>
    </div>
  );
}
