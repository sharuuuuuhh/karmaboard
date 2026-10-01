import React, { useState, useMemo } from "react";
import "../pages/styles.css";

const TopTeam = ({ students }) => {
  const teamScores = useMemo(() => {
    if (!students || students.length === 0) return [];

    const teamKarmaMap = students.reduce((acc, student) => {
      if (!student.team) {
        return acc;
      }
      const karma =
        typeof student.monthly_karma === "number" ? student.monthly_karma : 0;
      if (!acc[student.team]) {
        acc[student.team] = 0;
      }
      acc[student.team] += karma;
      return acc;
    }, {});

    return Object.entries(teamKarmaMap)
      .map(([team, totalKarma]) => ({ team, totalKarma }))
      .sort((a, b) => b.totalKarma - a.totalKarma);
  }, [students]);

  const [selectedTeam, setSelectedTeam] = useState(null);

  const filteredStudents = useMemo(() => {
    if (!selectedTeam) {
      return []; // <-- This is the change
    }
    return students.filter((student) => student.team === selectedTeam);
  }, [students, selectedTeam]);

  const selectTeam = (team) => {
    setSelectedTeam((currentSelected) =>
      currentSelected === team ? null : team
    );
  };

  return (
    <div className="team-section">
      <div className="team-leaderboard">
        {teamScores.map((teamData, index) => (
          <div
            key={teamData.team}
            className={`team-card ${
              selectedTeam === teamData.team ? "selected" : ""
            }`}
            onClick={() => selectTeam(teamData.team)}
          >
            <div className="t-rank">{index + 1}</div>
            <div className="t-info">
              <div className="t-karma">
                {teamData.totalKarma.toLocaleString()} Karma
              </div>
              <div className="t-name">{teamData.team}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="teams">
        <div className="t-title">Team Members</div>
        <div className="team-container">
          <div className="team-members">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <div
                  className={`m-card rank${index + 1}`}
                  key={student.user_id || student.muid || index}
                >
                  <div className="m-name">
                    {index + 1}. {student.full_name}
                  </div>
                  <div className="t-card-section">
                    <div className="tc-karma">
                      <p>{student.monthly_karma}</p> Monthly
                    </div>
                    <div className="tc-karma">
                      <p>{student.karma}</p> Overall
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="t-message">Select a team to see its members.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTeam;
