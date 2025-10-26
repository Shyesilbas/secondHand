
export const ERROR_TYPES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NETWORK: 'network',
    SERVER: 'server',
    UNKNOWN: 'unknown'
};

export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Error message mappings using enum-based indexing
const ERROR_MESSAGES = {
    [ERROR_TYPES.NETWORK]: 'Check your internet connection and try again',
    [ERROR_TYPES.VALIDATION]: {
        400: 'Error in form fields. Please check and try again.',
        404: 'Page or source not found',
        422: 'Error in form fields. Please check and try again.',
        429: 'Too many requests'
    },
    [ERROR_TYPES.AUTHENTICATION]: {
        401: 'Authentication failed. Please check your credentials.'
    },
    [ERROR_TYPES.AUTHORIZATION]: {
        403: 'You do not have permission to perform this action'
    },
    [ERROR_TYPES.SERVER]: {
        500: 'Network error. Please try again later',
        502: 'Network error. Please try again later',
        503: 'Network error. Please try again later',
        504: 'Network error. Please try again later'
    },
    [ERROR_TYPES.UNKNOWN]: 'Unknown error occurred. Please try again later.'
};

const AUTHENTICATION_MESSAGES = {
    'invalid email or password': 'E-mail or password is wrong',
    'bad credentials': 'E-mail or password is wrong',
    'invalid': 'E-mail or password is wrong',
    'wrong password': 'E-mail or password is wrong',
    'account not found': 'No account found with this e-mail address',
    'user not found': 'No account found with this e-mail address',
    'account locked': 'Your account is locked. Contact support for more information',
    'account disabled': 'Your account is locked. Contact support for more information',
    'account not verified': 'Your account is not verified. Please check your e-mail for verification link',
    'email not verified': 'Your account is not verified. Please check your e-mail for verification link'
};

const VALIDATION_MESSAGES = {
    'email already exists': 'E-mail is in use',
    'invalid email format': 'Invalid e-mail format',
    'password too short': 'Password must be at least 6 characters long'
};

const ERROR_TITLES = {
    [ERROR_TYPES.AUTHENTICATION]: 'Authentication error',
    [ERROR_TYPES.AUTHORIZATION]: 'Authorization Error',
    [ERROR_TYPES.VALIDATION]: 'Validation Error',
    [ERROR_TYPES.NETWORK]: 'Network Error',
    [ERROR_TYPES.SERVER]: 'Server Error',
    [ERROR_TYPES.UNKNOWN]: 'Error'
};

export const parseError = (error) => {
    const defaultError = {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        message: ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
        originalMessage: '',
        statusCode: null,
        timestamp: new Date().toISOString(),
        details: null
    };

    if (!error) return defaultError;

    if (error.code === 'NETWORK_ERROR' || !error.response) {
        return {
            ...defaultError,
            type: ERROR_TYPES.NETWORK,
            severity: ERROR_SEVERITY.HIGH,
            message: ERROR_MESSAGES[ERROR_TYPES.NETWORK],
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

    // Determine error type and message using enum-based lookup
    let errorType = ERROR_TYPES.UNKNOWN;
    let message = ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];

    if (statusCode >= 400 && statusCode < 500) {
        if (statusCode === 401) {
            errorType = ERROR_TYPES.AUTHENTICATION;
            message = getAuthenticationMessage(errorData);
        } else if (statusCode === 403) {
            errorType = ERROR_TYPES.AUTHORIZATION;
            message = ERROR_MESSAGES[ERROR_TYPES.AUTHORIZATION][403];
        } else {
            errorType = ERROR_TYPES.VALIDATION;
            message = ERROR_MESSAGES[ERROR_TYPES.VALIDATION][statusCode] || getValidationMessage(errorData);
        }
    } else if (statusCode >= 500) {
        errorType = ERROR_TYPES.SERVER;
        message = ERROR_MESSAGES[ERROR_TYPES.SERVER][statusCode] || ERROR_MESSAGES[ERROR_TYPES.SERVER][500];
    }

    return {
        ...parsedError,
        type: errorType,
        message: message || errorData?.message || 'Unexpected error occurred. Please try again later'
    };
};

const getAuthenticationMessage = (errorData) => {
    const message = errorData?.message?.toLowerCase() || '';
    
    for (const [key, value] of Object.entries(AUTHENTICATION_MESSAGES)) {
        if (message.includes(key)) {
            return value;
        }
    }
    
    return errorData?.message || 'Error occurred while authenticating. Please try again later';
};

const getValidationMessage = (errorData) => {
    if (errorData?.errors && Array.isArray(errorData.errors)) {
        return errorData.errors.map(err => err.message || err).join(', ');
    }
    
    if (errorData?.validationErrors) {
        const errors = Object.values(errorData.validationErrors).flat();
        return errors.join(', ');
    }

    const message = errorData?.message || '';
    
    for (const [key, value] of Object.entries(VALIDATION_MESSAGES)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return message || 'Error in form fields. Please check and try again.';
};

export const handleError = (error, showError, options = {}) => {
    const parsedError = parseError(error);
    
    const {
        showOriginalMessage = false,
        customTitle = null,
        customMessage = null,
        showDetailedError = true,
        useModal = false,         actions = []
    } = options;

    const messageToShow = customMessage || 
                         (showOriginalMessage ? parsedError.originalMessage : parsedError.message);

        if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Details');
        console.error('Parsed Error:', parsedError);
        console.error('Original Error:', error);
        console.groupEnd();
    }

        if (useModal && typeof showError === 'function') {
        try {
                        if (showError.showDetailedError) {
                showError.showDetailedError(parsedError, {
                    customTitle,
                    customMessage: messageToShow,
                    showDetails: showDetailedError,
                    actions
                });
            } else {
                                showError(customTitle || getErrorTitle(parsedError), messageToShow);
            }
        } catch (e) {
                        console.error('Error notification failed:', e, messageToShow);
        }
    } else {
                showError(messageToShow);
    }

    return parsedError;
};

export const handleErrorWithModal = (error, notificationContext, options = {}) => {
    const parsedError = parseError(error);
    
    const {
        customTitle = null,
        customMessage = null,
        showDetails = true,
        actions = []
    } = options;

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

const getErrorTitle = (errorData) => {
    return ERROR_TITLES[errorData?.type] || 'Error';
};

export const shouldTriggerLogout = (parsedError) => {
    if (parsedError.type !== ERROR_TYPES.AUTHENTICATION) {
        return false;
    }

    const message = parsedError.originalMessage?.toLowerCase() || '';
    
    if (message.includes('invalid email or password') ||
        message.includes('bad credentials')) {
        return false;
    }

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