export const MESSAGE_ROLES = ['system', 'user', 'assistant', 'tool'] as const;

export const RESPONSE_DESCRIPTIONS = {
    NO_CONTENT: 'No content',
    NOT_FOUND: 'Not found',
    BAD_REQUEST: 'Bad request',
    CREATED: 'Created',
    OK: 'Ok',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    CONFLICT: 'Conflict',
    UNAUTHORIZED: 'Unauthorized',
};

export const SCRIPT_BLOCK_TYPES = [
    'ok-nok',
    'open-question',
    'deep-knowledge',
] as const;
