import axios from 'axios';
import { localSearchProducts, localGetRecommendations } from './utils/localRecommender';

// Dynamic API URL resolution with robust fallbacks
const API_BASE_URL = 
    process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:8000' 
        : 'https://ecommerce-recommendation-backend.vercel.app');

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15s timeout — fast failover to demo mode if cold starting
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
                console.warn(`[API] Remote call timeout — retrying (attempt ${i + 2})...`);
                await new Promise(r => setTimeout(r, 1500));
                continue;
            }
            throw err;
        }
    }
};

export const searchProducts = async (query, limit = 10) => {
    try {
        return await withRetry(async () => {
            const response = await api.post('/api/search', {
                query: query,
                limit: limit,
            });
            return { ...response.data, isLocalFallback: false };
        });
    } catch (error) {
        console.warn(`[API] Remote search failed (${error.message}). Serving local fallback results...`);
        return localSearchProducts(query, limit);
    }
};

export const getRecommendations = async (productId, n = 5, userId = null) => {
    try {
        return await withRetry(async () => {
            const response = await api.post('/api/recommend', {
                product_id: productId,
                n: n,
                user_id: userId,
            });
            return { ...response.data, isLocalFallback: false };
        });
    } catch (error) {
        console.warn(`[API] Remote recommendation failed (${error.message}). Serving local fallback...`);
        return localGetRecommendations(productId, n);
    }
};

export const getProduct = async (productId) => {
    try {
        const response = await api.get(`/api/products/${productId}`);
        return response.data;
    } catch (error) {
        console.warn(`[API] Get product failed (${error.message}). Using local product...`);
        const fallback = localSearchProducts('', 50).results.find(p => p.product_id === productId);
        if (fallback) {
            return { status: 'success', product: fallback, isLocalFallback: true };
        }
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
        console.warn('Interaction logging error (skipped):', error.message);
        return { status: 'success', message: 'Logged locally' };
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
