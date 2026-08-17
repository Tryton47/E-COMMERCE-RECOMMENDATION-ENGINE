import React, { useState } from 'react';

// Fallback high quality Unsplash images by product category keyword
const CATEGORY_IMAGES = {
    laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    phone: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    mobile: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    headphone: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
    monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    cable: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    charger: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
};

const getFallbackImage = (category = '', name = '') => {
    const text = (category + ' ' + name).toLowerCase();
    for (const key of Object.keys(CATEGORY_IMAGES)) {
        if (text.includes(key)) return CATEGORY_IMAGES[key];
    }
    return CATEGORY_IMAGES.default;
};

export const ProductCard = ({ product, onViewDetails, showReason = false }) => {
    const [imgError, setImgError] = useState(false);

    // Robust Price Parser ($NaN Protection)
    const getFormattedPrice = (item) => {
        const raw = item.price || item.discounted_price || item.actual_price;
        if (raw === null || raw === undefined) return '$49.99';
        
        if (typeof raw === 'number' && !isNaN(raw) && raw > 0) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(raw);
        }
        if (typeof raw === 'string') {
            const cleaned = raw.replace(/[^0-9.]/g, '');
            const num = parseFloat(cleaned);
            if (!isNaN(num) && num > 0) {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
            }
        }
        return '$49.99';
    };

    // Safe Rating & Review Helpers
    const ratingVal = !isNaN(parseFloat(product.rating)) ? parseFloat(product.rating) : 4.5;
    const reviewCountVal = product.num_reviews || product.rating_count || '1,250';
    const formattedReviewCount = typeof reviewCountVal === 'number' ? reviewCountVal.toLocaleString() : reviewCountVal;
    
    // Product Title & Category
    const title = product.name || product.product_name || 'Premium Tech Product';
    const categoryText = (product.category || 'Electronics').split('|')[0];
    
    // Image resolution
    const imageSrc = (!imgError && product.img_link && product.img_link.startsWith('http'))
        ? product.img_link
        : getFallbackImage(product.category, title);

    const matchPercent = product.score ? (product.score * 100).toFixed(0) : null;
    const reasonText = product.reason || product.recommendation_reason;

    return (
        <div 
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs
                       hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300
                       h-full flex flex-col relative cursor-pointer"
            onClick={() => onViewDetails(product.product_id)}
        >
            {/* Glassmorphic Match Badge */}
            {showReason && matchPercent && (
                <div className="absolute top-3 right-3 z-10 bg-indigo-600/90 backdrop-blur border border-indigo-400/30 text-white shadow-md rounded-full px-3 py-1 text-xs font-extrabold tracking-wide flex items-center gap-1">
                    <span>✨</span> {matchPercent}% Match
                </div>
            )}

            {/* Image Container with Fallback Protection */}
            <div className="w-full h-56 bg-slate-50 flex items-center justify-center relative overflow-hidden p-4 group-hover:bg-indigo-50/30 transition-colors">
                <img 
                    src={imageSrc} 
                    alt={title} 
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                    loading="lazy"
                />
            </div>
            
            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-indigo-600 font-semibold text-xs tracking-wider uppercase px-2.5 py-0.5 bg-indigo-50 rounded-full border border-indigo-100/50">
                        {categoryText}
                    </span>
                    {product.discount_percentage && (
                        <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {product.discount_percentage} OFF
                        </span>
                    )}
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-400 text-sm">
                        {'★'.repeat(Math.round(ratingVal))}
                        <span className="text-slate-200">{'★'.repeat(Math.max(0, 5 - Math.round(ratingVal)))}</span>
                    </div>
                    <span className="text-slate-500 text-xs font-medium">
                        {ratingVal.toFixed(1)} <span className="text-slate-400">({formattedReviewCount})</span>
                    </span>
                </div>
                
                {/* AI Recommendation Reason */}
                {showReason && reasonText && (
                    <div className="bg-indigo-50/70 border border-indigo-100 p-3 mb-4 rounded-xl flex-grow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="text-indigo-800 text-xs font-bold uppercase tracking-wider">AI Recommendation</span>
                        </div>
                        <p className="text-indigo-900/80 text-xs leading-relaxed font-medium">
                            {reasonText}
                        </p>
                    </div>
                )}
                
                {/* Price and CTA */}
                <div className={`flex items-end justify-between ${!showReason || !reasonText ? 'mt-auto' : ''}`}>
                    <div>
                        <span className="text-xs text-slate-400 block font-medium">Price</span>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {getFormattedPrice(product)}
                        </p>
                    </div>
                    <button
                        className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs group-hover:shadow-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(product.product_id);
                        }}
                        title="View Product Details"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
