import { ScriptBlockType } from 'src/types/script';

export default class InsertScriptBlockRequestModel {
    public scriptId: string;
    public type: ScriptBlockType;
    public content: string;
}
