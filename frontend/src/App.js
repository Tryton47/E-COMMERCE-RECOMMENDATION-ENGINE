import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { searchProducts, getRecommendations, pingBackend } from './api';

function App() {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searched, setSearched] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isFallbackMode, setIsFallbackMode] = useState(false);

    // Warm up backend on page load
    useEffect(() => {
        pingBackend();
    }, []);

    const handleSearch = async (query) => {
        if (!query || !query.trim()) return;
        setLoading(true);
        setSearchQuery(query.trim());
        setSearched(true);
        setApiError(null);
        setIsFallbackMode(false);
        // Scroll to results
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const result = await searchProducts(query.trim(), 12);
            setApiError(null);

            if (result && result.isLocalFallback) {
                setIsFallbackMode(true);
            }

            if (result && result.results) {
                setSelectedProducts(result.results);

                if (result.results.length > 0) {
                    const firstProductId = result.results[0].product_id;
                    const recResult = await getRecommendations(firstProductId, 5);
                    if (recResult && recResult.recommendations) {
                        setRecommendations(recResult.recommendations);
                    }
                } else {
                    setRecommendations([]);
                }
            } else if (result && result.status === 'error') {
                setApiError(result.message || 'Error occurred while searching.');
            }
        } catch (error) {
            console.error('Search failed:', error);
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocal) {
                setApiError('Cannot connect to backend. Please ensure the server is running on port 8000.');
            } else {
                setApiError('Unable to connect to live API server. Switched to offline demo mode.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (productId) => {
        setLoading(true);
        setApiError(null);
        try {
            const recResult = await getRecommendations(productId, 5);
            if (recResult && recResult.recommendations) {
                setRecommendations(recResult.recommendations);
                if (recResult.isLocalFallback) setIsFallbackMode(true);
                setTimeout(() => {
                    const el = document.getElementById('recommendations');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Failed to get recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Hero */}
            <HeroSection onSearch={handleSearch} loading={loading} />

            {/* Main content */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                {/* Demo Mode Banner */}
                {isFallbackMode && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            <div>
                                <p className="text-sm font-bold">⚡ Demo Mode — API Warming Up</p>
                                <p className="text-xs text-amber-700 mt-0.5">Showing local fallback results while backend serverless warms up.</p>
                            </div>
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => handleSearch(searchQuery)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex-shrink-0"
                            >
                                🔄 Retry Live API
                            </button>
                        )}
                    </div>
                )}

                {/* Error Banner */}
                {apiError && !isFallbackMode && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">{apiError}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearch(searchQuery)}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Retry
                                </button>
                            )}
                            <button onClick={() => setApiError(null)} className="w-7 h-7 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-colors font-bold text-xs">✕</button>
                        </div>
                    </div>
                )}

                {/* Welcome / Empty State */}
                {!loading && !searched && selectedProducts.length === 0 && (
                    <div className="text-center py-20 sm:py-28 bg-white rounded-3xl shadow-sm border border-slate-100 animate-fade-in-up">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float shadow-inner">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Ready to explore?</h2>
                        <p className="text-slate-500 max-w-sm mx-auto text-sm sm:text-base mb-6 px-4">
                            Search above or try a quick pick below — our AI engine will instantly surface the best matches.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                            {['iPhone', 'MacBook', 'Headphones', 'Charger', 'Monitor', 'Mouse'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleSearch(tag)}
                                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-100 hover:border-indigo-500 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* No results state */}
                {!loading && searched && selectedProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100 animate-fade-in-up">
                        <div className="text-4xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-slate-700 mb-2">No results found for "{searchQuery}"</h2>
                        <p className="text-slate-500 text-sm mb-6">Try a different keyword like "cable", "MacBook", or "headphones".</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['MacBook', 'cable', 'headphones', 'charger'].map(s => (
                                <button key={s} onClick={() => handleSearch(s)}
                                    className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-100 rounded-full text-sm font-medium transition-all active:scale-95">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {(loading || selectedProducts.length > 0) && (
                    <section>
                        <ProductGrid
                            products={selectedProducts}
                            title={searched ? `Results for "${searchQuery}"` : ''}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                        />
                    </section>
                )}

                {/* Recommendations */}
                {(loading || recommendations.length > 0) && selectedProducts.length > 0 && (
                    <section id="recommendations" className="mt-12 pt-12 border-t border-slate-200">
                        <ProductGrid
                            products={recommendations}
                            title="Highly Recommended For You"
                            loading={loading && recommendations.length === 0}
                            onViewDetails={handleViewDetails}
                            showReason={true}
                        />
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                                <span className="text-white font-extrabold text-xs">AI</span>
                            </div>
                            <span className="text-white font-bold">Recommender</span>
                        </div>
                        <p className="text-xs">Built with React, FastAPI &amp; Scikit-Learn</p>
                    </div>
                    <div className="text-xs">
                        <p>© 2026 Hybrid Recommendation Engine.</p>
                        <p className="text-slate-500">All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
