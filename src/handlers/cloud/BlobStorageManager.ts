import { Storage } from '@google-cloud/storage';
import { Injectable, Logger } from '@nestjs/common';
import { Stream } from 'stream';

@Injectable()
export default class BlobStorageManager {
    private readonly logger = new Logger('BlobStorageManager');
    private readonly bucketName = process.env.BLOB_STORAGE_BUCKET_NAME;
    private readonly storage = new Storage();

    async read(path: string): Promise<ArrayBuffer> {
        this.logger.log(
            `Reading file from bucket "${this.bucketName}" at path "${path}"`,
        );
        try {
            const contents = await this.storage
                .bucket(this.bucketName)
                .file(path)
                .download();

            this.logger.log(
                `Successfully read file "${path}" from bucket "${this.bucketName}"`,
            );

            return contents[0].buffer as ArrayBuffer;
        } catch (error) {
            this.logger.error(
                `Failed to read file "${path}" from bucket "${this.bucketName}": ${error}`,
            );
            throw error;
        }
    }

    async write(path: string, file: Buffer): Promise<void> {
        this.logger.log(
            `Writing file to bucket "${this.bucketName}" at path "${path}"`,
        );
        const passthroughStream = new Stream.PassThrough();
        passthroughStream.write(file);
        passthroughStream.end();

        const writeStream = this.storage
            .bucket(this.bucketName)
            .file(path)
            .createWriteStream();

        await new Promise<void>((resolve, reject) => {
            passthroughStream
                .pipe(writeStream)
                .on('finish', () => {
                    this.logger.log(
                        `Successfully wrote file "${path}" to bucket "${this.bucketName}"`,
                    );
                    resolve();
                })
                .on('error', (err) => {
                    this.logger.error(
                        `Error while trying to write file "${path}" to bucket "${this.bucketName}": ${err}`,
                    );
                    reject(err);
                });
        });
    }

    async delete(path: string): Promise<void> {
        this.logger.log(
            `Deleting file from bucket "${this.bucketName}" at path "${path}"`,
        );
        try {
            await this.storage.bucket(this.bucketName).file(path).delete();
            this.logger.log(
                `Successfully deleted file "${path}" from bucket "${this.bucketName}"`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to delete file "${path}" from bucket "${this.bucketName}": ${error}`,
            );
            throw error;
        }
    }
}
