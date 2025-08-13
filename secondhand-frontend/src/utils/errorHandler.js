/**
 * Modern error handling utilities for the application
 */

// Error types for better categorization
export const ERROR_TYPES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NETWORK: 'network',
    SERVER: 'server',
    UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Parse error response and extract relevant information
 * @param {Error} error - The error object from axios or other sources
 * @returns {Object} Parsed error information
 */
export const parseError = (error) => {
    const defaultError = {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        message: 'Bilinmeyen bir hata oluştu',
        originalMessage: '',
        statusCode: null,
        timestamp: new Date().toISOString(),
        details: null
    };

    if (!error) return defaultError;

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
        return {
            ...defaultError,
            type: ERROR_TYPES.NETWORK,
            severity: ERROR_SEVERITY.HIGH,
            message: 'İnternet bağlantınızı kontrol edin',
            originalMessage: error.message || 'Network error'
        };
    }

    const { response } = error;
    const statusCode = response?.status;
    const errorData = response?.data;

    let parsedError = {
        ...defaultError,
        statusCode,
        originalMessage: errorData?.message || error.message,
        details: errorData
    };

    // Parse based on status code
    switch (statusCode) {
        case 400:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.VALIDATION,
                severity: ERROR_SEVERITY.MEDIUM,
                message: getValidationErrorMessage(errorData)
            };
            break;

        case 401:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.AUTHENTICATION,
                severity: ERROR_SEVERITY.MEDIUM,
                message: getAuthenticationErrorMessage(errorData)
            };
            break;

        case 403:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.AUTHORIZATION,
                severity: ERROR_SEVERITY.HIGH,
                message: getAuthorizationErrorMessage(errorData)
            };
            break;

        case 404:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.VALIDATION,
                severity: ERROR_SEVERITY.MEDIUM,
                message: 'Aradığınız sayfa veya kaynak bulunamadı'
            };
            break;

        case 422:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.VALIDATION,
                severity: ERROR_SEVERITY.MEDIUM,
                message: getValidationErrorMessage(errorData)
            };
            break;

        case 429:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.VALIDATION,
                severity: ERROR_SEVERITY.MEDIUM,
                message: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin'
            };
            break;

        case 500:
        case 502:
        case 503:
        case 504:
            parsedError = {
                ...parsedError,
                type: ERROR_TYPES.SERVER,
                severity: ERROR_SEVERITY.HIGH,
                message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin'
            };
            break;

        default:
            parsedError = {
                ...parsedError,
                message: errorData?.message || 'Beklenmeyen bir hata oluştu'
            };
    }

    return parsedError;
};

/**
 * Get user-friendly authentication error message
 */
const getAuthenticationErrorMessage = (errorData) => {
    const message = errorData?.message?.toLowerCase() || '';
    
    if (message.includes('invalid email or password') || 
        message.includes('bad credentials') ||
        message.includes('invalid') ||
        message.includes('wrong password')) {
        return 'E-posta adresi veya şifre hatalı';
    }
    
    if (message.includes('account not found') ||
        message.includes('user not found')) {
        return 'Bu e-posta adresi ile kayıtlı hesap bulunamadı';
    }
    
    if (message.includes('account locked') ||
        message.includes('account disabled')) {
        return 'Hesabınız kilitlenmiş. Lütfen destek ekibi ile iletişime geçin';
    }
    
    if (message.includes('account not verified') ||
        message.includes('email not verified')) {
        return 'Hesabınız henüz doğrulanmamış. Lütfen e-postanızı kontrol edin';
    }

    return errorData?.message || 'Giriş yapılırken hata oluştu';
};

/**
 * Get user-friendly authorization error message
 */
const getAuthorizationErrorMessage = (errorData) => {
    const message = errorData?.message?.toLowerCase() || '';
    
    if (message.includes('access denied') ||
        message.includes('forbidden')) {
        return 'Bu işlemi gerçekleştirme yetkiniz bulunmuyor';
    }
    
    if (message.includes('insufficient permissions')) {
        return 'Yetersiz yetki. Bu özelliği kullanabilmek için gerekli izinlere sahip değilsiniz';
    }

    return errorData?.message || 'Erişim reddedildi';
};

/**
 * Get user-friendly validation error message
 */
const getValidationErrorMessage = (errorData) => {
    if (errorData?.errors && Array.isArray(errorData.errors)) {
        return errorData.errors.map(err => err.message || err).join(', ');
    }
    
    if (errorData?.validationErrors) {
        const errors = Object.values(errorData.validationErrors).flat();
        return errors.join(', ');
    }

    const message = errorData?.message || '';
    
    // Common validation messages
    if (message.includes('email already exists')) {
        return 'Bu e-posta adresi zaten kullanımda';
    }
    
    if (message.includes('invalid email format')) {
        return 'Geçersiz e-posta adresi formatı';
    }
    
    if (message.includes('password too short')) {
        return 'Şifre en az 6 karakter olmalıdır';
    }

    return message || 'Girilen bilgilerde hata var';
};

/**
 * Create a standardized error notification
 * @param {Error} error - The original error
 * @param {Function} showError - Error notification function (can be toast or modal)
 * @param {Object} options - Additional options
 */
export const handleError = (error, showError, options = {}) => {
    const parsedError = parseError(error);
    
    const {
        showOriginalMessage = false,
        customTitle = null,
        customMessage = null,
        showDetailedError = true,
        useModal = false, // Set to true to use modal notifications
        actions = []
    } = options;

    const messageToShow = customMessage || 
                         (showOriginalMessage ? parsedError.originalMessage : parsedError.message);

    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Details');
        console.error('Parsed Error:', parsedError);
        console.error('Original Error:', error);
        console.groupEnd();
    }

    // Use enhanced modal notification if available and requested
    if (useModal && typeof showError === 'function') {
        try {
            // Try to use showDetailedError method (for modal notifications)
            if (showError.showDetailedError) {
                showError.showDetailedError(parsedError, {
                    customTitle,
                    customMessage: messageToShow,
                    showDetails: showDetailedError,
                    actions
                });
            } else {
                // Fallback to regular error method
                showError(customTitle || getErrorTitle(parsedError), messageToShow);
            }
        } catch (e) {
            // Final fallback - avoid blocking alerts
            console.error('Error notification failed:', e, messageToShow);
        }
    } else {
        // Use traditional toast or simple error notification
        showError(messageToShow);
    }

    return parsedError;
};

/**
 * Enhanced error handler specifically for modal notifications
 * @param {Error} error - The original error
 * @param {Object} notificationContext - The notification context with methods
 * @param {Object} options - Additional options
 */
export const handleErrorWithModal = (error, notificationContext, options = {}) => {
    const parsedError = parseError(error);
    
    const {
        customTitle = null,
        customMessage = null,
        showDetails = true,
        actions = []
    } = options;

    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Details');
        console.error('Parsed Error:', parsedError);
        console.error('Original Error:', error);
        console.groupEnd();
    }

    const title = customTitle || getErrorTitle(parsedError);
    const message = customMessage || parsedError.message;

    notificationContext.showDetailedError(parsedError, {
        customTitle: title,
        customMessage: message,
        showDetails,
        actions
    });

    return parsedError;
};

// Helper function to get error title
const getErrorTitle = (errorData) => {
    if (!errorData || !errorData.type) return 'Hata';
    
    switch (errorData.type) {
        case 'authentication':
            return 'Giriş Hatası';
        case 'authorization':
            return 'Yetki Hatası';
        case 'validation':
            return 'Doğrulama Hatası';
        case 'network':
            return 'Bağlantı Hatası';
        case 'server':
            return 'Sunucu Hatası';
        default:
            return 'Hata';
    }
};

/**
 * Check if error should trigger logout (for expired sessions, etc.)
 * @param {Object} parsedError - Parsed error object
 * @returns {boolean}
 */
export const shouldTriggerLogout = (parsedError) => {
    if (parsedError.type !== ERROR_TYPES.AUTHENTICATION) {
        return false;
    }

    const message = parsedError.originalMessage?.toLowerCase() || '';
    
    // Don't trigger logout for login attempts with bad credentials
    if (message.includes('invalid email or password') ||
        message.includes('bad credentials')) {
        return false;
    }

    // Trigger logout for expired tokens, invalid sessions, etc.
    return message.includes('token expired') ||
           message.includes('invalid token') ||
           message.includes('session expired') ||
           message.includes('unauthorized access');
};

export default {
    parseError,
    handleError,
    handleErrorWithModal,
    shouldTriggerLogout,
    ERROR_TYPES,
    ERROR_SEVERITY
};