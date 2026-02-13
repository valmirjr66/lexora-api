import { ScriptBlockType, ScriptType } from 'src/types/script';

export class GetScriptBlockResponseModel {
    constructor(
        public id: string,
        public scriptId: string,
        public type: ScriptBlockType,
        public content: string,
        public objective: string | undefined,
        public expectedResponse: string | undefined,
        public commonMistakes: string | undefined,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}

export default class GetScriptResponseModel {
    constructor(
        public id: string,
        public owner: string,
        public title: string,
        public type: ScriptType,
        public version: number,
        public description: string | undefined,
        public blocks: GetScriptBlockResponseModel[],
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
