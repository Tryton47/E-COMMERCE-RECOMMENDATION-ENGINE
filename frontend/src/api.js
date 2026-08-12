import axios from 'axios';

// Dynamic API URL resolution with robust fallbacks
const API_BASE_URL = 
    process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:8000' 
        : 'https://ecommerce-recommendation-backend.vercel.app');

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60s timeout — handles Vercel serverless cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper: retry once on timeout (cold start)
const withRetry = async (fn, retries = 1) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
            if (i < retries && isTimeout) {
                console.warn(`[API] Timeout — retrying (attempt ${i + 2})...`);
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }
            throw err;
        }
    }
};

export const searchProducts = async (query, limit = 10) => {
    return withRetry(async () => {
        const response = await api.post('/api/search', {
            query: query,
            limit: limit,
        });
        return response.data;
    });
};

export const getRecommendations = async (productId, n = 5, userId = null) => {
    return withRetry(async () => {
        const response = await api.post('/api/recommend', {
            product_id: productId,
            n: n,
            user_id: userId,
        });
        return response.data;
    });
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

export const pingBackend = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.warn('Background warmup ping skipped:', error.message);
        return null;
    }
};

export default api;
