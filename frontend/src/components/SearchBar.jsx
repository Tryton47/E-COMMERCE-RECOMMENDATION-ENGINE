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
        <div className="w-full flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl
                             focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-4
                             focus:ring-blue-500/20 text-white placeholder-slate-400 text-lg transition-all"
                    placeholder="Search for laptops, phones, shoes..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                />
            </div>
            <button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                         hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold shadow-lg shadow-blue-600/30
                         disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed
                         flex items-center justify-center min-w-[140px]"
                onClick={handleSearch}
                disabled={loading}
            >
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Search'}
            </button>
        </div>
    );
};
