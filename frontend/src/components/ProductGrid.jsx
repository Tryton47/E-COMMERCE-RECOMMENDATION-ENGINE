import React from 'react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse h-full"
        style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Image skeleton */}
        <div className="w-full skeleton" style={{ height: '180px', background: 'rgba(255,255,255,0.04)' }} />
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
            <div className="flex gap-2">
                <div className="h-4 rounded w-20 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="h-4 rounded w-14 skeleton" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-4 rounded w-5/6 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-4 rounded w-3/4 skeleton" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="h-3 rounded w-1/2 skeleton" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="flex items-center justify-between pt-2">
                <div className="h-5 rounded w-1/3 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="w-7 h-7 rounded-lg skeleton" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
        </div>
    </div>
);

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-12">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 rounded-lg w-48 skeleton" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <div className="h-5 rounded-full w-14 skeleton" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
                {/* Grid skeleton — items-stretch ensures equal heights */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Section Header */}
            {title && (
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    {showReason && (
                        <div
                            className="w-1 h-5 rounded-full flex-shrink-0"
                            style={{ background: 'linear-gradient(to bottom, #6366f1, #818cf8)' }}
                        />
                    )}
                    <h2
                        className="text-lg sm:text-xl font-extrabold tracking-tight"
                        style={{ color: 'rgba(255,255,255,0.92)' }}
                    >
                        {showReason && <span className="text-indigo-400 mr-1.5">✨</span>}
                        {title}
                    </h2>
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                        style={{
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.25)',
                            color: '#a5b4fc',
                        }}
                    >
                        {products.length}
                    </span>
                </div>
            )}

            {/* Grid — items-stretch keeps all cards same height in each row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                {products.map((product, idx) => (
                    <div
                        key={product.product_id || idx}
                        className="animate-fade-in-up flex flex-col"
                        style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}
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
