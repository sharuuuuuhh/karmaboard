import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../LeaderboardPage";

describe("LeaderboardPage", () => {
  test("renders LeaderboardPage with time period choosing at the top", () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Leaderboard/i })).toBeInTheDocument();
    // The calendar popover trigger is rendered at the top in PageHeader
    expect(screen.getByTitle(/Click to open calendar/i)).toBeInTheDocument();

    // View switchers
    expect(screen.getByRole("button", { name: /Warriors/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Teams/i })).toBeInTheDocument();

    // 3 Sorts / Filters
    expect(screen.getByRole("tab", { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Teams/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Groups/i })).toBeInTheDocument();
  });

  test("filters leaderboard standings by All, Teams, and Groups", () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    const allTab = screen.getByRole("tab", { name: /All/i });
    const teamsTab = screen.getByRole("tab", { name: /Teams/i });
    const groupsTab = screen.getByRole("tab", { name: /Groups/i });

    // Initially "all" tab is selected
    expect(allTab).toHaveAttribute("aria-selected", "true");

    // Click Teams filter
    fireEvent.click(teamsTab);
    expect(teamsTab).toHaveAttribute("aria-selected", "true");
    expect(allTab).toHaveAttribute("aria-selected", "false");

    // Click Groups filter
    fireEvent.click(groupsTab);
    expect(groupsTab).toHaveAttribute("aria-selected", "true");
    expect(teamsTab).toHaveAttribute("aria-selected", "false");
  });

  test("switching to Teams view renders larger crests without description subtitles", () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    const teamsButton = screen.getByRole("button", { name: /Teams/i });
    fireEvent.click(teamsButton);

    // Should show team names
    expect(screen.getByRole("columnheader", { name: /Team/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Margin \/ Gap/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Total Karma/i })).toBeInTheDocument();

    // The long subtitle descriptions like "Broadcasting, Film Production & Photography" should NOT be present
    expect(screen.queryByText(/Broadcasting, Film Production & Photography/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Editorial, Technical Writing & Narrative Power/i)).not.toBeInTheDocument();
  });
});

