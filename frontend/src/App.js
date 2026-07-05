import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ProductGrid } from './components/ProductGrid';
import { searchProducts, getRecommendations } from './api';

function App() {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (query) => {
        setLoading(true);
        setSearchQuery(query);
        setSearched(true);
        try {
            const result = await searchProducts(query, 10);
            if (result.results) {
                setSelectedProducts(result.results);
                
                // Auto-recommend jika ada hasil
                if (result.results.length > 0) {
                    const firstProductId = result.results[0].product_id;
                    const recResult = await getRecommendations(firstProductId, 5);
                    if (recResult.recommendations) {
                        setRecommendations(recResult.recommendations);
                    }
                } else {
                    setRecommendations([]);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. The server may be starting up — please wait 30 seconds and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (productId) => {
        setLoading(true);
        try {
            const recResult = await getRecommendations(productId, 5);
            if (recResult.recommendations) {
                setRecommendations(recResult.recommendations);
                window.scrollTo({
                    top: document.getElementById('recommendations')?.offsetTop - 50 || 800,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            console.error('Failed to get recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
            {/* Hero Section */}
            <HeroSection onSearch={handleSearch} loading={loading} />

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative -mt-8 z-20">
                
                {/* Empty State / Welcome */}
                {!loading && !searched && selectedProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to explore?</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Search for any product above and our AI will recommend the best matches for you.
                        </p>
                    </div>
                )}

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                    <div className="animate-fade-in-up">
                        <ProductGrid
                            products={selectedProducts}
                            title={`Search Results for "${searchQuery}"`}
                            loading={false}
                            onViewDetails={handleViewDetails}
                        />
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div id="recommendations" className="mt-16 pt-16 border-t border-slate-200 animate-fade-in-up">
                        <ProductGrid
                            products={recommendations}
                            title="Highly Recommended For You"
                            loading={loading}
                            onViewDetails={handleViewDetails}
                            showReason={true}
                        />
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">AI</span>
                            </div>
                            <span className="text-white font-bold text-lg">Recommender</span>
                        </div>
                        <p className="text-sm">Built with React, FastAPI & Scikit-Learn</p>
                    </div>
                    <div className="text-sm text-center md:text-right">
                        <p>© 2026 Hybrid Recommendation Engine.</p>
                        <p>All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
