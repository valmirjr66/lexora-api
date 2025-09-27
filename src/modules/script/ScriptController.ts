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
} from '@nestjs/common';
import {
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RESPONSE_DESCRIPTIONS } from 'src/constants';
import ScriptService from './ScriptService';
import GetScriptResponseDto from './dto/GetScriptResponseDto';
import InsertScriptRequestDto from './dto/InsertScriptRequestDto';
import ListScriptsResponseDto from './dto/ListScriptsResponseDto';
import UpdateScriptRequestDto from './dto/UpdateScriptRequestDto';

@ApiTags('Script')
@Controller('scripts')
export default class ScriptController {
    constructor(private readonly scriptService: ScriptService) {}

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
    async listScript(): Promise<ListScriptsResponseDto> {
        const response = await this.scriptService.listScripts();
        return response;
    }
}
