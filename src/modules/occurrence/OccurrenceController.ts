import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
} from '@nestjs/common';
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
import InsertOccurrenceRequestDto from './dto/InsertOccurrenceRequestDto';
import ListOccurrencesResponseDto from './dto/ListOccurrencesResponseDto';
import UpdateOccurrenceRequestDto from './dto/UpdateOccurrenceRequestDto';

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

    @Put('/:occurrenceId')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateOccurrence(
        @Param('occurrenceId') occurrenceId: string,
        @Body() body: UpdateOccurrenceRequestDto,
    ): Promise<void> {
        await this.occurrenceService.update({ ...body, id: occurrenceId });
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
