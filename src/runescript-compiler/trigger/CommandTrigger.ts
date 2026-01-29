import { TriggerType } from './TriggerType';

export const CommandTrigger: TriggerType = {
    id: -1,
    identifier: 'command',
    subjectMode: { kind: 'Name' },
    allowParameters: true,
    parameters: null,
    allowReturns: true,
    returns: null,
    pointers: null
}