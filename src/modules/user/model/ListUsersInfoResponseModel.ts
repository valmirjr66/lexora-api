import { ListResponse } from 'src/types/generic';
import GetUserInfoResponseModel from './GetUserInfoResponseModel';

export default class ListUsersInfoResponseModel
    implements ListResponse<GetUserInfoResponseModel>
{
    constructor(public items: GetUserInfoResponseModel[]) {}
}
