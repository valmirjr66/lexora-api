import { SCRIPT_BLOCK_TYPES, SCRIPT_TYPES } from 'src/constants';

export type ScriptBlockType = (typeof SCRIPT_BLOCK_TYPES)[number];

export type ScriptType = (typeof SCRIPT_TYPES)[number];
