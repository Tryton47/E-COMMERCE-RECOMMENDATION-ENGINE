import axios from 'axios';

// Hardcoded URL Railway agar tidak pusing mengatur Environment Variable di Vercel
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://e-commerce-recommendation-engine-production.up.railway.app';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchProducts = async (query, limit = 10) => {
    try {
        const response = await api.post('/api/search', {
            query: query,
            limit: limit,
        });
        return response.data;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

export const getRecommendations = async (productId, n = 5, userId = null) => {
    try {
        const response = await api.post('/api/recommend', {
            product_id: productId,
            n: n,
            user_id: userId,
        });
        return response.data;
    } catch (error) {
        console.error('Recommendation error:', error);
        throw error;
    }
};

export const getProduct = async (productId) => {
    try {
        const response = await api.get(`/api/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Product error:', error);
        throw error;
    }
};

export const logInteraction = async (userId, productId, action) => {
    try {
        const response = await api.post('/api/interactions/log', {
            user_id: userId,
            product_id: productId,
            action: action,
        });
        return response.data;
    } catch (error) {
        console.error('Interaction logging error:', error);
        throw error;
    }
};

export default api;
