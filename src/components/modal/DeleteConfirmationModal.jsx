import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

/**
 * Beautiful, reusable Delete Confirmation Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to execute when confirmed
 * @param {string} title - Title of the item to delete (e.g., "Dr. John Doe")
 * @param {string} itemType - Type of item (e.g., "doctor", "patient", "nurse")
 * @param {string} description - Optional custom description message
 * @param {boolean} isLoading - Shows loading state on confirm button
 */
function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "this item",
    itemType = "item",
    description,
    isLoading = false
}) {
    if (!isOpen) return null;

    const defaultDescription = `Are you sure you want to delete ${title}? This action cannot be undone and all associated data will be permanently removed.`;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleBackdropClick}
        >
            {/* Modal Container */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl transform transition-all duration-300 ease-out"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                            backgroundColor: 'var(--color-bg-hover)',
                            color: 'var(--color-text)'
                        }}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Modal Content */}
                <div className="p-6">
                    {/* Icon and Header */}
                    <div className="flex flex-col items-center text-center mb-6">
                        {/* Warning Icon Container */}
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative"
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '3px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <div
                                className="absolute inset-0 rounded-full animate-ping opacity-20"
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.5)' }}
                            />
                            <AlertTriangle
                                size={40}
                                style={{ color: '#EF4444' }}
                                className="relative z-10"
                            />
                        </div>

                        {/* Title */}
                        <h2
                            className="text-2xl font-bold mb-2"
                            style={{ color: 'var(--color-text-dark)' }}
                        >
                            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?
                        </h2>

                        {/* Description */}
                        <p
                            className="text-sm leading-relaxed px-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {description || defaultDescription}
                        </p>
                    </div>

                    {/* Warning Box */}
                    <div
                        className="rounded-xl p-4 mb-6 flex items-start gap-3"
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                    >
                        <AlertTriangle
                            size={20}
                            style={{ color: '#EF4444', marginTop: '2px' }}
                            className="flex-shrink-0"
                        />
                        <div>
                            <p
                                className="text-sm font-semibold mb-1"
                                style={{ color: '#EF4444' }}
                            >
                                This action is permanent
                            </p>
                            <p
                                className="text-xs"
                                style={{ color: 'var(--color-text)' }}
                            >
                                Once deleted, this {itemType} and all related information cannot be recovered.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                            style={{
                                backgroundColor: 'var(--color-bg-hover)',
                                color: 'var(--color-text-dark)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            Cancel
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: '#EF4444',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.4)'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

export default DeleteConfirmationModal;



