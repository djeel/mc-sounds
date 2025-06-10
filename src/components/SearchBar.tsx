
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        placeholder="Search sounds..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-3 pl-10 minecraft-button text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-modrinth-green-500 focus:border-modrinth-green-500"
        aria-label="Search sounds"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default SearchBar;
