
import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  favoritesCount: number;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  favoritesCount,
}) => {
  const allCategories = ['favorites', ...categories];

  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2" role="tablist" aria-label="Sound categories">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`tab-button ${activeCategory === category ? 'active' : ''}`}
            role="tab"
            aria-selected={activeCategory === category}
            aria-controls={`panel-${category}`}
          >
            {category === 'favorites' ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                Favorites {favoritesCount > 0 && `(${favoritesCount})`}
              </span>
            ) : (
              <span className="capitalize">{category}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CategoryTabs;
