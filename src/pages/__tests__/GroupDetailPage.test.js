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

    // Click calendar popover trigger to reveal Monthly / All Time tabs (Weekly is removed)
    fireEvent.click(screen.getByTitle(/Click to open calendar/i));
    expect(screen.queryByRole("button", { name: /^Weekly$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Monthly$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^All Time$/i })).toBeInTheDocument();

    expect(screen.getAllByText(/Campus Standing/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Team Target Pace/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Roster Engagement/i)[0]).toBeInTheDocument();
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
