import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ActivityPage from "../ActivityPage";

describe("ActivityPage", () => {
  test("renders ActivityPage with dark theme and top crest filter bar", () => {
    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Campus Activity/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by All Teams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Filter by TECH$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Filter by LEADS$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Filter by TECHASHI$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Filter by OFFGRID$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by name or task/i)).toBeInTheDocument();
  });

  test("clicking a team crest filters the activity feed and shows solid dark spotlight", () => {
    render(
      <MemoryRouter>
        <ActivityPage />
      </MemoryRouter>
    );

    const techButton = screen.getByLabelText(/^Filter by TECH$/i);
    fireEvent.click(techButton);

    // Spotlight card should now appear
    expect(screen.getByText(/SPOTLIGHT/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear Filter/i })).toBeInTheDocument();

    // Clicking Clear Filter reverts back to All Teams
    fireEvent.click(screen.getByRole("button", { name: /Clear Filter/i }));
    expect(screen.queryByText(/SPOTLIGHT/i)).not.toBeInTheDocument();
  });
});
