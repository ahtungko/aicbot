import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays welcome message when no conversation is selected', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to AICBot/i)).toBeInTheDocument();
  });
});
