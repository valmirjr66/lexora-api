import { ScriptType } from 'src/types/script';

export default class UpdateScriptRequestModel {
    constructor(
        public id: string,
        public title?: string,
        public type?: ScriptType,
        public description?: string,
    ) {}
}
