import { ScriptBlockType } from 'src/types/script';

export default class UpdateScriptBlockRequestModel {
    public blockId: string;
    public type: ScriptBlockType;
    public content: string;
}
