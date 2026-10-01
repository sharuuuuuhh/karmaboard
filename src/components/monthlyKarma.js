import "../pages/styles.css";

const MonthlyKarma = ({ students }) => {
  return (
    <div className="monthly-container">
      <div className="monthly-cards">
        {students.slice(0, 15).map((student, index) => (
          <div className={`m-card rank${index + 1}`} key={student.user_id || student.muid || index}>
            <div className="m-name">
              {index + 1}. {student.full_name}
            </div>
            <div className="m-card-section">
              <div className="m-karma">
                <p>{student.monthly_karma}</p> Karma
              </div>
              <div className="m-team">
                <p>{student.team || "N/A"}</p> <div>team</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyKarma;
