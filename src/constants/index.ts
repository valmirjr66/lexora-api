export const MESSAGE_ROLE = {
    SYSTEM: 'system',
    USER: 'user',
    ASSISTANT: 'assistant',
    TOOL: 'tool',
} as const;

export const MESSAGE_ROLES = Object.values(MESSAGE_ROLE);

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

export const SCRIPT_BLOCK_TYPE = {
    EVAL: 'EVAL',
    OPEN: 'OPEN',
} as const;

export const SCRIPT_BLOCK_TYPES = Object.values(SCRIPT_BLOCK_TYPE);

export const SCRIPT_TYPE = {
    TECHNICAL_INTERVIEW: 'TECHNICAL_INTERVIEW',
} as const;

export const SCRIPT_TYPES = Object.values(SCRIPT_TYPE);

export const OCCURRENCE_STATUS = {
    CREATED: 'CREATED',
    READY: 'READY',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
} as const;

export const OCCURRENCE_STATUSES = Object.values(OCCURRENCE_STATUS);
