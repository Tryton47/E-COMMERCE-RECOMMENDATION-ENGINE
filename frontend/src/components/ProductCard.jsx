import React, { useState } from 'react';

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
    keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
};

const getFallbackImage = (category = '', name = '') => {
    const text = (category + ' ' + name).toLowerCase();
    for (const key of Object.keys(CATEGORY_IMAGES)) {
        if (text.includes(key)) return CATEGORY_IMAGES[key];
    }
    return CATEGORY_IMAGES.default;
};

const safePrice = (item) => {
    const raw = item.price || item.discounted_price || item.actual_price;
    if (typeof raw === 'number' && !isNaN(raw) && raw > 0)
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(raw);
    if (typeof raw === 'string') {
        const cleaned = raw.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num > 0)
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    }
    return null; // no price to display
};

const safeRating = (item) => {
    const r = parseFloat(item.rating);
    return isNaN(r) ? 4.5 : Math.min(5, Math.max(0, r));
};

const safeReviews = (item) => {
    const r = item.num_reviews || item.rating_count;
    if (typeof r === 'number') return r.toLocaleString();
    if (typeof r === 'string') return r;
    return '1,200';
};

export const ProductCard = ({ product, onViewDetails, showReason = false }) => {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const title = product.name || product.product_name || 'Tech Product';
    const categoryFull = product.category || 'Electronics';
    const categoryShort = categoryFull.split('|')[0];
    const imageSrc = (!imgError && product.img_link && product.img_link.startsWith('http'))
        ? product.img_link
        : getFallbackImage(categoryFull, title);

    const price = safePrice(product);
    const rating = safeRating(product);
    const reviews = safeReviews(product);
    const matchPercent = product.score ? (product.score * 100).toFixed(0) : null;
    const reasonText = product.reason || product.recommendation_reason;
    const discount = product.discount_percentage;

    return (
        <div
            className={`group bg-white rounded-2xl overflow-hidden border shadow-sm
                       flex flex-col h-full relative cursor-pointer
                       transition-all duration-300 ease-out
                       ${isHovered ? 'shadow-xl -translate-y-2 border-indigo-200' : 'border-slate-200 hover:border-indigo-100'}`}
            onClick={() => onViewDetails(product.product_id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Match Badge */}
            {showReason && matchPercent && (
                <div className="absolute top-3 right-3 z-10 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    ✨ {matchPercent}%
                </div>
            )}

            {/* Discount Badge */}
            {discount && (
                <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {discount} OFF
                </div>
            )}

            {/* Image */}
            <div className={`w-full h-48 sm:h-52 flex items-center justify-center relative overflow-hidden p-4 transition-colors duration-300 ${isHovered ? 'bg-indigo-50/50' : 'bg-slate-50'}`}>
                <img
                    src={imageSrc}
                    alt={title}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-contain transition-transform duration-500 ease-out drop-shadow-sm ${isHovered ? 'scale-110' : 'scale-100'}`}
                    loading="lazy"
                />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Category */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/60">
                        {categoryShort}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`text-sm sm:text-base font-bold mb-2 line-clamp-2 leading-snug transition-colors duration-200 ${isHovered ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex text-amber-400 text-sm leading-none">
                        {'★'.repeat(Math.round(rating))}
                        <span className="text-slate-200">{'★'.repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                        {rating.toFixed(1)} <span className="text-slate-400">({reviews})</span>
                    </span>
                </div>

                {/* AI Reason */}
                {showReason && reasonText && (
                    <div className="bg-indigo-50/80 border border-indigo-100 p-3 mb-3 rounded-xl flex-grow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="text-indigo-700 text-[10px] font-bold uppercase tracking-wider">AI Pick</span>
                        </div>
                        <p className="text-indigo-800/80 text-xs leading-relaxed">{reasonText}</p>
                    </div>
                )}

                {/* Price + CTA */}
                <div className={`flex items-center justify-between ${!showReason || !reasonText ? 'mt-auto' : ''}`}>
                    <div>
                        {price ? (
                            <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                                {price}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Price N/A</p>
                        )}
                    </div>
                    <button
                        aria-label={`View details for ${title}`}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isHovered ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-slate-100 text-slate-500'
                        }`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(product.product_id); }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
