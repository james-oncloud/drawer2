type ExpensiveChartProps = {
  data: number[];
};

// Stand-in for a heavy child — often mocked to keep parent tests fast and focused.
export function ExpensiveChart({ data }: ExpensiveChartProps) {
  return (
    <div data-testid="expensive-chart">
      Chart with {data.length} points
    </div>
  );
}
