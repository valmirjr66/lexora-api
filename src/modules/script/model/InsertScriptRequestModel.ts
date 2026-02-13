import { ScriptType } from 'src/types/script';

export default class InsertScriptRequestModel {
    constructor(
        public owner: string,
        public title: string,
        public type: ScriptType,
        public description?: string,
    ) {}
}
