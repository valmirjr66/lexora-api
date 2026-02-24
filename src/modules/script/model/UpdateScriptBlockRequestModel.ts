import { ScriptBlockType } from 'src/types/script';

export default class UpdateScriptBlockRequestModel {
    public blockId: string;
    public type: ScriptBlockType;
    public order: number;
    public content: string;
    public objective?: string;
    public expectedResponse?: string;
    public commonMistakes?: string;
}
