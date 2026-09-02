import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';

describe('HomePage', () => {
  it('exposes the primary navigation inside a header landmark', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    const header = screen.getByRole('banner');
    expect(header).toContainElement(screen.getByRole('navigation'));
  });
});
