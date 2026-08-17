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

// Arc Gauge SVG component for AI Match Percentage
const ScoreArcGauge = ({ scorePercent }) => {
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

    return (
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
            <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                    cx="16" cy="16" r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3.5" fill="transparent"
                />
                <circle
                    cx="16" cy="16" r={radius}
                    stroke="#10b981"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            <span className="text-[11px] font-bold text-emerald-400">
                {scorePercent}%
            </span>
        </div>
    );
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
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={cardRef}
            onClick={() => onViewDetails(product.product_id)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
            style={{
                backgroundColor: '#0f172a',
                border: isHovered ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isHovered
                    ? '0 12px 30px -10px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.2)'
                    : '0 4px 20px rgba(0, 0, 0, 0.4)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            }}
        >
            {/* Interactive Spotlight Cursor Gradient Overlay */}
            {isHovered && (
                <div
                    className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-0"
                    style={{
                        background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
                    }}
                />
            )}

            {/* AI Match Gauge */}
            {showReason && matchPercent && (
                <div className="absolute top-3 right-3 z-10">
                    <ScoreArcGauge scorePercent={matchPercent} />
                </div>
            )}

            {/* Discount Badge */}
            {discount && (
                <div className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {discount} OFF
                </div>
            )}

            {/* Product Image */}
            <div className="w-full h-48 sm:h-52 flex items-center justify-center p-6 relative overflow-hidden bg-slate-900/60 z-10">
                <img
                    src={imageSrc}
                    alt={title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 ease-out"
                    style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                    loading="lazy"
                />
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-slate-800/80 z-10" />

            {/* Card Content */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow z-10">
                {/* Category Chip */}
                <div className="mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-950/70 border border-indigo-800/40 px-2 py-0.5 rounded">
                        {categoryShort}
                    </span>
                </div>

                {/* Product Title */}
                <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2 leading-snug text-white group-hover:text-indigo-200 transition-colors">
                    {title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex text-amber-400 text-xs tracking-wider">
                        {'★'.repeat(Math.round(rating))}
                        <span className="text-slate-700">{'★'.repeat(Math.max(0, 5 - Math.round(rating)))}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                        {rating.toFixed(1)} <span className="text-slate-500">({reviews})</span>
                    </span>
                </div>

                {/* AI Recommendation Reason (if enabled) */}
                {showReason && reasonText && (
                    <div className="p-3 mb-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30 flex-grow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Match Context</span>
                        </div>
                        <p className="text-xs text-indigo-200/80 leading-relaxed">{reasonText}</p>
                    </div>
                )}

                {/* Price + Action Button */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    {price ? (
                        <p className="text-lg font-bold text-emerald-400 tracking-tight">
                            {price}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 italic">Price N/A</p>
                    )}

                    <button
                        aria-label={`View details for ${title}`}
                        onClick={(e) => { e.stopPropagation(); onViewDetails(product.product_id); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isHovered
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
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
