import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import OccurrenceService from './OccurrenceService';
import AttachTranscriptRequestDto from './dto/AttachTranscriptRequestDto';
import InsertOccurrenceRequestDto from './dto/InsertOccurrenceRequestDto';
import ListOccurrencesResponseDto from './dto/ListOccurrencesResponseDto';

@ApiTags('Occurrence')
@Controller('scripts/:scriptId/occurrences')
export default class OccurrenceController {
    constructor(private readonly occurrenceService: OccurrenceService) {}

    @Get()
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListOccurrencesResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listOccurrences(
        @Param('scriptId') scriptId: string,
    ): Promise<ListOccurrencesResponseDto> {
        const response = await this.occurrenceService.listByScriptId(scriptId);
        return response;
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async postOccurrence(
        @Param('scriptId') scriptId: string,
        @Body() body: InsertOccurrenceRequestDto,
    ): Promise<{ id: string }> {
        const response = await this.occurrenceService.insert({
            ...body,
            scriptId,
        });
        return response;
    }

    @Post('/:occurrenceId/attach-transcript')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async attachTranscript(
        @Param('occurrenceId') occurrenceId: string,
        @Body() body: AttachTranscriptRequestDto,
    ): Promise<void> {
        await this.occurrenceService.attachTranscript(
            occurrenceId,
            body.transcriptRaw,
        );
    }

    @Post('/:occurrenceId/process')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async processOccurrence(
        @Param('occurrenceId') occurrenceId: string,
    ): Promise<void> {
        await this.occurrenceService.processOccurrence(occurrenceId);
    }

    @Delete('/:occurrenceId')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteOccurrence(
        @Param('scriptId') scriptId: string,
        @Param('occurrenceId') occurrenceId: string,
    ): Promise<void> {
        await this.occurrenceService.delete(scriptId, occurrenceId);
    }
}
