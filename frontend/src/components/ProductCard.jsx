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
    return '1,2k';
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
            onClick={() => onViewDetails(product.product_id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex flex-col h-full relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                background: isHovered
                    ? 'linear-gradient(145deg, rgba(30,35,60,0.98), rgba(20,25,50,0.98))'
                    : 'linear-gradient(145deg, rgba(22,27,48,0.95), rgba(15,19,40,0.95))',
                border: isHovered
                    ? '1px solid rgba(99,102,241,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isHovered
                    ? '0 20px 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.2)'
                    : '0 4px 24px rgba(0,0,0,0.3)',
                transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
            }}
        >
            {/* AI Match badge */}
            {showReason && matchPercent && (
                <div className="absolute top-3 right-3 z-10 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                    ✨ {matchPercent}%
                </div>
            )}

            {/* Discount badge */}
            {discount && (
                <div className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}>
                    {discount} OFF
                </div>
            )}

            {/* Image area */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center p-5 relative overflow-hidden transition-colors duration-300"
                style={{ background: isHovered ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)' }}>
                <img
                    src={imageSrc}
                    alt={title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain drop-shadow-lg transition-transform duration-500"
                    style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                    loading="lazy"
                />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: isHovered ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />

            {/* Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Category chip */}
                <div className="mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        {categoryShort}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-[15px] font-bold mb-2.5 line-clamp-2 leading-snug transition-colors duration-200"
                    style={{ color: isHovered ? '#e0e7ff' : 'rgba(255,255,255,0.85)' }}>
                    {title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex text-amber-400 text-xs leading-none tracking-widest">
                        {'★'.repeat(Math.round(rating))}
                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>{'★'.repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {rating.toFixed(1)} ({reviews})
                    </span>
                </div>

                {/* AI Reason */}
                {showReason && reasonText && (
                    <div className="p-3 mb-3 rounded-xl flex-grow"
                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#818cf8' }}>
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#a5b4fc' }}>AI Pick</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(165,180,252,0.7)' }}>{reasonText}</p>
                    </div>
                )}

                {/* Price + Arrow */}
                <div className="flex items-center justify-between mt-auto">
                    {price ? (
                        <p className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: '#e0e7ff' }}>
                            {price}
                        </p>
                    ) : (
                        <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.25)' }}>Price N/A</p>
                    )}
                    <button
                        aria-label={`View details for ${title}`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(product.product_id); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{
                            background: isHovered ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.07)',
                            color: isHovered ? '#fff' : 'rgba(255,255,255,0.4)',
                            boxShadow: isHovered ? '0 4px 14px rgba(99,102,241,0.4)' : 'none',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        }}
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
