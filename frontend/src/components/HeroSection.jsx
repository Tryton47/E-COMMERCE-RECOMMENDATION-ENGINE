import React from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Headphones', 'Monitor', 'Charger', 'Mouse'];

export const HeroSection = ({ onSearch, loading }) => {
    return (
        <div className="relative pt-16 pb-16 lg:pt-24 lg:pb-20 text-white bg-grid-pattern bg-radial-mask border-b border-slate-800/80">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[18rem] bg-indigo-600/15 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
                {/* Minimalist Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/70 text-xs font-semibold text-indigo-300 mb-6 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    AI Recommendation Engine
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
                    Find Exactly What You're Looking For
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-lg mx-auto mb-8">
                    Smart search and personal recommendations powered by hybrid collaborative filtering.
                </p>

                {/* Prominent Search Bar Container */}
                <div className="max-w-2xl mx-auto bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl mb-6">
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Quick Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500 mr-1">Popular:</span>
                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onSearch(tag)}
                            className="px-3 py-1 bg-slate-900/80 hover:bg-indigo-600 hover:text-white
                                     rounded-lg transition-all border border-slate-800 text-slate-300
                                     font-medium active:scale-95 text-xs shadow-xs"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
