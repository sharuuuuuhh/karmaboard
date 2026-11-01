import { render, screen } from '@testing-library/react';
import Home from './pages/home';

test('renders Karmayodha brand header and stat cards', () => {
  render(<Home />);
  const brandElement = screen.getByText(/Karmayodha/i);
  expect(brandElement).toBeInTheDocument();

  const rankCard = screen.getByText(/Campus Rank/i);
  expect(rankCard).toBeInTheDocument();
});
