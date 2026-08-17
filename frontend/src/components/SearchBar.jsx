import React, { useState, useEffect, useRef } from 'react';
import { localSearchProducts } from '../utils/localRecommender';

export const SearchBar = ({ onSearch, loading }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef(null);

    // Live search suggestions (Top 5)
    useEffect(() => {
        if (query.trim().length >= 1) {
            const res = localSearchProducts(query, 5);
            if (res && res.results) {
                setSuggestions(res.results.slice(0, 5));
                setShowDropdown(true);
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery = query) => {
        if (searchQuery.trim()) {
            setShowDropdown(false);
            onSearch(searchQuery);
        }
    };

    const handleSelectSuggestion = (item) => {
        const selectedText = item.name || item.product_name || query;
        setQuery(selectedText);
        setShowDropdown(false);
        onSearch(selectedText);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatPrice = (p) => {
        const val = p.price || p.discounted_price || p.actual_price;
        if (typeof val === 'number' && !isNaN(val)) return `$${val.toFixed(2)}`;
        if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            if (!isNaN(num)) return `$${num.toFixed(2)}`;
        }
        return '$49.99';
    };

    return (
        <div ref={containerRef} className="w-full relative flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <input
                    type="text"
                    className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-xl
                             focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-4
                             focus:ring-blue-500/20 text-white placeholder-slate-400 text-lg transition-all"
                    placeholder="Search for laptops, phones, headphones, chargers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 1 && suggestions.length > 0 && setShowDropdown(true)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                />

                {query && (
                    <button
                        onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full text-xs font-bold"
                    >
                        ✕
                    </button>
                )}

                {/* Google-style Top 5 Autocomplete Dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in text-left divide-y divide-white/5">
                        <div className="px-4 py-2 bg-white/5 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                            <span>Top 5 Recommendations</span>
                            <span className="text-indigo-400">Press Enter or Click</span>
                        </div>
                        {suggestions.map((item, idx) => {
                            const name = item.name || item.product_name;
                            const category = (item.category || 'Tech').split('|')[0];
                            return (
                                <div
                                    key={item.product_id || idx}
                                    onClick={() => handleSelectSuggestion(item)}
                                    className="px-4 py-3 hover:bg-indigo-600/30 transition-all cursor-pointer flex items-center gap-3 group"
                                >
                                    <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center p-1">
                                        <img 
                                            src={item.img_link || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'} 
                                            alt={name}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'; }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/20">
                                                {category}
                                            </span>
                                            {item.rating && (
                                                <span className="text-xs text-amber-400 font-medium flex items-center gap-0.5">
                                                    ★ {parseFloat(item.rating).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors mt-0.5">
                                            {name}
                                        </p>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <span className="text-sm font-bold text-emerald-400 block">
                                            {formatPrice(item)}
                                        </span>
                                        <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                         hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold shadow-lg shadow-blue-600/30
                         disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed
                         flex items-center justify-center min-w-[140px]"
                onClick={() => handleSearch()}
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
