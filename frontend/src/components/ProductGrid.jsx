import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-12">
                <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs h-96 flex flex-col justify-between animate-pulse">
                            <div className="w-full h-48 bg-slate-100 rounded-xl mb-4"></div>
                            <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                            <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
                            <div className="flex justify-between items-center mt-auto">
                                <div className="h-6 bg-slate-100 rounded w-1/2"></div>
                                <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    {title}
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        {products.length} Items
                    </span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
