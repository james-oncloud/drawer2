import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../../components/Dashboard';

vi.mock('../../components/ExpensiveChart', () => ({
  ExpensiveChart: () => <div data-testid="chart-stub">Chart stub</div>,
}));

describe('9. Child component mock', () => {
  it('renders dashboard without mounting the real chart', () => {
    render(<Dashboard metrics={[1, 2, 3]} />);

    expect(screen.getByTestId('chart-stub')).toBeInTheDocument();
    expect(screen.queryByTestId('expensive-chart')).not.toBeInTheDocument();
  });
});
