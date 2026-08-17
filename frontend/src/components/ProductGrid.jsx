import React from 'react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
    <div className="rounded-2xl overflow-hidden animate-pulse"
        style={{ background: 'rgba(22,27,48,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-full h-48 sm:h-52 skeleton" style={{ background: 'rgba(255,255,255,0.04)' }}></div>
        <div className="p-5 space-y-3">
            <div className="h-3 rounded w-1/3 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
            <div className="h-5 rounded w-4/5 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
            <div className="h-3 rounded w-1/2 skeleton" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
            <div className="flex items-center justify-between mt-4">
                <div className="h-6 rounded w-1/3 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
                <div className="w-9 h-9 rounded-xl skeleton" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
            </div>
        </div>
    </div>
);

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 rounded-lg w-48 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
                    <div className="h-5 rounded-full w-14 skeleton" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
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
            {/* Header */}
            {title && (
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 flex-wrap"
                        style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {showReason && <span className="text-indigo-400">✨</span>}
                        {title}
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                            {products.length} Items
                        </span>
                    </h2>
                </div>
            )}

            {/* Grid */}
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
