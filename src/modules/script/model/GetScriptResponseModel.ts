import { ScriptBlockType } from 'src/types/script';

export class GetScriptBlockResponseModel {
    constructor(
        public id: string,
        public type: ScriptBlockType,
        public content: string,
    ) {}
}

export default class GetScriptResponseModel {
    constructor(
        public id: string,
        public userId: string,
        public title: string,
        public description: string,
        public blocks: GetScriptBlockResponseModel[],
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
