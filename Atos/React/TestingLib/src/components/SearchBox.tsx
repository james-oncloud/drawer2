import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

type SearchBoxProps = {
  onSearch: (query: string) => void;
};

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      aria-label="Search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
