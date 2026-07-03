import React from 'react';

export const ProductCard = ({ product, onViewDetails, showReason = false }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden 
                      hover:shadow-xl transition-shadow cursor-pointer
                      h-full flex flex-col"
             onClick={() => onViewDetails(product.product_id)}>
            {/* Image placeholder */}
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Product Image</span>
            </div>
            
            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {product.name || product.product_name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">
                    {product.category}
                </p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-500 font-semibold">
                        ★ {product.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-xs">
                        ({product.num_reviews} reviews)
                    </span>
                </div>
                
                {/* Price */}
                <p className="text-2xl font-bold text-blue-600 mb-3">
                    {formatPrice(product.price)}
                </p>
                
                {/* Reason (untuk recommendations) */}
                {showReason && product.reason && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-3 rounded">
                        <p className="text-green-700 text-sm font-semibold">
                            ✓ Recommendation
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                            {product.reason}
                        </p>
                        {product.score && (
                            <p className="text-green-600 text-xs mt-2">
                                Confidence: {(product.score * 100).toFixed(0)}%
                            </p>
                        )}
                    </div>
                )}
                
                {/* Button */}
                <button
                    className="w-full py-2 bg-blue-600 text-white rounded 
                             hover:bg-blue-700 transition font-semibold mt-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(product.product_id);
                    }}>
                    View Details
                </button>
            </div>
        </div>
    );
};
