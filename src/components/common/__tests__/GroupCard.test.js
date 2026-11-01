import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GroupCard from "../GroupCard";

describe("GroupCard Component", () => {
  const sampleGroup = {
    id: "grp-leads",
    name: "LEADS",
    karma: 800,
    member_count: 6,
    overallRank: 1,
  };

  test("renders full card variant with solid background, hero crest, and rank tag", () => {
    render(
      <MemoryRouter>
        <GroupCard group={sampleGroup} rank={1} variant="full" />
      </MemoryRouter>
    );

    // Rank tag
    expect(screen.getByText("#1")).toBeInTheDocument();

    // Team name
    expect(screen.getByText("LEADS")).toBeInTheDocument();

    // Karma number
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("KARMA THIS WEEK")).toBeInTheDocument();

    // Goal reached status (800 / 360 > 100%)
    expect(screen.getByText("Goal reached")).toBeInTheDocument();
    expect(screen.getByText("VIEW TEAM")).toBeInTheDocument();
  });

  test("renders zero karma card with 'Not started yet' status", () => {
    render(
      <MemoryRouter>
        <GroupCard
          group={{ id: "grp-tech", name: "TECH", karma: 0, member_count: 6 }}
          rank={2}
          variant="full"
        />
      </MemoryRouter>
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Not started yet")).toBeInTheDocument();
  });

  test("renders compact card variant for Home Top Groups", () => {
    render(
      <MemoryRouter>
        <GroupCard group={sampleGroup} rank={1} variant="compact" />
      </MemoryRouter>
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("LEADS")).toBeInTheDocument();
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("+800")).toBeInTheDocument();
  });
});

