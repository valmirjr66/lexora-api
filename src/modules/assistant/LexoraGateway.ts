import speech from '@google-cloud/speech';
import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import LexoraService from './LexoraService';
import HandleIncomingMessageRequestPayload from './events/payloads/HandleIncomingMessageRequestPayload';
import HandleIncomingMessageRequestModel from './model/HandleIncomingMessageRequestModel';

@WebSocketGateway({ cors: true })
export default class LexoraGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly lexoraService: LexoraService) {}

    @WebSocketServer() server: Server;
    private readonly logger: Logger = new Logger('LexoraGateway');
    private speechClient = new speech.SpeechClient();
    private audioStreams = new Map<string, any>();

    @SubscribeMessage('message')
    handleMessage(
        client: Socket,
        payload: HandleIncomingMessageRequestPayload,
    ): void {
        this.logger.log(`Received 'message' event from client: ${client.id}`);
        this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

        const { userId, content } = payload;

        const messageModel = new HandleIncomingMessageRequestModel(
            userId,
            content,
        );

        this.logger.debug(
            `Constructed HandleIncomingMessageRequestModel: ${JSON.stringify(messageModel)}`,
        );

        const streamingCallback = (
            userId: string,
            textSnapshot: string,
            finished?: boolean,
        ) => {
            this.logger.log(
                `Streaming callback for user: ${userId}, finished: ${finished ?? false}`,
            );
            this.logger.debug(`Text snapshot: ${textSnapshot}`);
            this.server.emit('message', {
                userId,
                textSnapshot,
                finished,
            });
        };

        this.logger.log('Calling assistantService.handleIncomingMessage...');
        this.lexoraService.handleIncomingMessage(
            messageModel,
            streamingCallback,
        );
    }

    // TODO: REVISAR CÓDIGO DE PoC
    @SubscribeMessage('audio_chunk')
    handleAudio(client: Socket, payload: Buffer): void {
        this.logger.log(
            `Received 'audio_chunk' event from client: ${client.id}`,
        );

        if (!this.audioStreams.has(client.id)) {
            this.logger.log(
                `Starting new audio stream for client: ${client.id}`,
            );

            const recognizeStream = this.speechClient
                .streamingRecognize({
                    config: {
                        encoding: 'WEBM_OPUS', // matching frontend MediaRecorder
                        sampleRateHertz: 48000, // typical for getUserMedia
                        languageCode: 'pt-BR',
                    },
                    interimResults: true, // get partial results
                })
                .on('data', (data) => {
                    if (data.results[0]) {
                        client.emit('transcript', {
                            text: data.results[0].alternatives[0].transcript,
                            isFinal: data.results[0].isFinal,
                        });
                    }
                })
                .on('error', (err) => {
                    this.audioStreams.get(client.id).end();
                    this.audioStreams.delete(client.id);
                    this.logger.error(`Speech API error: ${err}`);
                });

            this.audioStreams.set(client.id, recognizeStream);
        }

        const stream = this.audioStreams.get(client.id);
        stream.write(payload);
    }

    @SubscribeMessage('end_recording')
    handleEndRecording(client: Socket) {
        const stream = this.audioStreams.get(client.id);
        if (stream) {
            stream.end();
            this.audioStreams.delete(client.id);
        }
    }
    // TODO: REVISAR CÓDIGO DE PoC

    afterInit() {
        this.logger.log('Init');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
