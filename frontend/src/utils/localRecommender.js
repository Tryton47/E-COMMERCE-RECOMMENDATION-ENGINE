import { MOCK_PRODUCTS } from '../data/mockProducts';

/**
 * Local Fallback Recommender Utility
 * Provides sub-millisecond search & recommendation capabilities when the remote backend is warming up or unreachable.
 */

export const localSearchProducts = (query, limit = 10) => {
    if (!query || !query.trim()) {
        return { status: 'success', query: '', results: [], count: 0, isLocalFallback: true };
    }

    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    const matches = MOCK_PRODUCTS.filter(product => {
        const searchText = (
            product.product_name + ' ' +
            product.category + ' ' +
            product.about_product
        ).toLowerCase();

        return terms.every(term => searchText.includes(term));
    });

    // If query is broad (e.g. "phone", "cable", "laptop"), match any term if all-term match is empty
    const results = matches.length > 0 ? matches : MOCK_PRODUCTS.filter(product => {
        const searchText = (
            product.product_name + ' ' +
            product.category + ' ' +
            product.about_product
        ).toLowerCase();
        return terms.some(term => searchText.includes(term));
    });

    return {
        status: 'success',
        query,
        results: results.slice(0, limit),
        count: results.length,
        isLocalFallback: true
    };
};

export const localGetRecommendations = (productId, n = 5) => {
    const target = MOCK_PRODUCTS.find(p => p.product_id === productId) || MOCK_PRODUCTS[0];

    const targetCategory = target.category ? target.category.split('|')[0] : '';

    // Score other products based on category overlap and rating
    const scored = MOCK_PRODUCTS
        .filter(p => p.product_id !== target.product_id)
        .map(p => {
            let score = 0.5;
            const pCategory = p.category ? p.category.split('|')[0] : '';
            if (pCategory === targetCategory) score += 0.35;
            if (parseFloat(p.rating) >= 4.5) score += 0.1;

            return {
                ...p,
                recommendation_score: parseFloat(score.toFixed(2)),
                recommendation_reason: pCategory === targetCategory 
                    ? `Category Match (${targetCategory})` 
                    : `Highly Rated (${p.rating}★)`
            };
        })
        .sort((a, b) => b.recommendation_score - a.recommendation_score);

    return {
        status: 'success',
        product_id: productId,
        recommendations: scored.slice(0, n),
        isLocalFallback: true
    };
};
