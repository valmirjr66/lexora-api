import { AssistantTool } from 'openai/resources/beta/assistants.mjs';

export const EVALO_TOOLS: AssistantTool[] = [
    {
        type: 'function',
        function: {
            name: 'get_applicant_info',
            description:
                "Retrieves applicant's information including name, short bio, professional experiences and education",
            strict: false,
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    }
];
