export const DEFAULT_USER_EMAIL = 'user1@lexora.com';
export const DEFAULT_PASSWORD = '123';

export const SCRIPT_1 = {
    title: 'Intern',
    description:
        'That is the script for an intern position focused on JavaScript web development',
    blocks: [
        {
            type: 'open-question',
            content:
                'What are your experiences so far? Academically and professionally?',
        },
        {
            type: 'ok-nok',
            content:
                'Can you tell me the difference between == and === in JavaScript?',
        },
        { type: 'ok-nok', content: 'What is hoisting in JavaScript?' },
        {
            type: 'deep-knowledge',
            content:
                'Explain how JavaScript handles asynchronous operations and the event loop.',
        },
    ],
};
