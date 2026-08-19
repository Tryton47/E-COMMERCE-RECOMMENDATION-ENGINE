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

        try {
            const result = await searchProducts(query.trim(), 12);
            setApiError(null);
            if (result && result.isLocalFallback) setIsFallbackMode(true);
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
            setApiError(isLocal
                ? 'Cannot connect to backend. Please ensure the server is running on port 8000.'
                : 'Unable to connect to live API. Switched to offline demo mode.');
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
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        } catch (error) {
            console.error('Failed to get recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#070a13' }}>

            {/* Hero */}
            <HeroSection onSearch={handleSearch} loading={loading} searchQuery={searchQuery} searched={searched} />

            {/* Main */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

                {/* Demo Mode Banner */}
                {isFallbackMode && (
                    <div className="mb-8 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-amber-500/30 bg-amber-950/20">
                        <div className="flex items-center gap-3">
                            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                            </span>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Demo Mode — Backend Initializing</p>
                                <p className="text-xs text-amber-200/60 mt-0.5">Showing local dataset while server is waking up.</p>
                            </div>
                        </div>
                        {searchQuery && (
                            <button onClick={() => handleSearch(searchQuery)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 flex-shrink-0 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry API
                            </button>
                        )}
                    </div>
                )}

                {/* Error Banner */}
                {apiError && !isFallbackMode && (
                    <div className="mb-8 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-rose-500/30 bg-rose-950/20">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-rose-300">{apiError}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {searchQuery && (
                                <button onClick={() => handleSearch(searchQuery)}
                                    className="px-3 py-1 text-xs font-medium rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20">
                                    Retry
                                </button>
                            )}
                            <button onClick={() => setApiError(null)}
                                className="w-6 h-6 flex items-center justify-center rounded-md text-rose-400 hover:bg-rose-500/10 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Welcome / Empty State */}
                {!loading && !searched && selectedProducts.length === 0 && (
                    <div className="text-center py-16 sm:py-20 rounded-2xl border border-slate-800/80 bg-slate-900/30">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-700 bg-slate-800/60">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white">Start Exploring</h2>
                        <p className="max-w-xs mx-auto text-xs sm:text-sm mb-6 px-4 text-slate-400">
                            Search keywords or select a popular category below to see recommendations.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 px-4">
                            {['iPhone', 'MacBook', 'Headphones', 'Charger', 'Monitor', 'Mouse'].map(tag => (
                                <button key={tag} onClick={() => handleSearch(tag)}
                                    className="px-3 py-1 rounded-md text-xs font-medium border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && searched && selectedProducts.length === 0 && (
                    <div className="text-center py-16 rounded-2xl border border-slate-800/80 bg-slate-900/30">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-700 bg-slate-800/60 text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-white mb-1">No products found for "{searchQuery}"</h2>
                        <p className="text-xs text-slate-400 mb-5">Try searching with different terms:</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {['MacBook', 'cable', 'headphones', 'charger'].map(s => (
                                <button key={s} onClick={() => handleSearch(s)}
                                    className="px-3 py-1 rounded-md text-xs font-medium border border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {(loading || selectedProducts.length > 0) && (
                    <section>
                        <ProductGrid
                            products={selectedProducts}
                            title={searched ? `Search Results for "${searchQuery}"` : 'Products'}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                        />
                    </section>
                )}

                {/* Recommendations */}
                {(loading || recommendations.length > 0) && selectedProducts.length > 0 && (
                    <section id="recommendations" className="mt-8 pt-8 border-t border-slate-800">
                        <ProductGrid
                            products={recommendations}
                            title="Recommended For You"
                            loading={loading && recommendations.length === 0}
                            onViewDetails={handleViewDetails}
                            showReason={true}
                        />
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="py-8 mt-auto border-t border-slate-800/80 bg-slate-950/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <span className="font-semibold text-sm text-white">Recommender Engine</span>
                        </div>
                        <p className="text-xs text-slate-500">Hybrid collaborative &amp; content-based filtering</p>
                    </div>
                    <div className="text-xs text-slate-500">
                        <p>© 2026 E-Commerce Recommendation Engine</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
