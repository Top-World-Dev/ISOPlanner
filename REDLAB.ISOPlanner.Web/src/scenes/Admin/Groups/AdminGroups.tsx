import React from "react";
import Groups from "../../../models/group";
import { withTranslation, WithTranslation } from "react-i18next";
import AppContext from "../../../components/App/AppContext";
import { globalStackStylesHeight100, globalStackTokensGapMedium } from "../../../globalStyles";
import { IPivotItemProps } from "../../../components/SceneBar/ScenePivot";
import SceneBar from "components/SceneBar/SceneBar";
import { Text, Stack, CommandBar, ICommandBarItemProps, IButtonProps } from "@fluentui/react";

interface IAdminGroupsProps extends WithTranslation {}

interface IAdminGroupsState {
  groups: Groups[];
  isLoading: boolean;
  isUpdating: boolean;
  showAddPanel: boolean;
}

class AdminGroups extends React.Component<IAdminGroupsProps, IAdminGroupsState> {
  static contextType = AppContext;
  private _sceneBaseURL = "/admin/groups";
  
  constructor(props: IAdminGroupsProps) {
    super(props);

    this.state = {
      groups: [],
      isLoading: false,
      isUpdating: false,
      showAddPanel: false,
    };
  }  

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      this.setState({ isLoading: true });
      this.context.showContentLoader();

    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
      this.setState({ isLoading: false });
    }
  }

  getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: "AddGroup",
        text: this.props.t("adminGroups:Commands.addGroup"),
        iconProps: { iconName: "Add" },
      },
      {
        key: "RemoveGroup",
        text: this.props.t("adminGroups:Commands.removeGroup"),
        iconProps: { iconName: "Delete" },
      },
      {
        key: "UpdateGroupName",
        text: this.props.t("adminGroups:Commands.updateGroup"),
        iconProps: { iconName: "PageEdit"}
      }
    ];
  };

  render() {
    return (
      <Stack horizontal styles={globalStackStylesHeight100}>
        <Stack.Item grow>
          <Stack verticalFill tokens={globalStackTokensGapMedium}>
            <Stack.Item>
              <SceneBar
               user={this.context.group}
               title={this.props.t("adminGroups:Title")}
               subtitle={this.props.t("adminGroups:SubTitle")}
               image="admin-users.png"
               pivotItems={undefined}
               selectedPivotKey={undefined}
               baseURL={this._sceneBaseURL}
              ></SceneBar>
            </Stack.Item>
            <Stack.Item>
              <CommandBar items={this.getCommandBarItems()}></CommandBar>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    )
  }
}

export default withTranslation(["translation", "adminGroups"])(AdminGroups)