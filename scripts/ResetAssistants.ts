import * as dotenv from 'dotenv';
import fs from 'fs';
import { OpenAI } from 'openai';
import { AssistantTool } from 'openai/resources/beta/assistants.mjs';
import askForConfirmation from './AskForConfirmation';
import { LEXORA_TOOLS } from './AssistantToolsHelpers';
import { createOrUpdateSecret } from './SecretManagerHelper';

dotenv.config();

const OPENAI_CLIENT = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_TO_BE_USED = 'gpt-4o';

const LEXORA_INSTRUCTIONS = `
You are Lexora, a virtual assistant created to help users conduct interviews and research based on the context provided and pre-defined scripts/
Always be conscise and clear, but also sympathetic. Your messages will be presented in a dynamic UI, so enrich your answers with Markdown when seem fit.
Be structured, quickly readable and visually intuititive.
`.trim();

function updateEnvFile(key: string, value: string, envFilePath = '.env') {
    try {
        console.log(`Reading environment file: ${envFilePath}`);
        const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
        const lines = envFileContent.split('\n');

        let keyUpdated = false;

        const updatedLines = lines.map((line) => {
            if (line.startsWith(`${key}=`)) {
                keyUpdated = true;
                console.log(`Updating key "${key}" in .env file`);
                return `${key}="${value}"`;
            }
            return line;
        });

        if (!keyUpdated) {
            console.log(
                `Key "${key}" not found in .env file, adding new entry`,
            );
            updatedLines.push(`${key}=${value}`);
        }

        fs.writeFileSync(envFilePath, updatedLines.join('\n'));
        console.log(
            `Successfully updated ${key} in ${envFilePath} to ${value}`,
        );
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error updating .env file:`,
            error,
        );
    }
}

async function createOrUpdateAssistant(
    name: string,
    instructions: string,
    envFileKey: string | null,
    secretNameEnvVar: string,
    tools: AssistantTool[],
) {
    if (!secretNameEnvVar) {
        throw new Error(`Secret name for assistant "${name}" is not defined.`);
    }

    console.log(`Fetching assistants list from OpenAI`);
    const assistantsList = await OPENAI_CLIENT.beta.assistants.list();

    console.log(`Searching for assistant with name: "${name}"`);
    const assistant = assistantsList.data.find(
        (assistant) => assistant.name === name,
    );

    let assistantId = assistant ? assistant.id : null;

    if (assistant) {
        console.log(
            `Assistant "${name}" found (id: ${assistant.id}), updating...`,
        );
        await OPENAI_CLIENT.beta.assistants.update(assistant.id, {
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: tools,
        });
        console.log(`Assistant "${name}" updated successfully.`);
    } else {
        console.log(`Assistant "${name}" not found, creating new assistant...`);
        const createdAssistant = await OPENAI_CLIENT.beta.assistants.create({
            name: name,
            model: MODEL_TO_BE_USED,
            instructions: instructions,
            tools: tools,
        });
        console.log(
            `New assistant created with name "${name}" and id "${createdAssistant.id}"`,
        );
        assistantId = createdAssistant.id;
    }

    if (envFileKey) {
        updateEnvFile(envFileKey, assistantId);
    }

    createOrUpdateSecret(secretNameEnvVar, assistantId);
}

async function resetAssistants() {
    const isProd = process.env.ENVIRONMENT === 'prod';

    if (isProd) {
        await askForConfirmation(
            'You are about to reset assistants in PRODUCTION environment. Do you want to proceed?',
        );
    }

    console.log(
        `Starting assistants reset process. Environment: ${isProd ? 'Production' : 'Development'}`,
    );

    await createOrUpdateAssistant(
        isProd ? 'Prod Lexora' : 'Dev Lexora',
        LEXORA_INSTRUCTIONS,
        isProd ? null : 'LEXORA_ID',
        process.env.LEXORA_ID_SECRET_NAME,
        LEXORA_TOOLS,
    );

    console.log('Assistants updated and secrets set.');
}

resetAssistants();
