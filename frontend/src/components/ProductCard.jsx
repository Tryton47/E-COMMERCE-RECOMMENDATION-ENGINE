import React, { useState, useRef } from 'react';

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
    fashion: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    book: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    sport: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    fitness: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    gaming: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    furniture: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    car: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
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
    return null;
};

const safeRating = (item) => {
    const r = parseFloat(item.rating);
    return isNaN(r) ? 4.5 : Math.min(5, Math.max(0, r));
};

const safeReviews = (item) => {
    const r = item.num_reviews || item.rating_count;
    if (typeof r === 'number') return r.toLocaleString();
    if (typeof r === 'string') return r;
    return '1.2k';
};

export const ProductCard = ({ product, onViewDetails, showReason = false }) => {
    const [imgError, setImgError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef(null);

    const title = product.name || product.product_name || 'Tech Product';
    const categoryFull = product.category || 'Electronics';
    const categoryShort = categoryFull.split('|')[0].trim();
    const imageSrc = (!imgError && product.img_link && product.img_link.startsWith('http'))
        ? product.img_link
        : getFallbackImage(categoryFull, title);

    const price = safePrice(product);
    const rating = safeRating(product);
    const reviews = safeReviews(product);
    const matchPercent = product.score ? Math.round(product.score * 100) : null;
    const reasonText = product.reason || product.recommendation_reason;
    const discount = product.discount_percentage;

    return (
        <div
            ref={cardRef}
            onClick={() => onViewDetails(product.product_id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col h-full rounded-xl cursor-pointer transition-all duration-200 overflow-hidden"
            style={{
                backgroundColor: '#0c1222',
                border: isHovered ? '1px solid #3b82f6' : '1px solid #1e293b',
                boxShadow: isHovered
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 2px 8px rgba(0, 0, 0, 0.25)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
        >
            {/* Product Image Area */}
            <div
                className="relative w-full flex-shrink-0 overflow-hidden"
                style={{
                    height: '175px',
                    backgroundColor: '#070b14',
                    borderBottom: '1px solid #172033',
                }}
            >
                <img
                    src={imageSrc}
                    alt={title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 ease-out"
                    style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                    loading="lazy"
                />
            </div>

            {/* Card Content */}
            <div className="flex flex-col flex-grow p-4 gap-2.5">

                {/* Inline Badges: Category + Discount + Match (Clean, No Emojis) */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                            background: '#111c38',
                            border: '1px solid #1e3a8a',
                            color: '#93c5fd',
                        }}
                    >
                        {categoryShort}
                    </span>

                    {discount && (
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded"
                            style={{
                                background: '#064e3b',
                                border: '1px solid #047857',
                                color: '#6ee7b7',
                            }}
                        >
                            {discount} OFF
                        </span>
                    )}

                    {showReason && matchPercent && (
                        <span
                            className="text-[10px] font-mono font-medium px-2 py-0.5 rounded ml-auto"
                            style={{
                                background: '#1e1b4b',
                                border: '1px solid #3730a3',
                                color: '#c7d2fe',
                            }}
                        >
                            Match {matchPercent}%
                        </span>
                    )}
                </div>

                {/* Product Title */}
                <h3
                    className="text-sm font-medium leading-snug line-clamp-2 transition-colors duration-150"
                    style={{ color: isHovered ? '#ffffff' : '#e2e8f0' }}
                >
                    {title}
                </h3>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="font-semibold text-amber-400">{rating.toFixed(1)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{reviews} reviews</span>
                </div>

                {/* Reason explanation (recommendation view) */}
                {showReason && reasonText && (
                    <div
                        className="rounded-md px-2.5 py-1.5 text-[11px] leading-relaxed"
                        style={{
                            background: '#0e172a',
                            border: '1px solid #1e293b',
                            color: '#94a3b8',
                        }}
                    >
                        {reasonText}
                    </div>
                )}

                {/* Price & Action Row */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/60">
                    {price ? (
                        <span className="text-base font-bold tracking-tight text-emerald-400">
                            {price}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-500 italic">
                            Price N/A
                        </span>
                    )}

                    <button
                        aria-label={`View details for ${title}`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(product.product_id); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                            background: isHovered ? '#2563eb' : '#1e293b',
                            color: isHovered ? '#ffffff' : '#94a3b8',
                        }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
