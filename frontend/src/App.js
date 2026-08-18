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
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 50%, #0a0e1a 100%)' }}>

            {/* Hero */}
            <HeroSection onSearch={handleSearch} loading={loading} searchQuery={searchQuery} searched={searched} />

            {/* Main */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                {/* Demo Mode Banner */}
                {isFallbackMode && (
                    <div className="mb-8 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up"
                        style={{ background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)' }}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-3 w-3 relative flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                            </span>
                            <div>
                                <p className="text-sm font-bold text-amber-300">⚡ Demo Mode — API Warming Up</p>
                                <p className="text-xs text-amber-400/70 mt-0.5">Showing local fallback results while backend warms up.</p>
                            </div>
                        </div>
                        {searchQuery && (
                            <button onClick={() => handleSearch(searchQuery)}
                                className="px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 flex-shrink-0"
                                style={{ background: 'rgba(217,119,6,0.3)', border: '1px solid rgba(217,119,6,0.5)', color: '#fcd34d' }}>
                                🔄 Retry Live API
                            </button>
                        )}
                    </div>
                )}

                {/* Error Banner */}
                {apiError && !isFallbackMode && (
                    <div className="mb-8 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#f87171' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-red-300">{apiError}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {searchQuery && (
                                <button onClick={() => handleSearch(searchQuery)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95"
                                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                                    Retry
                                </button>
                            )}
                            <button onClick={() => setApiError(null)}
                                className="w-7 h-7 flex items-center justify-center rounded-full transition-all text-xs font-bold"
                                style={{ color: '#f87171' }}>✕</button>
                        </div>
                    </div>
                )}

                {/* Welcome / Empty State */}
                {!loading && !searched && selectedProducts.length === 0 && (
                    <div className="text-center py-20 sm:py-28 rounded-3xl animate-fade-in-up"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-float"
                            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                            <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#818cf8' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">Ready to explore?</h2>
                        <p className="max-w-sm mx-auto text-sm sm:text-base mb-8 px-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Search above or pick a category — our AI engine will instantly surface the best matches.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 px-4">
                            {['iPhone', 'MacBook', 'Headphones', 'Charger', 'Monitor', 'Mouse'].map(tag => (
                                <button key={tag} onClick={() => handleSearch(tag)}
                                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
                                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                                    onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.35)'; e.target.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.target.style.background = 'rgba(99,102,241,0.15)'; e.target.style.color = '#a5b4fc'; }}>
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && searched && selectedProducts.length === 0 && (
                    <div className="text-center py-20 rounded-3xl animate-fade-in-up"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-5xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-white mb-2">No results for "{searchQuery}"</h2>
                        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Try: cable, MacBook, headphones, charger</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['MacBook', 'cable', 'headphones', 'charger'].map(s => (
                                <button key={s} onClick={() => handleSearch(s)}
                                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
                                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
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
                            title={searched ? `Results for "${searchQuery}"` : ''}
                            loading={loading}
                            onViewDetails={handleViewDetails}
                        />
                    </section>
                )}

                {/* Recommendations */}
                {(loading || recommendations.length > 0) && selectedProducts.length > 0 && (
                    <section id="recommendations" className="mt-12 pt-12" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
            <footer style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-10 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                    <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                                <span className="text-white font-extrabold text-xs">AI</span>
                            </div>
                            <span className="font-bold text-white">Recommender</span>
                        </div>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Built with React, FastAPI &amp; Scikit-Learn</p>
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <p>© 2026 Hybrid Recommendation Engine.</p>
                        <p style={{ color: 'rgba(255,255,255,0.2)' }}>All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
