import React from 'react';

export const ProductCard = ({ product, onViewDetails, showReason = false }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200
                      hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
                      h-full flex flex-col relative"
             onClick={() => onViewDetails(product.product_id)}>
            
            {/* Glassmorphic Reason Badge (if available) */}
            {showReason && product.score && (
                <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur border border-white/50 shadow-sm rounded-full px-3 py-1 text-xs font-bold text-indigo-600">
                    {(product.score * 100).toFixed(0)}% Match
                </div>
            )}

            {/* Image Placeholder with Gradient Overlay */}
            <div className="w-full h-56 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                {/* SVG Icon as dummy image */}
                <svg className="w-16 h-16 text-slate-300 z-10 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            
            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <p className="text-indigo-600 font-medium text-xs tracking-wider uppercase mb-2">
                    {product.category}
                </p>
                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                    {product.name || product.product_name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-400">
                        {'★'.repeat(Math.round(product.rating))}
                        <span className="text-slate-300">{'★'.repeat(5 - Math.round(product.rating))}</span>
                    </div>
                    <span className="text-slate-500 text-sm font-medium">
                        {product.rating.toFixed(1)} ({product.num_reviews})
                    </span>
                </div>
                
                {/* Reason box */}
                {showReason && product.reason && (
                    <div className="bg-indigo-50/50 border border-indigo-100 p-3 mb-4 rounded-xl flex-grow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider">Why recommended</span>
                        </div>
                        <p className="text-indigo-900/80 text-sm">
                            {product.reason}
                        </p>
                    </div>
                )}
                
                <div className={`flex items-end justify-between ${!showReason || !product.reason ? 'mt-auto' : ''}`}>
                    <p className="text-2xl font-extrabold text-slate-900">
                        {formatPrice(product.price)}
                    </p>
                    <button
                        className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(product.product_id);
                        }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
