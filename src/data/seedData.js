/**
 * Karmayodha - Official Group Palette & Color Mapping
 * Real Groups: TECH, LEADS, OPERATION, MEDIA, MARKETING, CONTENT, CREATIVE
 * "Apple Sports + Liquid Glass" palette:
 * TECH #7C7CFF, LEADS #FF4D6D, OPERATION #FFB020, MEDIA #4CD6FF, MARKETING #3DDC84, CONTENT #FF7A3D, CREATIVE #C77DFF
 */

export const REAL_GROUPS = [
  { id: "grp-tech", name: "TECH", color: "#7C7CFF" },
  { id: "grp-leads", name: "LEADS", color: "#FF4D6D" },
  { id: "grp-operation", name: "OPERATION", color: "#FFB020" },
  { id: "grp-media", name: "MEDIA", color: "#4CD6FF" },
  { id: "grp-marketing", name: "MARKETING", color: "#3DDC84" },
  { id: "grp-content", name: "CONTENT", color: "#FF7A3D" },
  { id: "grp-creative", name: "CREATIVE", color: "#C77DFF" },
];

export const GROUPS = REAL_GROUPS;

export const GROUP_COLOR_MAP = {
  TECH: "#7C7CFF",
  LEADS: "#FF4D6D",
  OPERATION: "#FFB020",
  MEDIA: "#4CD6FF",
  MARKETING: "#3DDC84",
  CONTENT: "#FF7A3D",
  CREATIVE: "#C77DFF",
  TECHASHI: "#8C1D30",
  TECHASCHI: "#8C1D30",
  OFFGRID: "#00BCD4",
  MUVERSE: "#2563EB",
};

export const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EEE", "IT"];

export function generateSeedData() {
  return {
    groups: REAL_GROUPS,
    members: [],
    karmaEvents: [],
    lastSyncedAt: new Date().toISOString(),
    groupGoals: {},
    polls: [],
  };
}
