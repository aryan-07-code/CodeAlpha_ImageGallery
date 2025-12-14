import React from 'react';
import { Category } from '../types';

interface FilterBarProps {
  categories: Category[];
  activeCategory: Category;
  onSelect: (cat: Category) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-down">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out
            border
            ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 hover:text-white'
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};