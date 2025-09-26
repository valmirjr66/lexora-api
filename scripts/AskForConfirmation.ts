import { exit } from 'process';
import readline from 'readline';

async function getUserInput(query: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(query + ' (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function exitProcess() {
    console.log('Operation cancelled.');
    exit(0);
}

export default async function askForConfirmation(query: string) {
    const confirmed = await getUserInput(query);

    if (confirmed) {
        console.log('Operation confirmed. Proceeding...');
    } else {
        exitProcess();
    }
}
