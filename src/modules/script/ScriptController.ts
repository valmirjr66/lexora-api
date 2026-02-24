import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import ScriptBlockService from './ScriptBlockService';
import ScriptService from './ScriptService';
import GetScriptResponseDto from './dto/GetScriptResponseDto';
import InsertScriptBlockRequestDto from './dto/InsertScriptBlockRequestDto';
import InsertScriptRequestDto from './dto/InsertScriptRequestDto';
import ListScriptBlocksResponseDto from './dto/ListScriptBlocksResponseDto';
import ListScriptsResponseDto from './dto/ListScriptsResponseDto';
import UpdateScriptBlockRequestDto from './dto/UpdateScriptBlockRequestDto';
import UpdateScriptRequestDto from './dto/UpdateScriptRequestDto';

@ApiTags('Script')
@Controller('scripts')
export default class ScriptController {
    constructor(
        private readonly scriptService: ScriptService,
        private readonly scriptBlockService: ScriptBlockService,
    ) {}

    @Get('/:id')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: GetScriptResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async getScriptById(
        @Param('id') id: string,
    ): Promise<GetScriptResponseDto> {
        const response = await this.scriptService.getScriptById(id);
        return response;
    }

    @Delete('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteScriptById(@Param('id') id: string): Promise<void> {
        await this.scriptService.deleteScriptById(id);
    }

    @Post()
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async postScript(
        @Body() body: InsertScriptRequestDto,
    ): Promise<{ id: string }> {
        const response = await this.scriptService.insertScript(body);
        if (response === 'existing title') {
            throw new HttpException(
                'There is already a script with this title for this user',
                HttpStatus.CONFLICT,
            );
        } else {
            return response;
        }
    }

    @Put('/:id')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiConflictResponse({ description: RESPONSE_DESCRIPTIONS.CONFLICT })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateScript(
        @Param('id') id: string,
        @Body() body: UpdateScriptRequestDto,
    ): Promise<void> {
        await this.scriptService.updateScript({ ...body, id });
    }

    @Get()
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListScriptsResponseDto,
    })
    @ApiNoContentResponse({ description: RESPONSE_DESCRIPTIONS.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listScripts(
        @Query('userId') userId?: string,
    ): Promise<ListScriptsResponseDto> {
        const response = await this.scriptService.listScripts(userId);
        return response;
    }

    @Get('/:id/blocks')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
        type: ListScriptBlocksResponseDto,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async listScriptBlocks(
        @Param('id') id: string,
    ): Promise<ListScriptBlocksResponseDto> {
        const response = await this.scriptBlockService.listByScriptId(id);
        return response;
    }

    @Post('/:id/blocks')
    @ApiCreatedResponse({ description: RESPONSE_DESCRIPTIONS.CREATED })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async postScriptBlock(
        @Param('id') id: string,
        @Body() body: InsertScriptBlockRequestDto,
    ): Promise<{ id: string }> {
        const response = await this.scriptBlockService.insert({
            ...body,
            scriptId: id,
        });
        return response;
    }

    @Put('/:id/blocks/:blockId')
    @ApiOkResponse({
        description: RESPONSE_DESCRIPTIONS.OK,
    })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiBadRequestResponse({ description: RESPONSE_DESCRIPTIONS.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async updateScriptBlock(
        @Param('blockId') blockId: string,
        @Body() body: UpdateScriptBlockRequestDto,
    ): Promise<void> {
        await this.scriptBlockService.update({ ...body, blockId });
    }

    @Delete('/:id/blocks/:blockId')
    @ApiOkResponse({ description: RESPONSE_DESCRIPTIONS.OK })
    @ApiNotFoundResponse({ description: RESPONSE_DESCRIPTIONS.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: RESPONSE_DESCRIPTIONS.INTERNAL_SERVER_ERROR,
    })
    async deleteScriptBlock(
        @Param('id') scriptId: string,
        @Param('blockId') blockId: string,
    ): Promise<void> {
        await this.scriptBlockService.delete(scriptId, blockId);
    }
}
