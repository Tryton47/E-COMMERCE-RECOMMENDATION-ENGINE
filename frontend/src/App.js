import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductGrid } from './components/ProductGrid';
import { searchProducts, getRecommendations } from './api';

function App() {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (query) => {
        setLoading(true);
        setSearchQuery(query);
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
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Make sure API is running on localhost:8000');
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
                window.scrollTo(0, document.getElementById('recommendations')?.offsetTop || 800);
            }
        } catch (error) {
            console.error('Failed to get recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-5xl font-bold mb-2">🎯 Product Recommendations</h1>
                    <p className="text-xl text-blue-100">
                        Discover products you'll love based on your search
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Search */}
                <SearchBar onSearch={handleSearch} loading={loading} />

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                    <>
                        <ProductGrid
                            products={selectedProducts}
                            title="Search Results"
                            loading={false}
                            onViewDetails={handleViewDetails}
                        />
                    </>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <>
                        <div id="recommendations" className="mt-16 pt-8 border-t-2 border-gray-300">
                            <ProductGrid
                                products={recommendations}
                                title="Recommended For You"
                                loading={loading}
                                onViewDetails={handleViewDetails}
                                showReason={true}
                            />
                        </div>
                    </>
                )}

                {/* Empty State */}
                {!loading && selectedProducts.length === 0 && recommendations.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">
                            👆 Search for a product to get started
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>Built with React + FastAPI + Machine Learning</p>
                    <p className="text-gray-400 text-sm mt-2">
                        Hybrid Recommendation Engine | 2024
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
