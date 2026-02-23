import { SCRIPT_BLOCK_TYPE, SCRIPT_TYPE } from 'src/constants';

export type ScriptBlockType =
    (typeof SCRIPT_BLOCK_TYPE)[keyof typeof SCRIPT_BLOCK_TYPE];

export type ScriptType = (typeof SCRIPT_TYPE)[keyof typeof SCRIPT_TYPE];
