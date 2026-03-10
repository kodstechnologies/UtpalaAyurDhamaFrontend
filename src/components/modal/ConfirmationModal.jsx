import React from 'react';
import { CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';

/**
 * Beautiful, reusable Confirmation Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to execute when confirmed
 * @param {string} title - Title of the modal
 * @param {string} description - Description message
 * @param {string} confirmText - Text for the confirm button
 * @param {string} cancelText - Text for the cancel button
 * @param {boolean} isLoading - Shows loading state on confirm button
 * @param {string} type - 'success', 'warning', 'info'
 */
function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "Please confirm your action.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    type = "success"
}) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return <AlertCircle size={40} className="text-amber-500" />;
            case 'info':
                return <AlertCircle size={40} className="text-blue-500" />;
            case 'success':
            default:
                return <CheckCircle size={40} className="text-emerald-500" />;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'warning':
                return 'rgba(245, 158, 11, 0.1)';
            case 'info':
                return 'rgba(59, 130, 246, 0.1)';
            case 'success':
            default:
                return 'rgba(16, 185, 129, 0.1)';
        }
    };

    const getBtnColor = () => {
        switch (type) {
            case 'warning':
                return 'var(--color-warning)';
            case 'info':
                return 'var(--color-info)';
            case 'success':
            default:
                return 'var(--color-btn-b)';
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl bg-white border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
                style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Banner Decor */}
                <div
                    className="h-2 w-full"
                    style={{ backgroundColor: getBtnColor() }}
                />

                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 hover:bg-gray-100/50"
                        style={{ color: 'var(--color-text-dark)' }}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}

                <div className="p-8">
                    {/* Icon Container */}
                    <div className="flex flex-col items-center text-center">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
                            style={{
                                backgroundColor: getColorClass(),
                            }}
                        >
                            <div
                                className="absolute inset-0 rounded-full animate-ping opacity-10"
                                style={{ backgroundColor: getBtnColor() }}
                            />
                            {getIcon()}
                        </div>

                        {/* Text Content */}
                        <h2
                            className="text-2xl font-bold mb-3"
                            style={{ color: 'var(--color-text-dark)' }}
                        >
                            {title}
                        </h2>
                        <p
                            className="text-gray-600 leading-relaxed max-w-xs mx-auto mb-8"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {description}
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl font-bold border transition-all duration-200 hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                            style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-dark)'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: getBtnColor(),
                                boxShadow: `0 8px 16px -4px ${type === 'success' ? 'rgba(74, 124, 89, 0.4)' : 'rgba(0,0,0,0.1)'}`
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-in { animation-duration: 0.3s; animation-fill-mode: forwards; }
                .fade-in { animation-name: fade-in; }
                .zoom-in { animation-name: zoom-in; }
            `}</style>
        </div>
    );
}

export default ConfirmationModal;
