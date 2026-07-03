import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-gray-500 mt-4">Loading...</p>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found. Try another search!</p>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {title} ({products.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.product_id}
                        product={product}
                        onViewDetails={onViewDetails}
                        showReason={showReason}
                    />
                ))}
            </div>
        </div>
    );
};
