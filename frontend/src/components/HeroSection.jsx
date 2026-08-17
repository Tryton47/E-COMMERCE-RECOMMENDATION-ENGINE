import React from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Headphones', 'Monitor', 'Charger', 'Mouse'];

export const HeroSection = ({ onSearch, loading }) => {
    return (
        <div className="relative pt-16 pb-16 lg:pt-24 lg:pb-20 text-white border-b border-slate-800/60"
             style={{ background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 70%, #0a0e1a 100%)' }}>
            
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Content */}
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    E-Commerce AI Recommendation System
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-white leading-tight">
                    Smart Product Discovery Engine
                </h1>

                {/* Subtitle */}
                <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-300 mb-8 leading-relaxed font-normal">
                    Find products instantly with hybrid collaborative &amp; content-based machine learning recommendations.
                </p>

                {/* Search Bar Container */}
                <div className="max-w-2xl mx-auto bg-slate-900/80 p-2 sm:p-3 rounded-2xl border border-slate-700/80 shadow-2xl mb-5">
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Quick Search Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400 mr-1">Popular:</span>
                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onSearch(tag)}
                            className="px-3 py-1 bg-slate-800/80 hover:bg-indigo-600 hover:text-white
                                     rounded-lg transition-colors border border-slate-700/80 text-slate-300
                                     font-medium active:scale-95"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
