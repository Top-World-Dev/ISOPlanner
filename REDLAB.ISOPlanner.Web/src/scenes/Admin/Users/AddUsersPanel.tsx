import React from "react";
import { Panel, PanelType, IFocusTrapZoneProps, PrimaryButton, Text, Checkbox } from "@fluentui/react";
import { Stack, SelectedPeopleList, IExtendedPersonaProps } from "@fluentui/react";
import CurrentUser from "../../../models/currentuser";
import AppContext from "../../../components/App/AppContext";
import { withTranslation, WithTranslation } from "react-i18next";
import User from "../../../models/user";
import {
  globalLayerRightSideBarProps,
  globalStackTokensGapLarge,
  globalStackStylesPanel,
  globalTextStylesPaddingLabelPanel,
} from "../../../globalStyles";
import AdUserPicker from "../../../components/Pickers/AdUserPicker";
import WarningMessage from "../../../components/Notification/WarningMessage";
import { DialogOk } from "../../../components/Dialogs/DialogOk";

interface IAddUsersPanelProps extends WithTranslation {
  togglePanel: any;
  isOpen: boolean;
  user: CurrentUser;
  save: any;
  freeLicenses: number;
  getAccessToken: Function;
  setError: Function;
  canAddUser: Function;
}

interface IAddUsersPanelState {
  users: User[];
  addLicense: boolean | undefined;
  canAdd: boolean;
}

class AddUsersPanel extends React.Component<IAddUsersPanelProps, IAddUsersPanelState> {
  static contextType = AppContext;
  private _users: User[];

  constructor(props: IAddUsersPanelProps) {
    super(props);

    this._users = [];

    this.state = {
      users: this._users,
      addLicense: true,
      canAdd: true,
    };
  }

  // this does not work: panel is not blocking.
  focusTrapZoneProps: IFocusTrapZoneProps = {
    isClickableOutsideFocusTrap: false,
    forceFocusInsideTrap: true,
  };

  onAddLicenceChange = (checked: boolean | undefined) => {
    this.setState({ addLicense: checked });
  }

  selectUser = (user: User) => {
    //check if the user is already selected
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx === -1) {
      //check with the parent control whether it is allowed to add the user
      const canAdd = this.props.canAddUser(user);
      if (canAdd) {
        this.setState({ users: this.state.users.concat(user) });
      }
      this.setState({ canAdd: canAdd });
    } else {
      //if so, remove the
      this.setState({ users: this.state.users.filter((u) => u.id !== user.id) });
    }
  }

  onItemsDeleted = (personaProps: IExtendedPersonaProps[]) => {
    for (let personaProp of personaProps) {
      const user = this.state.users.filter((user) => user.id === personaProp.key);
      if (user.length === 1) {
        this.setState({ users: this.state.users.filter((u) => u.id !== user[0].id) });
      }
    }
  }

  getPersonaProps = (): any[] => {
    const personaProps: any[] = [];

    for (var user of this.state.users) {
      var personaProp: Partial<IExtendedPersonaProps> = {};
      personaProp.text = user.name;
      personaProp.secondaryText = user.jobTitle;
      personaProp.key = user.id;
      personaProps.push(personaProp);
    }

    return personaProps;
  }

  save = () => {
    this.props.save(this.state.users, this.state.addLicense);
    this.clear();
  }

  close = () => {
    this.clear();
    this.props.togglePanel();
  }

  clear = () => {
    this._users = [];
    this.setState({
      users: this._users,
      addLicense: true,
    });
  }

  onRenderFooterContent = () => {
    return (
      <Stack styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
        <Stack.Item>
          {this.state.addLicense && this.state.users.length > this.props.freeLicenses && (
            <WarningMessage
              message={this.props.t("adminUsers:TabLicensing.Panels.Add.NoFreeLicenses")}
              onDismiss={null}
            ></WarningMessage>
          )}
        </Stack.Item>
        <Stack.Item>
          <Checkbox
            checked={this.state.addLicense}
            label={this.props.t("adminUsers:TabLicensing.Panels.Add.AddLicense")}
            onChange={(ev, checked) => this.onAddLicenceChange(checked)}
          ></Checkbox>
        </Stack.Item>
        <Stack.Item>
          <PrimaryButton
            disabled={
              this.state.users.length === 0 ||
              (this.state.addLicense && this.state.users.length > this.props.freeLicenses)
            }
            onClick={this.save}
          >
            {this.props.t("adminUsers:TabLicensing.Panels.Add.Save")}
          </PrimaryButton>
        </Stack.Item>
      </Stack>
    );
  }

  render() {
    return (
      <Panel
        headerText={this.props.t("adminUsers:TabLicensing.Panels.Add.Title")}
        type={PanelType.smallFixedFar}
        isBlocking={true}
        isHiddenOnDismiss={false}
        isOpen={this.props.isOpen}
        onDismiss={this.close}
        isFooterAtBottom={true}
        layerProps={globalLayerRightSideBarProps}
        onRenderFooterContent={this.onRenderFooterContent}
        focusTrapZoneProps={this.focusTrapZoneProps}
      >
        <Stack styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
          <Stack.Item>
            <Text styles={globalTextStylesPaddingLabelPanel} block variant="mediumPlus">
              {this.props.t("adminUsers:TabLicensing.Panels.Add.Search")}
            </Text>
            <AdUserPicker
              setError={this.props.setError}
              getAccessToken={this.props.getAccessToken}
              selectUser={this.selectUser}
            ></AdUserPicker>
          </Stack.Item>
          <Stack.Item>
            <Text styles={globalTextStylesPaddingLabelPanel} block variant="mediumPlus">
              {this.props.t("adminUsers:TabLicensing.Panels.Add.Selected")}
            </Text>
            <SelectedPeopleList selectedItems={this.getPersonaProps()} onItemsDeleted={this.onItemsDeleted} />
          </Stack.Item>
          <DialogOk
            title={this.props.t("adminUsers:TabLicensing.Dialogs.UserExists.Title")}
            subText={this.props.t("adminUsers:TabLicensing.Dialogs.UserExists.SubText")}
            hidden={this.state.canAdd}
            onOk={() => this.setState({ canAdd: true })}
          ></DialogOk>
        </Stack>
      </Panel>
    );
  }
}

export default withTranslation(['translation', 'adminUsers'])(AddUsersPanel);
