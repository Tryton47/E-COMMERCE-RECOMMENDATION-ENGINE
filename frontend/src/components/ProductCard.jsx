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
    fashion: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    book: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    sport: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
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
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

    // Spotlight cursor tracking
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={cardRef}
            onClick={() => onViewDetails(product.product_id)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col h-full rounded-xl cursor-pointer transition-all duration-300 overflow-hidden"
            style={{
                backgroundColor: '#0f172a',
                border: isHovered ? '1px solid rgba(99,102,241,0.45)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isHovered
                    ? '0 16px 40px -12px rgba(99,102,241,0.22)'
                    : '0 2px 16px rgba(0,0,0,0.35)',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
            }}
        >
            {/* Cursor spotlight overlay */}
            {isHovered && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 rounded-xl"
                    style={{
                        background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.1), transparent 70%)`,
                    }}
                />
            )}

            {/* ── PRODUCT IMAGE (clean, no floating badges) ── */}
            <div
                className="relative w-full flex-shrink-0 overflow-hidden z-10"
                style={{
                    height: '180px',
                    backgroundColor: '#060c1a',
                }}
            >
                <img
                    src={imageSrc}
                    alt={title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain p-5 transition-transform duration-500 ease-out"
                    style={{ transform: isHovered ? 'scale(1.07)' : 'scale(1)' }}
                    loading="lazy"
                />
            </div>

            {/* ── CARD CONTENT ── */}
            <div className="flex flex-col flex-grow p-4 gap-2 z-10">

                {/* Row 1: Category chip + Discount + Match badges — all inline, no overlap */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Category */}
                    <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#a5b4fc',
                        }}
                    >
                        {categoryShort}
                    </span>

                    {/* Discount badge */}
                    {discount && (
                        <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded"
                            style={{
                                background: 'rgba(16,185,129,0.12)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#6ee7b7',
                            }}
                        >
                            {discount} OFF
                        </span>
                    )}

                    {/* AI Match badge — only in recommendation view */}
                    {showReason && matchPercent && (
                        <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded ml-auto"
                            style={{
                                background: 'rgba(99,102,241,0.2)',
                                border: '1px solid rgba(99,102,241,0.4)',
                                color: '#c7d2fe',
                            }}
                        >
                            ✨ {matchPercent}%
                        </span>
                    )}
                </div>

                {/* Row 2: Product Title */}
                <h3
                    className="text-sm font-semibold leading-snug line-clamp-2 transition-colors duration-200"
                    style={{ color: isHovered ? '#e0e7ff' : 'rgba(255,255,255,0.88)' }}
                >
                    {title}
                </h3>

                {/* Row 3: Star rating */}
                <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400 text-xs tracking-wide">
                        {'★'.repeat(Math.round(rating))}
                        <span style={{ color: 'rgba(255,255,255,0.12)' }}>
                            {'★'.repeat(Math.max(0, 5 - Math.round(rating)))}
                        </span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {rating.toFixed(1)} ({reviews})
                    </span>
                </div>

                {/* Row 4: AI Reason (recommendation view only) */}
                {showReason && reasonText && (
                    <div
                        className="rounded-lg px-3 py-2"
                        style={{
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.18)',
                        }}
                    >
                        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(165,180,252,0.75)' }}>
                            {reasonText}
                        </p>
                    </div>
                )}

                {/* Row 5: Price + Arrow button — always at bottom */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    {price ? (
                        <span className="text-base font-bold tracking-tight" style={{ color: '#4ade80' }}>
                            {price}
                        </span>
                    ) : (
                        <span className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Price N/A
                        </span>
                    )}

                    <button
                        aria-label={`View details for ${title}`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(product.product_id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                            background: isHovered ? 'rgba(99,102,241,0.85)' : 'rgba(255,255,255,0.06)',
                            color: isHovered ? '#fff' : 'rgba(255,255,255,0.35)',
                            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
