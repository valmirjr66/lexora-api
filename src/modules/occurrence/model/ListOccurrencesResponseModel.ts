import { ListResponse } from 'src/types/generic';
import GetOccurrenceResponseModel from './GetOccurrenceResponseModel';

export default class ListOccurrencesResponseModel
    implements ListResponse<GetOccurrenceResponseModel>
{
    constructor(public items: GetOccurrenceResponseModel[]) {}
}
