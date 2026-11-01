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

