import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TermsPage from "../TermsPage";
import PrivacyPage from "../PrivacyPage";
import Footer from "../../components/shell/Footer";

describe("Legal Pages and Footer", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  test("renders TermsPage with title and community sections", () => {
    render(
      <MemoryRouter initialEntries={["/terms"]}>
        <Routes>
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Terms & Conditions/i })).toBeInTheDocument();
    expect(screen.getAllByText(/About Karmayodha/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Eligibility & Accounts/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Karma Points & Leaderboards/i).length).toBeGreaterThan(0);
    expect(document.title).toBe("Terms & Conditions | Karmayodha");
  });

  test("renders PrivacyPage with title and transparency sections", () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <Routes>
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Information We Display & Collect/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/No Selling of Personal Data/i).length).toBeGreaterThan(0);
    expect(document.title).toBe("Privacy Policy | Karmayodha");
  });

  test("renders Footer with minimal links and current year", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText(/Terms & Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()} Karmayodha`, "i"))).toBeInTheDocument();
  });
});

