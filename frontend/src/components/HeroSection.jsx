import React, { useState } from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Headphones', 'Monitor', 'Charger', 'Mouse'];

const VECTOR_NODES = [
    { label: 'iPhone 15 Pro', score: '0.96 Sim', x: 20, y: 30 },
    { label: 'AirPods Max', score: '0.92 Sim', x: 80, y: 25 },
    { label: 'USB-C GaN 65W', score: '0.88 Sim', x: 50, y: 85 }
];

export const HeroSection = ({ onSearch, loading }) => {
    const [activeNode, setActiveNode] = useState(0);

    return (
        <div className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 text-white bg-grid-pattern bg-radial-mask border-b border-slate-800">
            {/* Ambient Lighting */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[45rem] h-[22rem] bg-indigo-600/10 blur-[130px] rounded-full"></div>
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Header Badge */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-xs font-medium text-indigo-300 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        AI Vector Hybrid Recommender System
                    </div>
                </div>

                {/* Main Headline */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
                        Search &amp; AI Recommendations <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-emerald-300">
                            Engineered for Precision
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-xl mx-auto">
                        Powered by collaborative filtering and content-based embedding vectors for ultra-fast matching.
                    </p>
                </div>

                {/* Interactive AI Vector Graph Widget */}
                <div className="max-w-2xl mx-auto mb-10 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Vector Embeddings Radar</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                            Latency: &lt;12ms
                        </span>
                    </div>

                    {/* Node Graph Area */}
                    <div className="relative h-44 w-full bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
                        {/* SVG Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" className="animate-dash-flow" />
                            <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" className="animate-dash-flow" />
                            <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" className="animate-dash-flow" />
                        </svg>

                        {/* Central Query Node */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/40 animate-radar-pulse">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold text-indigo-300 mt-1 bg-slate-900/90 px-2 py-0.5 rounded border border-indigo-500/30">
                                User Input Query
                            </span>
                        </div>

                        {/* Recommendation Result Nodes */}
                        {VECTOR_NODES.map((node, i) => {
                            const isSelected = activeNode === i;
                            return (
                                <div
                                    key={node.label}
                                    onClick={() => { setActiveNode(i); onSearch(node.label); }}
                                    className={`absolute z-20 cursor-pointer transition-all duration-200 flex items-center gap-2 p-1.5 px-2.5 rounded-lg border ${
                                        isSelected
                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105'
                                            : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:text-white'
                                    }`}
                                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    <span className="text-[11px] font-semibold">{node.label}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-indigo-700 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'}`}>
                                        {node.score}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Search Bar Component */}
                <div className="max-w-2xl mx-auto mb-6">
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400 mr-1">Popular Keywords:</span>
                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onSearch(tag)}
                            className="px-3 py-1 bg-slate-900 hover:bg-indigo-600 hover:text-white
                                     rounded-lg transition-all border border-slate-800 text-slate-300
                                     font-medium active:scale-95 text-xs"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
