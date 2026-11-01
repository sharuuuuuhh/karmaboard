import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GroupDetailPage from "../GroupDetailPage";

describe("GroupDetailPage", () => {
  test("renders for /groups/grp-leads without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/groups/grp-leads"]}>
        <Routes>
          <Route path="/groups/:id" element={<GroupDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /LEADS/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Click to open calendar/i)).toBeInTheDocument();

    // Click calendar popover trigger to reveal Weekly / Monthly / All Time tabs
    fireEvent.click(screen.getByTitle(/Click to open calendar/i));
    expect(screen.getByText(/Weekly/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/All Time/i)).toBeInTheDocument();

    expect(screen.getByText(/Campus Standing/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Target Pace/i)).toBeInTheDocument();
    expect(screen.getByText(/Roster Engagement/i)).toBeInTheDocument();
  });

  test("renders for /groups/grp-tech without crashing", () => {
    render(
      <MemoryRouter initialEntries={["/groups/grp-tech"]}>
        <Routes>
          <Route path="/groups/:id" element={<GroupDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /TECH/i })).toBeInTheDocument();
    expect(screen.getByTitle(/Click to open calendar/i)).toBeInTheDocument();
  });
});
