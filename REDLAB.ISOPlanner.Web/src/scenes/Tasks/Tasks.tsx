import React from "react";
//import { useTranslation } from "react-i18next";
import TaskDTO, { TaskCheckListItem, TaskCheckListItemState } from "../../models/dto/taskDTO";
import { apiGetTaskForEvent, apiUpdateTask } from "../../services/Api/taskService";
import { apiRequest } from "../../services/Auth/authConfig";
import AppContext from "../../components/App/AppContext";
import { Stack, Checkbox } from "@fluentui/react";

interface ITasksProps {}

interface ITasksState {
  task: TaskDTO;
}

interface ITaskListProps {
  task: TaskDTO;
  onSave: Function;
}

const TaskList: React.FunctionComponent<ITaskListProps> = (props: ITaskListProps) => {
  //const { t } = useTranslation();

  const setCheckListItemState = (ev?: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, checked?: boolean | undefined) => {

    if (props.task.checkList && props.task.checkList.items && props.task.checkList.items.length>0 && checked) {
      props.task.checkList.items[0].state = TaskCheckListItemState.Done;
    }

    if (props.task.checkList && props.task.checkList.items && props.task.checkList.items.length>0 && !checked) {
      props.task.checkList.items[0].state = TaskCheckListItemState.ToDo;
    }

    props.onSave();
  }

  return (
    <div>
      <p>{props.task.name}</p>
      <p>{props.task.eventId}</p>
      <p>{props.task.recurrencePattern?.pattern?.summary}</p>
      <ul>
        {props.task.checkList?.items?.map((item: TaskCheckListItem) => {
          return <li><Checkbox checked={item.state === TaskCheckListItemState.Done} onChange={setCheckListItemState}></Checkbox>{item.description}</li>
        })}
      </ul>
    </div>
  )
};

export default class Tasks extends React.Component<ITasksProps, ITasksState> {
  static contextType = AppContext;

  constructor(props: ITasksProps) {
    super(props);
    this.state = {
      task: new TaskDTO(),
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    try {
      this.context.showContentLoader();

      const eventId = "AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0ASob_gLILBkqmsfXCe_UwTAAAS_jomAAA";
      const eventDate = undefined;

      var accessToken = await this.context.getAccessToken(apiRequest.scopes);

      var task: TaskDTO = await apiGetTaskForEvent(eventId, eventDate, accessToken);
      this.setState({ task: task });
    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
    }
  }

  saveData = async () => {
    try {
      this.context.showContentLoader();

      var accessToken = await this.context.getAccessToken(apiRequest.scopes);
      await apiUpdateTask(this.state.task, accessToken);

    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
    }
  }

  render() {
    return (
      <Stack>
        <TaskList task={this.state.task} onSave={this.saveData} />
      </Stack>
    );
  }
}
