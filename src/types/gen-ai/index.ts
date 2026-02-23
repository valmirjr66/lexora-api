import { MESSAGE_ROLE } from 'src/constants';

export type MessageRole = (typeof MESSAGE_ROLE)[keyof typeof MESSAGE_ROLE];
