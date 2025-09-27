import { ListResponse } from 'src/types/generic';
import GetScriptResponseModel from './GetScriptResponseModel';

export default class ListScriptsResponseModel
    implements ListResponse<GetScriptResponseModel>
{
    constructor(public items: GetScriptResponseModel[]) {}
}
