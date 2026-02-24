import { ScriptType } from 'src/types/script';

export default class InsertScriptRequestModel {
    constructor(
        public userId: string,
        public title: string,
        public type: ScriptType,
        public description?: string,
    ) {}
}
