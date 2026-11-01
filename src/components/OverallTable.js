import React, { useState, useMemo } from "react";
import { Search, ArrowUpDown, X, ArrowUp, ArrowDown } from "lucide-react";
import Crest from "../crests";

export function OverallTable({ students = [], onClose, onGroupClick, groups = [] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("karma");
  const [sortAsc, setSortAsc] = useState(false);

  const groupColorMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => { map[g.id] = g.color; map[g.name] = g.color; });
    return map;
  }, [groups]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "name" || field === "department" || field === "group_name");
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = students;

    if (query) {
      result = students.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(query)) ||
          (s.muid && s.muid.toLowerCase().includes(query)) ||
          (s.department && s.department.toLowerCase().includes(query)) ||
          (s.group_name && s.group_name.toLowerCase().includes(query))
      );
    }

    return [...result].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [students, search, sortField, sortAsc]);

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="drawer-panel"
        style={{ maxWidth: "860px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Overall Campus Rankings
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Showing {filtered.length} of {students.length} total members
            </p>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close table"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--border)", backgroundColor: "var(--subtle-surface)" }}>
          <div className="search-input-wrapper">
            <span className="search-icon-slot">
              <Search size={14} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, muid, department, or group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="drawer-body" style={{ padding: 0 }}>
          <div className="overall-table-container">
            <table className="ky-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("rank")} style={{ width: "60px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Sl No.
                      {sortField === "rank" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th onClick={() => handleSort("name")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Name
                      {sortField === "name" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th onClick={() => handleSort("muid")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      MUID
                      {sortField === "muid" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th onClick={() => handleSort("department")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Department
                      {sortField === "department" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th onClick={() => handleSort("karma")} style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                      Karma
                      {sortField === "karma" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th onClick={() => handleSort("group_name")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Group
                      {sortField === "group_name" ? (
                        sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, index) => {
                  const groupColor = groupColorMap[student.group_id] || groupColorMap[student.group_name] || "var(--accent)";

                  return (
                    <tr key={student.id || student.user_id || index}>
                      <td className="tabular-nums" style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                        {index + 1}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {student.name || student.full_name}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {student.muid || "N/A"}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {student.department || "N/A"}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                        {student.karma.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="group-badge-line"
                          onClick={() => {
                            if (onGroupClick) onGroupClick(student.group_id);
                            onClose();
                          }}
                        >
                          <Crest group={student.group_name || student.group_id} size="sm" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

