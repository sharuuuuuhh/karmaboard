import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { karmaStore } from "../../data/karmaStore";
import Crest from "../../crests";

export default function SearchExpand() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const allMembers = useMemo(
    () => (karmaStore.getAllMembers ? karmaStore.getAllMembers() : karmaStore.members || []),
    []
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allMembers
      .filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.muid && m.muid.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [allMembers, query]);

  const handleSelect = (muid) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/u/${encodeURIComponent(muid)}`);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <style>{`
        @media (max-width: 480px) {
          .search-expand-bar-open {
            width: min(240px, calc(100vw - 80px)) !important;
          }
          .search-expand-dropdown-responsive {
            width: min(280px, calc(100vw - 32px)) !important;
            right: 0 !important;
          }
        }
      `}</style>
      <div
        className={isOpen ? "search-expand-bar-open" : ""}
        style={{
          display: "flex",
          alignItems: "center",
          height: 38,
          borderRadius: "var(--radius-pill)",
          border: "1px solid var(--border)",
          background: "#FFFFFF",
          padding: isOpen ? "0 10px 0 14px" : "0",
          width: isOpen ? 260 : 38,
          transition: "width 0.22s cubic-bezier(0.16, 1, 0.3, 1), padding 0.22s ease",
          boxShadow: isOpen ? "var(--shadow-dropdown)" : "none",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}
          title="Search members by name or MUID"
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        {isOpen && (
          <>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search name or MUID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                fontFamily: "inherit",
                color: "var(--text-primary)",
                padding: "0 6px",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Live Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          className="search-expand-dropdown-responsive"
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 280,
            background: "#FFFFFF",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-tile)",
            boxShadow: "var(--shadow-dropdown)",
            zIndex: 1000,
            overflow: "hidden",
            padding: "6px",
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                fontSize: 12,
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              No results found
            </div>
          ) : (
            results.map((m) => (
              <div
                key={m.muid || m.id}
                onClick={() => handleSelect(m.muid)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--pastel-tech)",
                    color: "var(--ink-tech)",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(m.name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {m.muid}
                  </div>
                </div>
                <Crest group={m.group_name || m.group_id} size="xs" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

