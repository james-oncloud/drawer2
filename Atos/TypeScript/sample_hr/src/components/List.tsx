import type { ReactNode } from 'react';

/** Generic list — works for Employee, LeaveRequest, or any item type. */
type ListProps<T> = {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
};

export function List<T>({
  items,
  keyExtractor,
  renderItem,
  emptyMessage = 'Nothing to show',
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <ul className="list">
      {items.map((item) => (
        <li key={keyExtractor(item)} className="list__item">
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
