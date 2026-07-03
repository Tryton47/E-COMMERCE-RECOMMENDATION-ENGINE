import React, { useState } from 'react';

export const SearchBar = ({ onSearch, loading }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        if (query.trim()) {
            onSearch(query);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full mb-8">
            <div className="flex gap-3">
                <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:border-blue-500 focus:ring-2 
                             focus:ring-blue-200 text-lg"
                    placeholder="Search products... (e.g., Samsung Galaxy, Laptop Gaming)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                />
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-colors font-semibold
                             disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </div>
    );
};
