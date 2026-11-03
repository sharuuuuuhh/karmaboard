import React from "react";
import { render, screen } from "@testing-library/react";
import Crest from "../Crest";
import { normalizeGroupSlug, getGroupDisplayName, CREST_REGISTRY } from "../../../crests";

describe("Crest Component & Registry", () => {
  test("normalizes group slugs correctly", () => {
    expect(normalizeGroupSlug("LEADS")).toBe("leads");
    expect(normalizeGroupSlug("grp-leads")).toBe("leads");
    expect(normalizeGroupSlug("OPERATIONS")).toBe("operation");
    expect(normalizeGroupSlug("grp-operation")).toBe("operation");
    expect(normalizeGroupSlug("TECH")).toBe("tech");
    expect(normalizeGroupSlug("creative")).toBe("creative");
    expect(normalizeGroupSlug("TECHASHI")).toBe("techashi");
    expect(normalizeGroupSlug("techaschi")).toBe("techashi");
    expect(normalizeGroupSlug("OFFGRID")).toBe("offgrid");
    expect(normalizeGroupSlug("grp-offgrid")).toBe("offgrid");
    expect(normalizeGroupSlug("MuVerse")).toBe("muverse");
  });

  test("returns canonical display names", () => {
    expect(getGroupDisplayName("leads")).toBe("LEADS");
    expect(getGroupDisplayName("operation")).toBe("OPERATION");
    expect(getGroupDisplayName("tech")).toBe("TECH");
    expect(getGroupDisplayName("techashi")).toBe("TECHASHI");
    expect(getGroupDisplayName("offgrid")).toBe("OFFGRID");
    expect(getGroupDisplayName("muverse")).toBe("MuVerse");
  });

  test("renders WebP image for groups with crests (e.g. LEADS)", () => {
    const { container } = render(<Crest group="leads" size="md" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
    expect(img.getAttribute("srcSet")).toContain("128w");
    expect(img.getAttribute("srcSet")).toContain("384w");
    expect(img).toHaveAttribute("alt", "LEADS crest");
    // Visually hidden text for screen readers & sorting
    expect(screen.getByText("LEADS")).toBeInTheDocument();
  });

  test("renders WebP image for TECH with official crest", () => {
    expect(CREST_REGISTRY.tech).not.toBeNull();
    const { container } = render(<Crest group="tech" size="lg" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("width", "72");
    expect(img).toHaveAttribute("height", "72");
    expect(img.getAttribute("srcSet")).toContain("crest-tech-128.webp");
    expect(img.getAttribute("srcSet")).toContain("crest-tech-384.webp");
    expect(screen.getAllByText("TECH").length).toBeGreaterThanOrEqual(1);
  });

  test("renders official crests for TECHASHI, OFFGRID, and MuVerse", () => {
    expect(CREST_REGISTRY.techashi).toBeDefined();
    expect(CREST_REGISTRY.offgrid).toBeDefined();
    expect(CREST_REGISTRY.muverse).toBeDefined();

    const { container: c1 } = render(<Crest group="TECHASHI" size="md" />);
    const img1 = c1.querySelector("img");
    expect(img1).toBeInTheDocument();
    expect(img1.getAttribute("srcSet")).toContain("crest-techashi-128.webp");

    const { container: c2 } = render(<Crest group="OFFGRID" size="md" />);
    const img2 = c2.querySelector("img");
    expect(img2).toBeInTheDocument();
    expect(img2.getAttribute("srcSet")).toContain("crest-offgrid-128.webp");

    const { container: c3 } = render(<Crest group="MuVerse" size="md" />);
    const img3 = c3.querySelector("img");
    expect(img3).toBeInTheDocument();
    expect(img3.getAttribute("srcSet")).toContain("crest-muverse-128.webp");
  });

  test("renders small colored dot when size is under 28px", () => {
    const { container } = render(<Crest group="creative" size={16} />);
    const dotWrap = container.querySelector(".crest-dot");
    expect(dotWrap).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).not.toBeInTheDocument();
    expect(screen.getByText("CREATIVE")).toBeInTheDocument();
  });
});
