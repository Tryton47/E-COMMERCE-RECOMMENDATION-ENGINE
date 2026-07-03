import React from 'react';
import { SearchBar } from './SearchBar';

export const HeroSection = ({ onSearch, loading }) => {
    return (
        <div className="relative overflow-hidden bg-slate-900 text-white pb-20 pt-24 lg:pt-32">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/30 blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-purple-600/30 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center animate-fade-in-up">
                <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm text-sm font-medium text-blue-300 mb-6">
                    ✨ Advanced Recommendation Engine
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
                    Discover Your Next
                    <br className="hidden md:block" /> Favorite Product
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-slate-300 mb-12">
                    Experience AI-driven hybrid recommendations tailored just for you based on deep content analysis and collaborative filtering.
                </p>

                <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>
            </div>
            
            {/* Wave Decorator */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full h-12 lg:h-24 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.52,187.9,109.18Z"></path>
                </svg>
            </div>
        </div>
    );
};
