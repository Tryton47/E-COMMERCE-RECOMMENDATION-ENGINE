import React from 'react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="w-full h-48 sm:h-52 skeleton"></div>
        <div className="p-4 sm:p-5 space-y-3">
            <div className="h-3 skeleton rounded w-1/3"></div>
            <div className="h-5 skeleton rounded w-4/5"></div>
            <div className="h-4 skeleton rounded w-1/2"></div>
            <div className="h-4 skeleton rounded w-3/5"></div>
            <div className="flex items-center justify-between mt-4">
                <div className="h-6 skeleton rounded w-1/3"></div>
                <div className="w-9 h-9 skeleton rounded-xl"></div>
            </div>
        </div>
    </div>
);

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 skeleton rounded-lg w-48"></div>
                    <div className="h-5 skeleton rounded-full w-14"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5 sm:mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
                    {showReason && (
                        <span className="text-indigo-500">✨</span>
                    )}
                    {title}
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {products.length} Items
                    </span>
                </h2>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, idx) => (
                    <div
                        key={product.product_id || idx}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(idx * 0.06, 0.36)}s` }}
                    >
                        <ProductCard
                            product={product}
                            onViewDetails={onViewDetails}
                            showReason={showReason}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
