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
                top: rect.bottom + 6,
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

    // Clean, Simple, Text-Only Search Suggestions Dropdown (Google / Spotlight style)
    const dropdown = showDropdown && suggestions.length > 0 && createPortal(
        <div
            style={{
                ...dropdownStyle,
                backgroundColor: '#0f172a', // Solid dark slate (no faint gradient washout)
                borderColor: '#334155',
            }}
            className="border rounded-xl shadow-2xl overflow-hidden animate-fade-in text-left divide-y divide-slate-800"
        >
            {/* Header bar */}
            <div className="px-4 py-2 bg-slate-900/90 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Top Suggestions
                </span>
                <span className="text-slate-500 text-[10px] hidden sm:inline">Use ↑↓ keys to navigate</span>
            </div>

            {/* Suggestions list (Text-only, clean & crisp) */}
            {suggestions.map((item, idx) => {
                const name = item.name || item.product_name || 'Product';
                const category = (item.category || 'Electronics').split('|')[0].trim();
                const price = formatPrice(item);
                const isActive = idx === activeIndex;

                return (
                    <div
                        key={item.product_id || idx}
                        onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                        className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors duration-150 ${
                            isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 text-slate-100 hover:bg-slate-800/80 hover:text-white'
                        }`}
                    >
                        {/* Left: Search Icon + Title + Category */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <svg className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            
                            <span className="text-sm font-semibold truncate text-white leading-snug">
                                {name}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 uppercase tracking-wide ${
                                isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                            }`}>
                                {category}
                            </span>
                        </div>

                        {/* Right: Price */}
                        {price && (
                            <div className="flex-shrink-0 text-right">
                                <span className={`text-sm font-bold ${isActive ? 'text-emerald-200' : 'text-emerald-400'}`}>
                                    {price}
                                </span>
                            </div>
                        )}
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
                    className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl
                             focus:outline-none focus:bg-slate-900 focus:border-indigo-500 focus:ring-2
                             focus:ring-indigo-500/30 text-white placeholder-slate-400 text-base
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-bold"
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Search Button */}
            <button
                className="px-6 sm:px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl
                         transition-all duration-200 font-semibold shadow-md shadow-indigo-600/30
                         disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 min-w-[120px] sm:min-w-[130px]
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
