import React from 'react';
import { ProductCard } from './ProductCard';

const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse h-full"
        style={{ background: '#0c1222', border: '1px solid #1e293b' }}>
        <div className="w-full skeleton" style={{ height: '175px', background: '#070b14' }} />
        <div className="p-4 space-y-3">
            <div className="flex gap-2">
                <div className="h-4 rounded w-20 skeleton" style={{ background: '#1e293b' }} />
                <div className="h-4 rounded w-14 skeleton" style={{ background: '#1e293b' }} />
            </div>
            <div className="h-4 rounded w-5/6 skeleton" style={{ background: '#1e293b' }} />
            <div className="h-4 rounded w-3/4 skeleton" style={{ background: '#1e293b' }} />
            <div className="flex items-center justify-between pt-3">
                <div className="h-5 rounded w-1/3 skeleton" style={{ background: '#1e293b' }} />
                <div className="w-7 h-7 rounded-md skeleton" style={{ background: '#1e293b' }} />
            </div>
        </div>
    </div>
);

export const ProductGrid = ({ products, title, loading, onViewDetails, showReason = false }) => {
    if (loading) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 rounded-md w-48 skeleton" style={{ background: '#1e293b' }} />
                    <div className="h-5 rounded-full w-14 skeleton" style={{ background: '#1e293b' }} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) return null;

    return (
        <div className="mb-12">
            {/* Section Header */}
            {title && (
                <div className="flex items-center justify-between mb-5 sm:mb-6 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`w-1.5 h-4 rounded-full ${showReason ? 'bg-indigo-500' : 'bg-blue-500'}`}
                        />
                        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                            {title}
                        </h2>
                    </div>
                    <span
                        className="text-xs font-mono px-2 py-0.5 rounded text-slate-400 bg-slate-900 border border-slate-800"
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
        </div>
    );
};
