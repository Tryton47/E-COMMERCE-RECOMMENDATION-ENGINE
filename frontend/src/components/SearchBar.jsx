import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getTopAutocompleteSuggestions } from '../utils/localRecommender';

export const SearchBar = ({ onSearch, loading }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const inputWrapRef = useRef(null);
    const containerRef = useRef(null);

    // Position dropdown absolutely relative to viewport (escapes overflow-hidden)
    const updateDropdownPosition = () => {
        if (inputWrapRef.current) {
            const rect = inputWrapRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
    };

    // Live search suggestions (Top 5)
    useEffect(() => {
        if (query.trim().length >= 1) {
            const res = getTopAutocompleteSuggestions(query, 5);
            if (res && res.results && res.results.length > 0) {
                setSuggestions(res.results.slice(0, 5));
                setShowDropdown(true);
                setActiveIndex(-1);
                updateDropdownPosition();
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [query]);

    // Update position on scroll/resize
    useEffect(() => {
        if (showDropdown) {
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);
            return () => {
                window.removeEventListener('scroll', updateDropdownPosition, true);
                window.removeEventListener('resize', updateDropdownPosition);
            };
        }
    }, [showDropdown]);

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
            onSearch(searchQuery.trim());
        }
    };

    const handleSelectSuggestion = (item) => {
        const selectedText = item.name || item.product_name || query;
        setQuery(selectedText);
        setShowDropdown(false);
        onSearch(selectedText);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) {
            if (e.key === 'Enter') handleSearch();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                handleSelectSuggestion(suggestions[activeIndex]);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const formatPrice = (p) => {
        const val = p.price || p.discounted_price || p.actual_price;
        if (typeof val === 'number' && !isNaN(val) && val > 0) return `$${val.toFixed(2)}`;
        if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            if (!isNaN(num) && num > 0) return `$${num.toFixed(2)}`;
        }
        return null;
    };

    // Portal dropdown — renders outside the overflow-hidden hero section
    const dropdown = showDropdown && suggestions.length > 0 && createPortal(
        <div
            style={dropdownStyle}
            className="bg-slate-900/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-left divide-y divide-white/5"
        >
            <div className="px-4 py-2 bg-white/5 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Top {suggestions.length} Suggestions
                </span>
                <span className="text-indigo-400 hidden sm:block">↑↓ Navigate · Enter Select · Esc Close</span>
            </div>
            {suggestions.map((item, idx) => {
                const name = item.name || item.product_name || 'Product';
                const category = (item.category || 'Tech').split('|')[0];
                const price = formatPrice(item);
                const isActive = idx === activeIndex;
                return (
                    <div
                        key={item.product_id || idx}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                        className={`px-4 py-3 cursor-pointer flex items-center gap-3 group transition-all duration-150 ${
                            isActive ? 'bg-indigo-600/50' : 'hover:bg-white/5'
                        }`}
                    >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center p-0.5">
                            <img
                                src={item.img_link || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                                alt={name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'; }}
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/20 whitespace-nowrap">
                                    {category}
                                </span>
                                {item.rating && (
                                    <span className="text-[10px] text-amber-400 font-semibold whitespace-nowrap">
                                        ★ {parseFloat(item.rating).toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm font-medium truncate leading-snug ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'} transition-colors`}>
                                {name}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 text-right">
                            {price && (
                                <span className="text-sm font-bold text-emerald-400 block">
                                    {price}
                                </span>
                            )}
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 ml-auto transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>,
        document.body
    );

    return (
        <div ref={containerRef} className="w-full flex flex-col sm:flex-row gap-3">
            {/* Input wrapper */}
            <div ref={inputWrapRef} className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className={`h-5 w-5 transition-colors duration-200 ${query ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <input
                    type="text"
                    className="w-full pl-11 pr-10 py-4 bg-white/10 border border-white/20 rounded-xl
                             focus:outline-none focus:bg-white/15 focus:border-indigo-400/60 focus:ring-4
                             focus:ring-indigo-500/20 text-white placeholder-slate-400 text-base
                             transition-all duration-200"
                    placeholder="Search laptops, phones, headphones..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim().length >= 1 && suggestions.length > 0) {
                            updateDropdownPosition();
                            setShowDropdown(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    autoComplete="off"
                />

                {/* Clear button */}
                {query && (
                    <button
                        onMouseDown={(e) => { e.preventDefault(); setQuery(''); setSuggestions([]); setShowDropdown(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/20 transition-all text-xs font-bold"
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Search Button */}
            <button
                className="px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                         hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all duration-200
                         font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40
                         disabled:from-slate-600 disabled:to-slate-700 disabled:shadow-none disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 min-w-[120px] sm:min-w-[140px]
                         text-sm sm:text-base"
                onClick={() => handleSearch()}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching…</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Search</span>
                    </>
                )}
            </button>

            {/* Portal Dropdown */}
            {dropdown}
        </div>
    );
};
