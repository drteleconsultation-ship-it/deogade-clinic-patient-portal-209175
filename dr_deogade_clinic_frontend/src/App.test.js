import { render, screen } from '@testing-library/react';
import App from './App';

test('renders booking section', () => {
  render(<App />);
  const sectionTitle = screen.getByText(/Choose your slot/i);
  expect(sectionTitle).toBeInTheDocument();
});
