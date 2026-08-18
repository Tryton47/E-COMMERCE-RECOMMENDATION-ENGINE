import React from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Headphones', 'Monitor', 'Charger', 'Mouse'];

// Maps search query → personalized persona + tagline
const getPersona = (query) => {
    const q = query.toLowerCase();
    if (/phone|iphone|samsung|xiaomi|realme|oppo|vivo|smartphone|mobile/.test(q))
        return { emoji: '📱', label: 'Phone Enthusiast', sub: `Here are the best phones for "${query}"` };
    if (/laptop|macbook|notebook|computer|pc|asus|lenovo|dell|hp/.test(q))
        return { emoji: '💻', label: 'Tech Poweruser', sub: `Top laptops matched for "${query}"` };
    if (/headphone|earphone|earbuds|audio|speaker|airpods|music|sound|wh-/.test(q))
        return { emoji: '🎧', label: 'Audiophile', sub: `Premium audio gear for "${query}"` };
    if (/cable|charger|adapter|usb|gan|powerbank|anker|baseus/.test(q))
        return { emoji: '🔌', label: 'Setup Optimizer', sub: `Best accessories matched for "${query}"` };
    if (/monitor|display|screen|tv|television/.test(q))
        return { emoji: '🖥️', label: 'Workspace Creator', sub: `Top displays curated for "${query}"` };
    if (/mouse|keyboard|trackpad|gaming/.test(q))
        return { emoji: '⌨️', label: 'Productivity Seeker', sub: `Level up your desk for "${query}"` };
    if (/tablet|ipad/.test(q))
        return { emoji: '📟', label: 'Tablet Enthusiast', sub: `Best tablets picked for "${query}"` };
    if (/camera|photo|lens|dslr|mirrorless/.test(q))
        return { emoji: '📷', label: 'Photography Lover', sub: `Top gear curated for "${query}"` };
    return { emoji: '🔍', label: 'Product Explorer', sub: `Smart picks for "${query}"` };
};

export const HeroSection = ({ onSearch, loading, searchQuery, searched }) => {
    const persona = searched && searchQuery ? getPersona(searchQuery) : null;

    return (
        <div
            className="relative text-white border-b border-slate-800/60"
            style={{
                background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%), linear-gradient(180deg, #0d1224 0%, #090d16 100%)',
                paddingTop: searched ? '2.5rem' : '5rem',
                paddingBottom: searched ? '2.5rem' : '4rem',
                transition: 'padding 0.4s ease',
            }}
        >
            {/* Grid texture — scoped to its own layer, won't mask children */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundSize: '32px 32px',
                    backgroundImage:
                        'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    opacity: 0.6,
                }}
            />

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">

                {/* === DYNAMIC PERSONA HEADLINE (after search) === */}
                {persona ? (
                    <div
                        key={searchQuery}
                        style={{ animation: 'fadeSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                        <div className="text-4xl sm:text-5xl mb-3" style={{ lineHeight: 1 }}>
                            {persona.emoji}
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                            {persona.label}
                        </h1>
                        <p className="text-sm text-slate-400 mb-6">{persona.sub}</p>
                    </div>
                ) : (
                    /* === DEFAULT HEADLINE (no search yet) === */
                    <div style={{ animation: 'fadeSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-xs font-semibold text-indigo-300 mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            AI Recommendation Engine
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mb-3">
                            Find Exactly What<br className="hidden sm:block" /> You're Looking For
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg mx-auto mb-7">
                            Smart search powered by hybrid collaborative filtering &amp; AI recommendations.
                        </p>
                    </div>
                )}

                {/* Search Bar — always visible, high contrast */}
                <div
                    className="rounded-xl overflow-visible"
                    style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                        boxShadow: '0 0 0 4px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.5)',
                        padding: '8px',
                    }}
                >
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Quick Tags — only show when not searched */}
                {!searched && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs">
                        <span className="font-medium text-slate-500 mr-1">Popular:</span>
                        {QUICK_TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => onSearch(tag)}
                                className="px-3 py-1 rounded-lg transition-all border text-slate-400 font-medium active:scale-95 hover:text-white hover:border-indigo-500/50"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Inline keyframe for dynamic headline animation */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
