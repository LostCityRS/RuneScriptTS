import { SubjectMode } from '#/runescript-compiler/trigger/SubjectMode.js';
import { TriggerType } from '#/runescript-compiler/trigger/TriggerType.js';

export const CommandTrigger: TriggerType = {
    id: -1,
    identifier: 'command',
    subjectMode: SubjectMode.Name,
    allowParameters: true,
    parameters: null,
    allowReturns: true,
    returns: null,
    pointers: null
};
