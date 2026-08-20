import React from 'react';
import { SearchBar } from './SearchBar';

const QUICK_TAGS = ['iPhone', 'MacBook', 'Sneakers', 'Watch', 'Headphones', 'Coffee', 'PS5', 'Skincare'];

// Maps search query → clean persona badge & headline (no emojis, pure editorial typography)
const getPersona = (query) => {
    const q = query.toLowerCase();
    if (/phone|iphone|samsung|xiaomi|realme|oppo|vivo|smartphone|mobile/.test(q))
        return { tag: 'Smartphones & Mobile', label: 'Phone Enthusiast', sub: `Curated mobile devices and accessories for "${query}"` };
    if (/laptop|macbook|notebook|computer|pc|asus|lenovo|dell|hp/.test(q))
        return { tag: 'Laptops & Workstations', label: 'Tech Poweruser', sub: `High-performance laptops and hardware for "${query}"` };
    if (/headphone|earphone|earbuds|audio|speaker|airpods|music|sound|wh-/.test(q))
        return { tag: 'Audio & Sound', label: 'Audiophile Collection', sub: `High-fidelity audio equipment for "${query}"` };
    if (/shoe|sneaker|nike|adidas|ultraboost|boot|footwear/.test(q))
        return { tag: 'Footwear & Sneakers', label: 'Sneakerhead Picks', sub: `Premium sneakers and lifestyle footwear for "${query}"` };
    if (/watch|smartwatch|seiko|casio|g-shock|garmin|timepiece/.test(q))
        return { tag: 'Watches & Timepieces', label: 'Watch Collector', sub: `Luxury timepieces and smart wearable devices for "${query}"` };
    if (/fashion|jacket|shirt|hoodie|clothing|apparel|jeans|sweater/.test(q))
        return { tag: 'Apparel & Fashion', label: 'Style & Wardrobe', sub: `Modern apparel and wardrobe essentials for "${query}"` };
    if (/bag|backpack|duffle|luggage|suitcase|tote/.test(q))
        return { tag: 'Bags & Carry Gear', label: 'Everyday Carry', sub: `Durable backpacks, travel bags, and EDC gear for "${query}"` };
    if (/beauty|serum|skincare|cleanser|sunscreen|shaver|hair dryer/.test(q))
        return { tag: 'Beauty & Skincare', label: 'Self Care & Grooming', sub: `Top-rated skincare formulas and grooming essentials for "${query}"` };
    if (/fitness|dumbbells|gym|protein|workout|yoga|massage/.test(q))
        return { tag: 'Fitness & Performance', label: 'Athlete & Training', sub: `High-performance workout equipment and supplements for "${query}"` };
    if (/gaming|ps5|playstation|xbox|nintendo|switch|console/.test(q))
        return { tag: 'Gaming & Esports', label: 'Gaming Specialist', sub: `Next-gen consoles, esports peripherals, and setups for "${query}"` };
    if (/coffee|espresso|grinder|kettle|breville|air fryer|vitamix/.test(q))
        return { tag: 'Kitchen & Specialty Coffee', label: 'Home Barista & Kitchen', sub: `Specialty brewing equipment and smart kitchen appliances for "${query}"` };
    if (/book|clean code|habits|programming|reading/.test(q))
        return { tag: 'Books & Knowledge', label: 'Avid Reader', sub: `Bestselling literature, engineering, and productivity books for "${query}"` };
    if (/camera|photo|lens|dslr|mirrorless|fujifilm|sony alpha|drone|dji/.test(q))
        return { tag: 'Cameras & Imaging', label: 'Visual Creator', sub: `Professional cameras, lenses, and aerial drones for "${query}"` };
    if (/cable|charger|adapter|usb|gan|powerbank|anker|baseus/.test(q))
        return { tag: 'Power & Connectivity', label: 'Setup Optimizer', sub: `Premium cables, chargers, and adapters for "${query}"` };
    if (/monitor|display|screen|tv|television/.test(q))
        return { tag: 'Displays & Visuals', label: 'Workspace Creator', sub: `Ultra-wide monitors and displays for "${query}"` };
    if (/mouse|keyboard|trackpad|keychron/.test(q))
        return { tag: 'Peripherals & Gear', label: 'Productivity & Setup', sub: `Precision peripherals matching "${query}"` };
    return { tag: 'Catalog Search', label: 'Product Explorer', sub: `Personalized matches for "${query}"` };
};

export const HeroSection = ({ onSearch, loading, searchQuery, searched }) => {
    const persona = searched && searchQuery ? getPersona(searchQuery) : null;

    return (
        <section
            aria-label="Search and Discovery Hero"
            className="relative text-white border-b border-slate-800/80"
            style={{
                backgroundColor: '#080c14',
                backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                paddingTop: searched ? '2.25rem' : '4.25rem',
                paddingBottom: searched ? '2.25rem' : '3.5rem',
                transition: 'padding 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
        >
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">

                {/* Dynamic Persona or Default Title */}
                {persona ? (
                    <div
                        key={searchQuery}
                        style={{ animation: 'fadeSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
                    >
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-700/80 bg-slate-900/90 text-[10px] font-mono uppercase tracking-wider text-slate-300 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {persona.tag}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 leading-tight">
                            {persona.label}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mb-6">{persona.sub}</p>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/90 text-[11px] font-medium text-slate-400 mb-3.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>E-Commerce Discovery Engine</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-2.5">
                            Smart Product Recommendations
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
                            Instant multi-category discovery powered by content similarity and collaborative filtering.
                        </p>
                    </div>
                )}

                {/* Search Bar Container */}
                <div
                    className="rounded-xl overflow-visible"
                    style={{
                        background: '#0d1322',
                        border: '1px solid #1e293b',
                        padding: '6px',
                    }}
                >
                    <SearchBar onSearch={onSearch} loading={loading} />
                </div>

                {/* Quick Trending Tags */}
                {!searched && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-xs">
                        <span className="font-medium text-slate-500 mr-1 text-[11px]">Trending:</span>
                        {QUICK_TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => onSearch(tag)}
                                className="px-2.5 py-1 rounded-md transition-colors border text-slate-400 text-xs font-medium active:scale-95 hover:text-white hover:border-slate-600 hover:bg-slate-800/60"
                                style={{
                                    background: '#0d1322',
                                    border: '1px solid #1e293b',
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
};
