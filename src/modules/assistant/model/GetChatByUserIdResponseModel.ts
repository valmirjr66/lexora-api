import { ListResponse } from 'src/types/generic';
import GetMessageResponseModel from './GetMessageResponseModel';

export default class GetChatByUserIdResponseModel
    implements ListResponse<GetMessageResponseModel>
{
    constructor(public items: GetMessageResponseModel[]) {}
}
