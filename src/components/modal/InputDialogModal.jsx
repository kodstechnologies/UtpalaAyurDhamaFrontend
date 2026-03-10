import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * Beautiful, reusable Input Dialog Modal Component
 * Used for adding items like languages, skills, certifications, etc.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to execute when confirmed, receives the input value
 * @param {string} title - Title of the modal (e.g., "Add Language")
 * @param {string} label - Label for the input field (e.g., "Language")
 * @param {string} placeholder - Placeholder text for the input
 * @param {string} confirmText - Text for the confirm button (default: "Add")
 * @param {function} validate - Optional validation function that returns error message or null
 */
function InputDialogModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Add Item",
    label = "Item",
    placeholder = "Enter item name",
    confirmText = "Add",
    validate = null
}) {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setError("");
        }
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        setInputValue("");
        setError("");
        onClose();
    };

    const handleConfirm = () => {
        const trimmedValue = inputValue.trim();
        
        if (!trimmedValue) {
            setError(`${label} cannot be empty`);
            return;
        }

        // Run custom validation if provided
        if (validate) {
            const validationError = validate(trimmedValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        // Clear error and call onConfirm
        setError("");
        onConfirm(trimmedValue);
        handleClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    if (!isOpen) return null;

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
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                    style={{
                        backgroundColor: 'var(--color-bg-hover)',
                        color: 'var(--color-text)'
                    }}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Modal Content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2
                            className="text-2xl font-bold"
                            style={{ color: 'var(--color-text-dark)' }}
                        >
                            {title}
                        </h2>
                        <p
                            className="text-sm mt-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            Please enter the {label.toLowerCase()} you want to add
                        </p>
                    </div>

                    {/* Input Field */}
                    <div className="mb-6">
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: 'var(--color-text-dark)' }}
                        >
                            {label}
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setError(""); // Clear error on input change
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder={placeholder}
                            className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: 'var(--color-bg-hover)',
                                borderColor: error ? '#EF4444' : 'var(--color-border)',
                                color: 'var(--color-text-dark)',
                                focusRingColor: 'var(--color-btn-b)'
                            }}
                            autoFocus
                        />
                        {error && (
                            <p
                                className="text-sm mt-2"
                                style={{ color: '#EF4444' }}
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: 'var(--color-bg-hover)',
                                color: 'var(--color-text-dark)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                            style={{
                                backgroundColor: 'var(--color-btn-b)',
                                color: 'var(--color-light)',
                                boxShadow: '0 4px 14px 0 rgba(74, 124, 89, 0.4)'
                            }}
                        >
                            <Save size={18} />
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default InputDialogModal;



