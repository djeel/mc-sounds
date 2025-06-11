import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  favoritesCount: number;
  onPlayCategory?: (category: string) => void;
  isSequentialMode?: boolean;
  onStopSequential?: () => void;
  currentSequentialCategory?: string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  favoritesCount,
  onPlayCategory,
  isSequentialMode = false,
  onStopSequential,
  currentSequentialCategory,
}) => {
  const allCategories = ['favorites', ...categories];

  const handlePlayCategory = (category: string) => {
    if (category === 'favorites') return; // Ne pas permettre la lecture séquentielle des favoris
    onPlayCategory?.(category);
  };

  const handleStopSequential = () => {
    onStopSequential?.();
  };

  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2" role="tablist" aria-label="Sound categories">
        {allCategories.map((category) => (
          <div key={category} className="flex items-center gap-0">
            <button
              onClick={() => onCategoryChange(category)}
              className={`tab-button ${activeCategory === category ? 'active dark:bg-primary dark:text-white dark:border-primary' : ''} flex items-center justify-center h-10 min-w-[120px] rounded-none rounded-l`}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`panel-${category}`}
              style={activeCategory === category ? { borderTopRightRadius: 0, borderBottomRightRadius: 0, ...(document.documentElement.classList.contains('dark') ? { backgroundColor: '#1BD96A', color: '#fff', borderColor: '#1BD96A', boxShadow: 'none', outline: 'none' } : {}) } : { borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
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
            {/* SUPPRIME le bouton de lecture séquentielle */}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default CategoryTabs;
