import { AssistantTool } from 'openai/resources/beta/assistants.mjs';

export const LEXORA_TOOLS: AssistantTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_user_info',
            description:
                "Retrieves user's information including fullname, email and birthdate",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_current_datetime',
            description: "Returns user's current date and time",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
];
