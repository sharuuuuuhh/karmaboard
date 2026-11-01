import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GroupsPage from "../GroupsPage";
import { isOfficialTeam } from "../../utils/groupTokens";

describe("isOfficialTeam helper", () => {
  test("identifies the 7 fixed official teams correctly", () => {
    const officialTeams = [
      "leads",
      "tech",
      "creative",
      "media",
      "content",
      "operation",
      "marketing",
      "LEADS",
      "TECH",
      "CREATIVE",
      "MEDIA",
      "CONTENT",
      "OPERATION",
      "MARKETING",
      "grp-leads",
      "grp-tech",
      "grp-creative",
      "grp-media",
      "grp-content",
      "grp-operation",
      "grp-marketing",
    ];

    officialTeams.forEach((team) => {
      expect(isOfficialTeam(team)).toBe(true);
      expect(isOfficialTeam({ name: team })).toBe(true);
      expect(isOfficialTeam({ id: team })).toBe(true);
    });
  });

  test("returns false for non-official groups (SFC, MuVerse, etc.)", () => {
    const otherGroups = ["SFC", "MuVerse", "Coding Club", "Robotics", "grp-sfc"];
    otherGroups.forEach((grp) => {
      expect(isOfficialTeam(grp)).toBe(false);
      expect(isOfficialTeam({ name: grp })).toBe(false);
      expect(isOfficialTeam({ id: grp })).toBe(false);
    });
  });
});

describe("GroupsPage Filter Tabs", () => {
  test("renders All, Teams, and Groups filter buttons", () => {
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /teams/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /groups/i })).toBeInTheDocument();
  });

  test("switching between All, Teams, and Groups updates the view", () => {
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>
    );

    const teamsTab = screen.getByRole("tab", { name: /teams/i });
    fireEvent.click(teamsTab);
    expect(teamsTab).toHaveAttribute("aria-selected", "true");

    const groupsTab = screen.getByRole("tab", { name: /groups/i });
    fireEvent.click(groupsTab);
    expect(groupsTab).toHaveAttribute("aria-selected", "true");

    const allTab = screen.getByRole("tab", { name: /all/i });
    fireEvent.click(allTab);
    expect(allTab).toHaveAttribute("aria-selected", "true");
  });
});

