import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import LexoraService from './LexoraService';
import GetChatByUserIdResponseDto from './dto/GetChatByUserIdResponseDto';
import HandleIncomingMessageRequestDto from './dto/HandleIncomingMessageRequestDto';
import HandleIncomingMessageResponseDto from './dto/HandleIncomingMessageResponseDto';

@ApiTags('Assistant')
@Controller('assistants/lexora')
export default class LexoraController {
    constructor(private readonly lexoraService: LexoraService) {}

    @Get('/chat')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetChatByUserIdResponseDto,
    })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getChat(
        @Query('userId') userId: string,
    ): Promise<GetChatByUserIdResponseDto> {
        const response = await this.lexoraService.getChatByUserId(userId);
        return response;
    }

    @Post('/chat/message')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: HandleIncomingMessageResponseDto,
    })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async handleIncomingMessage(
        @Body() dto: HandleIncomingMessageRequestDto,
    ): Promise<HandleIncomingMessageResponseDto> {
        const response = await this.lexoraService.handleIncomingMessage({
            content: dto.content,
            userId: dto.content,
        });

        return response;
    }
}
