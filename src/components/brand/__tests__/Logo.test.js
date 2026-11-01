import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Logo, { MARK_SIZES, WARRIOR_MARK_PATH } from "../Logo";

describe("Logo Component", () => {
  test("renders the warrior mark SVG with correct path", () => {
    const { container } = render(
      <BrowserRouter>
        <Logo variant="mark" size="md" />
      </BrowserRouter>
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", String(MARK_SIZES.md));
    expect(svg).toHaveAttribute("height", String(MARK_SIZES.md));
    expect(svg).toHaveAttribute("aria-label", "Karmayodha");

    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", WARRIOR_MARK_PATH);
  });

  test("renders wordmark in horizontal mode and links to home", () => {
    render(
      <BrowserRouter>
        <Logo variant="horizontal" size="sm" />
      </BrowserRouter>
    );

    const link = screen.getByRole("link", { name: /karmayodha home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
    expect(screen.getByText("KARMAYODHA")).toBeInTheDocument();
  });

  test("hides wordmark when variant is mark", () => {
    render(
      <BrowserRouter>
        <Logo variant="mark" size="lg" />
      </BrowserRouter>
    );

    expect(screen.queryByText("KARMAYODHA")).not.toBeInTheDocument();
  });

  test("renders tone dark with near-black color and light with white", () => {
    const { container: darkContainer } = render(
      <BrowserRouter>
        <Logo variant="mark" tone="dark" />
      </BrowserRouter>
    );
    const darkWrapper = darkContainer.querySelector(".karmayodha-logo-container");
    expect(darkWrapper.style.color).toBe("rgb(24, 24, 27)");

    const { container: lightContainer } = render(
      <BrowserRouter>
        <Logo variant="mark" tone="light" />
      </BrowserRouter>
    );
    const lightWrapper = lightContainer.querySelector(".karmayodha-logo-container");
    expect(lightWrapper.style.color).toBe("rgb(255, 255, 255)");
  });
});
