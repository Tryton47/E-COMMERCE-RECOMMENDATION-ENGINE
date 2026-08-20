import React from 'react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse h-full"
        style={{ background: '#0c1322', border: '1px solid #1e293b' }}>
        <div className="w-full skeleton-shimmer" style={{ height: '170px' }} />
        <div className="p-3.5 space-y-2.5">
            <div className="flex gap-2">
                <div className="h-3.5 rounded w-16 skeleton-shimmer" />
                <div className="h-3.5 rounded w-12 skeleton-shimmer" />
            </div>
            <div className="h-4 rounded w-4/5 skeleton-shimmer" />
            <div className="h-4 rounded w-3/5 skeleton-shimmer" />
            <div className="flex items-center justify-between pt-2">
                <div className="h-5 rounded w-16 skeleton-shimmer" />
                <div className="w-6 h-6 rounded skeleton-shimmer" />
            </div>
        </div>
    </div>
);

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-5 rounded w-40 skeleton-shimmer" />
                    <div className="h-4 rounded-full w-12 skeleton-shimmer" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <section className="mb-10" aria-label={title || 'Product Grid'}>
            {/* Section Header */}
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-1 h-3.5 rounded-full ${showReason ? 'bg-blue-500' : 'bg-slate-400'}`}
                        />
                        <h2 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                            {title}
                        </h2>
                    </div>
                    <span
                        className="text-[11px] font-mono px-2 py-0.5 rounded text-slate-400 bg-slate-900 border border-slate-800"
                    >
                        {products.length} {products.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                {products.map((product, idx) => (
                    <div
                        key={product.product_id || idx}
                        className="flex flex-col"
                    >
                        <ProductCard
                            product={product}
                            onViewDetails={onViewDetails}
                            showReason={showReason}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};
