import { ListResponse } from 'src/types/generic';
import { GetScriptBlockResponseModel } from './GetScriptResponseModel';

export default class ListScriptBlocksResponseModel
  implements ListResponse<GetScriptBlockResponseModel>
{
  constructor(public items: GetScriptBlockResponseModel[]) { }
}
