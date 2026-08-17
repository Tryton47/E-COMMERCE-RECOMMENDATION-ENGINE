import React from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Headphones', 'Monitor', 'Charger', 'Mouse'];

export const HeroSection = ({ onSearch, loading }) => {
    return (
        /* 
         * IMPORTANT: NO overflow-hidden here so Portal dropdown is not clipped.
         * Background gradients are clipped using their own inner wrapper.
         */
        <div className="relative bg-slate-900 text-white pb-24 pt-20 lg:pt-28">
            {/* Animated Background Blobs (clipped inside own layer) */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-blue-600/25 blur-3xl"
                    style={{ animation: 'pulse 5s ease-in-out infinite' }}
                />
                <div
                    className="absolute top-32 -left-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl"
                    style={{ animation: 'pulse 6s ease-in-out infinite', animationDelay: '1.5s' }}
                />
                <div
                    className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl"
                    style={{ animation: 'pulse 7s ease-in-out infinite', animationDelay: '3s' }}
                />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm text-sm font-medium text-blue-300 mb-6 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                    </span>
                    AI-Powered Hybrid Recommendation Engine
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-indigo-200 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Discover Your Next
                    <br className="hidden sm:block" />
                    {' '}Favorite Product
                </h1>

                {/* Subheading */}
                <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-300/90 mb-10 leading-relaxed animate-fade-in-up px-2" style={{ animationDelay: '0.2s' }}>
                    AI-driven hybrid recommendations tailored just for you — powered by collaborative filtering &amp; deep content analysis.
                </p>

                {/* Search Box */}
                <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-2xl mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Quick Search Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <span className="text-xs font-semibold text-slate-400 mr-1">Popular:</span>
                    {QUICK_TAGS.map((tag, i) => (
                        <button
                            key={tag}
                            onClick={() => onSearch(tag)}
                            className="px-3 py-1 text-xs bg-white/10 hover:bg-indigo-600 hover:text-white
                                     rounded-full transition-all duration-200 border border-white/10 text-slate-300
                                     hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/20
                                     active:scale-95 font-medium"
                            style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Wave Decorator — sits BELOW content in DOM, pointer-events-none */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <svg className="w-full h-10 sm:h-14 lg:h-20 fill-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.52,187.9,109.18Z"></path>
                </svg>
            </div>
        </div>
    );
};
