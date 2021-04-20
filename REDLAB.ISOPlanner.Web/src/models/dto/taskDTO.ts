export enum TaskCheckListItemState {
  ToDo = 0,
  InProgress = 1,
  Done = 2,
}

export class TaskCheckListItem {
  state?: TaskCheckListItemState;
  description?: string;
}

export class TaskCheckList {
  items?: Array<TaskCheckListItem>;
}

export class TaskRecurrencePattern {
  summary?: string;
  duration?: number;
}

export class TaskRecurrence {
  pattern?: TaskRecurrencePattern;
}

export class SamplePattern {
  sample?: string;
}

export default class TaskDTO {
  tenantId?: string;
  taskId?: string;
  taskMasterId?: string;
  taskStateId?: string;
  externalAppCode?: string;
  externalId?: string;
  externalUrl?: string;
  groupId?: string;
  userIds?: Array<string>;
  commentTrailId?: string;
  auditTrailId?: string;
  name?: string;
  description?: string;
  priority?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  checkList?: TaskCheckList;
  eventId?: string;
  passed?: boolean;
  recurrencePattern?: TaskRecurrence;
  samplePattern?: SamplePattern;
  norm?: string;
  control?: string;
}
