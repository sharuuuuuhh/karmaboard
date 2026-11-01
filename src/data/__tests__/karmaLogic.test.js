import { karmaStore } from "../karmaStore";

describe("Karma Logic - Movement, MVPs, and Inactivity", () => {
  test("computeMovement accurately computes up, down, neutral, and NEW", () => {
    const up = karmaStore.computeMovement(2, 5, "last week");
    expect(up.type).toBe("up");
    expect(up.places).toBe(3);
    expect(up.label).toBe("+3");
    expect(up.tooltip).toBe("was #5 last week");

    const down = karmaStore.computeMovement(6, 2, "last week");
    expect(down.type).toBe("down");
    expect(down.places).toBe(4);
    expect(down.label).toBe("-4");
    expect(down.tooltip).toBe("was #2 last week");

    const neutral = karmaStore.computeMovement(3, 3, "last week");
    expect(neutral.type).toBe("neutral");
    expect(neutral.places).toBe(0);
    expect(neutral.label).toBe("-");

    const brandNew = karmaStore.computeMovement(4, null, "last week");
    expect(brandNew.type).toBe("new");
    expect(brandNew.label).toBe("NEW");
  });

  test("MVP tie-breaking chooses the member who reached the total first", () => {
    const originalEvents = karmaStore.karmaEvents;
    const originalMembers = karmaStore.members;

    const mockMembers = [
      { id: "m1", name: "Alice", group_id: "grp-1", group_name: "Web Development" },
      { id: "m2", name: "Bob", group_id: "grp-1", group_name: "Web Development" },
    ];

    const now = Date.now();
    // Both Alice and Bob earn 100 karma, but Alice reached it 2 hours earlier
    const mockEvents = [
      {
        id: "e1",
        member_id: "m1",
        delta: 100,
        timestamp: new Date(now - 4 * 3600 * 1000).toISOString(),
      },
      {
        id: "e2",
        member_id: "m2",
        delta: 100,
        timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
      },
    ];

    karmaStore.members = mockMembers;
    karmaStore.karmaEvents = mockEvents;

    const mvps = karmaStore.getGroupMVPs(0);
    const webMVP = mvps.find((m) => m.group_id === "grp-1");

    expect(webMVP).toBeDefined();
    expect(webMVP.member_id).toBe("m1"); // Alice won tie-break
    expect(webMVP.name).toBe("Alice");

    // Restore
    karmaStore.members = originalMembers;
    karmaStore.karmaEvents = originalEvents;
  });

  test("Members with 0 karma cannot be MVP", () => {
    const originalEvents = karmaStore.karmaEvents;
    const originalMembers = karmaStore.members;

    karmaStore.members = [
      { id: "m1", name: "Alice", group_id: "grp-1", group_name: "Web Development" },
    ];
    karmaStore.karmaEvents = []; // No events

    const mvps = karmaStore.getGroupMVPs(0);
    expect(mvps.length).toBe(0);

    // Restore
    karmaStore.members = originalMembers;
    karmaStore.karmaEvents = originalEvents;
  });

  test("Inactive members calculation identifies members with 0 karma this week", () => {
    const originalEvents = karmaStore.karmaEvents;
    const originalMembers = karmaStore.members;

    const now = Date.now();
    karmaStore.members = [
      { id: "m1", name: "Active Alice", group_id: "grp-1", group_name: "Web Development" },
      { id: "m2", name: "Inactive Bob", group_id: "grp-1", group_name: "Web Development" },
    ];
    karmaStore.karmaEvents = [
      {
        id: "e1",
        member_id: "m1",
        delta: 50,
        timestamp: new Date(now).toISOString(),
      },
    ];

    const nudges = karmaStore.getNeedsANudge(0);
    const webNudge = nudges.find((n) => n.group_id === "grp-1");

    expect(webNudge).toBeDefined();
    expect(webNudge.inactiveCount).toBe(1);
    expect(webNudge.inactiveMembers[0].name).toBe("Inactive Bob");
    expect(webNudge.discordMessage).toContain("@Inactive");

    // Restore
    karmaStore.members = originalMembers;
    karmaStore.karmaEvents = originalEvents;
  });
});
