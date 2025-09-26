import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function createOrUpdateSecret(name: string, value: string) {
    console.log(`Updating secret ${name} with value ${value}`);

    try {
        await client.getSecret({ name });
    } catch (err: any) {
        if (err.code === 5) {
            const match = name.match(/projects\/([^/]+)\/secrets\/([^/]+)/);
            if (!match) throw new Error('Invalid secret name format');
            const [, projectId, secretId] = match;

            await client.createSecret({
                parent: `projects/${projectId}`,
                secretId,
                secret: {
                    replication: { automatic: {} },
                },
            });
            console.info(`Created secret ${name}`);
        } else {
            throw err;
        }
    }

    const [secretVersion] = await client.addSecretVersion({
        parent: name,
        payload: {
            data: Buffer.from(value, 'utf8'),
        },
    });

    console.info(`Updated secret ${secretVersion.name}`);
}
