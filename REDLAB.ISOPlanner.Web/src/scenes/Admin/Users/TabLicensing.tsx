import React, { Fragment, useContext } from "react";
import User from "../../../models/user";
import { apiRemoveUsers, apiSetLicense, apiAddUser } from "../../../services/Api/userService";
import { apiRequest } from "../../../services/Auth/authConfig";
import AppContext from "../../../components/App/AppContext";
import { Stack, Text, DefaultButton } from "@fluentui/react";
import { Coachmark, TeachingBubbleContent } from "@fluentui/react";
import { Selection, CommandBar, ICommandBarItemProps, ContextualMenuItemType } from "@fluentui/react";
import UserList from "./UserList";
import { PieChartStd } from "../../../components/Charts/PieChart";
import { DialogYesNo } from "../../../components/Dialogs/DialogYesNo";
import { DialogOk } from "../../../components/Dialogs/DialogOk";
import AddUsersPanel from "./AddUsersPanel";
import { globalStackItemStylesPaddingScene, globalTextStylesPaddingScene } from "../../../globalStyles";
import { navigateToExternalUrl } from "../../../utils/url";
import { globalLicensingURL } from "../../../globalConstants";
import { useTranslation } from "react-i18next";
import { IAdminUsersState } from "./AdminUsers";

interface IAdminUsersTabProps extends IAdminUsersState {}

const TabLicensing: React.FunctionComponent<IAdminUsersTabProps> = (props: IAdminUsersTabProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const onUpdateListItems = (items: User[]) => {
    props.setState({ users: [...items] }); //re-create the array to update the list
  };

  const onUpdateListSelection = (selection: Selection) => {
    props.setState({ userselection: undefined });
    props.setState({ userselection: selection });
  };

  const getUserSelectionCount = (): number => {
    if (!props.userselection) {
      return 0;
    }
    return props.userselection.count;
  };

  const removeUsers = async () => {
    try {
      toggleRemoveDialog();

      if (!props.userselection) {
        return;
      }

      appContext.showContentLoader();

      //create a list of Id's of the selected users
      const selectedUsers: Array<string> = [];
      for (let selectedUser of props.userselection.getSelection()) {
        const user = selectedUser as User;
        if (user.id !== appContext.user.id) {
          selectedUsers.push((selectedUser as User).id);
        } else {
          throw new Error(t("adminUsers:TabLicensing.Errors.CannotRemoveYourself"));
        }
      }

      //remove them from the database
      var accessToken = await appContext.getAccessToken(apiRequest.scopes);
      await apiRemoveUsers(selectedUsers, accessToken);

      //remove them from the state
      const tempStateUsers = [...props.users];

      for (let selectedUser of props.userselection.getSelection()) {
        const user = selectedUser as User;
        if (user.hasLicense) {
          props.dbTenant.usedLicenses -= 1;
        }
        props.dbTenant.numberOfUsers -= 1;

        const idx1 = props.dbUsers.indexOf(user);
        if (idx1 > -1) {
          props.dbUsers.splice(idx1, 1);
        }

        const idx2 = tempStateUsers.indexOf(user);
        if (idx2 > -1) {
          tempStateUsers.splice(idx2, 1);
        }
      }

      props.setState({ tenant: props.dbTenant });
      props.setState({ users: tempStateUsers });
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
    }
  };

  const toggleAddPanel = () => {
    props.setState({ showAddPanel: !props.showAddPanel });
  };

  const toggleRemoveDialog = () => {
    props.setState({ showRemoveDialog: !props.showRemoveDialog });
  };

  const toggleEnableLicenseInvalidSelectionDialog = () => {
    props.setState({ showEnableLicenseInvalidSelectionDialog: !props.showEnableLicenseInvalidSelectionDialog });
  };

  const toggleDisableLicenseInvalidSelectionDialog = () => {
    props.setState({ showDisableLicenseInvalidSelectionDialog: !props.showDisableLicenseInvalidSelectionDialog });
  };

  const onUpdateLicense = async (user: User, checked: boolean | undefined, index: number | undefined) => {
    if (props.isUpdating || !props.userselection || index === undefined) {
      return;
    }

    const selectedUsers: Array<User> = [user];

    if (checked) {
      await enableLicense(selectedUsers);
    } else {
      await disableLicense(selectedUsers);
    }

    //use index to force row to reflect the new checkbox status
    props.userselection.setIndexSelected(index, true, false);
    props.userselection.setIndexSelected(index, false, false);
  };

  const onEnableLicenseSelection = () => {
    onEnableLicense();
  };

  const onEnableLicense = async () => {
    if (props.isUpdating || !props.userselection || !props.tenant) {
      return;
    }

    const selectedUsers: Array<User> = [];

    for (var selectedUser of props.userselection.getSelection()) {
      const user = selectedUser as User;
      if (user.hasLicense === false) {
        selectedUsers.push(user);
      }
    }

    if (selectedUsers.length === 0) {
      toggleEnableLicenseInvalidSelectionDialog();
      return;
    }

    await enableLicense(selectedUsers);

    props.userselection.setAllSelected(false);
  };

  const enableLicense = async (selectedUsers: Array<User>) => {
    try {
      if (props.isUpdating || !props.userselection || !props.tenant) {
        return;
      }

      if (props.tenant.getFreeLicenses() - selectedUsers.length < 0) {
        props.setState({ showFreeLicenseCoach: true });
        return;
      }

      props.setState({ isUpdating: true });
      appContext.showContentLoader();

      //enable the license in the database
      var selectedUserids: Array<string> = [];
      for (let user of selectedUsers) {
        selectedUserids.push(user.id);
      }

      var accessToken = await appContext.getAccessToken(apiRequest.scopes);
      await apiSetLicense(selectedUserids, true, accessToken);

      //update the license client-side
      for (let user of selectedUsers) {
        user.hasLicense = true;
      }

      props.dbTenant.usedLicenses += selectedUsers.length;
      props.setState({ tenant: props.dbTenant });
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  const onDisableLicenseSelection = () => {
    onDisableLicense();
  };

  const onDisableLicense = async () => {
    if (props.isUpdating || !props.userselection || !props.tenant) {
      return;
    }

    const selectedUsers: Array<User> = [];

    for (var selectedUser of props.userselection.getSelection()) {
      const user = selectedUser as User;
      if (user.hasLicense === true) {
        selectedUsers.push(user);
      }
    }

    if (selectedUsers.length === 0) {
      toggleDisableLicenseInvalidSelectionDialog();
      return;
    }

    await disableLicense(selectedUsers);

    props.userselection.setAllSelected(false);
  };

  const disableLicense = async (selectedUsers: Array<User>) => {
    try {
      if (props.isUpdating || !props.userselection || !props.tenant) {
        return;
      }

      props.setState({ isUpdating: true });
      appContext.showContentLoader();

      //disable the licenses in the database
      var selectedUserids: Array<string> = [];
      for (let user of selectedUsers) {
        if (user.id !== appContext.user.id) {
          //user cannot unlincense his/her self
          selectedUserids.push(user.id);
        } else {
          throw new Error(t("adminUsers:TabLicensing.Errors.CannotUnlicenseYourself"));
        }
      }

      var accessToken = await appContext.getAccessToken(apiRequest.scopes);
      await apiSetLicense(selectedUserids, false, accessToken);

      //update the license client-side
      for (let user of selectedUsers) {
        user.hasLicense = false;
      }

      //this triggers re-render of the items in the list and charts to reflect the new license status
      props.dbTenant.usedLicenses -= selectedUsers.length;
      props.setState({ tenant: props.dbTenant });
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  const getCommandBarItemsLicensing = (): ICommandBarItemProps[] => {
    return [
      {
        key: "add",
        disabled: props.isBusy(),
        text: t("adminUsers:TabLicensing.Commands.Add"),
        iconProps: { iconName: "Add" },
        onClick: toggleAddPanel,
      },
      {
        key: "remove",
        disabled: props.isBusy() || getUserSelectionCount() === 0,
        text: t("adminUsers:TabLicensing.Commands.Remove"),
        iconProps: { iconName: "Delete" },
        onClick: toggleRemoveDialog,
      },
      {
        key: "license",
        text: t("adminUsers:TabLicensing.Commands.License.Main"),
        iconProps: { iconName: "EntitlementRedemption" },
        subMenuProps: {
          items: [
            {
              key: "enableLicense",
              disabled: props.isBusy() || getUserSelectionCount() === 0 || getNewFreeLicenses() < 0,
              text: t("adminUsers:TabLicensing.Commands.License.Enable"),
              iconProps: { iconName: "CheckboxComposite" },
              onClick: onEnableLicenseSelection,
            },
            {
              key: "disableLicense",
              disabled: props.isBusy() || getUserSelectionCount() === 0,
              text: t("adminUsers:TabLicensing.Commands.License.Disable"),
              iconProps: { iconName: "RemoveFilter" },
              onClick: onDisableLicenseSelection,
            },
            {
              key: "div1",
              text: "-",
              itemType: ContextualMenuItemType.Divider,
            },
            {
              key: "getMore",
              text: t("adminUsers:TabLicensing.Commands.License.GetMore"),
              iconProps: { iconName: "AddToShoppingList" },
              onClick: () => navigateToExternalUrl(globalLicensingURL),
            },
          ],
        },
      },
    ];
  };

  const getLicenseTotalPieData = () => {
    var freeLicenses = 0;
    var extraLicensesNeeded = 0;
    var tooMuchLicenses = false;
    var usedLicensed = 0;

    if (props.tenant) {
      usedLicensed = props.tenant.usedLicenses;
      freeLicenses = props.tenant.getFreeLicenses();

      if (freeLicenses < 0) {
        freeLicenses = 0;
        tooMuchLicenses = true;
      }

      extraLicensesNeeded = 0;
      extraLicensesNeeded = props.tenant?.numberOfUsers - props.tenant.totalLicenses;
      if (extraLicensesNeeded < 0) {
        extraLicensesNeeded = 0;
      }
    }

    return [
      {
        name: t("adminUsers:TabLicensing.Licenses.Used"),
        value: usedLicensed,
        color: "#d67b27",
      },
      {
        name: t("adminUsers:TabLicensing.Licenses.Free"),
        value: freeLicenses,
        color: tooMuchLicenses ? "#a30b0b" : "#479146",
      },
      {
        name: t("adminUsers:TabLicensing.Licenses.GetMore"),
        value: extraLicensesNeeded,
        color: "#30b4db",
        link: globalLicensingURL,
      },
    ];
  };

  const getSelectedUsersWithoutLicense = (): number => {
    if (!props.userselection) {
      return 0;
    }

    var selectedUsers = 0;

    for (var selectedUser of props.userselection.getSelection()) {
      if (!(selectedUser as User).hasLicense) {
        selectedUsers += 1;
      }
    }

    return selectedUsers;
  };

  const getNewFreeLicenses = (): number => {
    if (!props.tenant) {
      return 0;
    }

    return props.tenant.getFreeLicenses() - getSelectedUsersWithoutLicense();
  };

  const getLicenseDetailPieData = () => {
    var selectedUsers = 0;
    var newFreeLicenses = 0;
    var tooMuchLicenses = false;

    if (props.tenant) {
      selectedUsers = getSelectedUsersWithoutLicense();

      newFreeLicenses = getNewFreeLicenses();
      if (newFreeLicenses < 0) {
        tooMuchLicenses = true;
      }
    }

    return [
      {
        name: t("adminUsers:TabLicensing.Licenses.FreeNew"),
        value: newFreeLicenses,
        color: tooMuchLicenses ? "#a30b0b" : "#479146",
      },
      {
        name: t("adminUsers:TabLicensing.Licenses.SelectedUsers"),
        value: selectedUsers,
        color: "#c9352a",
      },
    ];
  };

  const canAddUser = (user: User): boolean => {
    return props.dbUsers.findIndex((u) => u.id === user.id) === -1;
  };

  const addUsers = async (newUsers: User[], addLicense: boolean) => {
    try {
      if (!props.tenant) {
        return;
      }

      props.setState({ isUpdating: true });
      appContext.showContentLoader();
      toggleAddPanel();

      //save new users to database
      const promiseArray: Promise<void>[] = [];
      var accessToken = await appContext.getAccessToken(apiRequest.scopes);

      for (let user of newUsers) {
        user.hasLicense = addLicense;
        if (user.hasLicense) {
          props.dbTenant.usedLicenses += 1;
        }
        props.dbTenant.numberOfUsers += 1;

        promiseArray.push(apiAddUser(user, accessToken));
      }

      await Promise.all(promiseArray);

      props.setState({ tenant: props.dbTenant });
      props.dbUsers = newUsers.concat(props.dbUsers);
      props.setState({ users: newUsers.concat(props.users) });
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  return (
    <Fragment>
      <Stack.Item>
        <CommandBar items={getCommandBarItemsLicensing()}></CommandBar>
        <DialogYesNo
          title={t("adminUsers:TabLicensing.Dialogs.Remove.Title")}
          subText={t("adminUsers:TabLicensing.Dialogs.Remove.SubText")}
          onYes={removeUsers}
          onNo={toggleRemoveDialog}
          hidden={!props.showRemoveDialog}
        ></DialogYesNo>
        <DialogOk
          title={t("adminUsers:TabLicensing.Dialogs.EnableLicense.Title")}
          subText={t("adminUsers:TabLicensing.Dialogs.EnableLicense.SubText")}
          onOk={toggleEnableLicenseInvalidSelectionDialog}
          hidden={!props.showEnableLicenseInvalidSelectionDialog}
        ></DialogOk>
        <DialogOk
          title={t("adminUsers:TabLicensing.Dialogs.DisableLicense.Title")}
          subText={t("adminUsers:TabLicensing.Dialogs.DisableLicense.SubText")}
          onOk={toggleDisableLicenseInvalidSelectionDialog}
          hidden={!props.showDisableLicenseInvalidSelectionDialog}
        ></DialogOk>
      </Stack.Item>
      <Stack.Item>
        {!props.isLoading && (
          <Fragment>
            <Text styles={globalTextStylesPaddingScene} block variant="medium">
              {t("adminUsers:TabLicensing.Intro", {
                totalLicenses: props.tenant?.totalLicenses,
                totalUsers: props.tenant?.numberOfUsers,
              })}
            </Text>
            <Stack horizontal>
              <Stack.Item>
                <PieChartStd
                  width={300}
                  height={200}
                  label={props.tenant?.numberOfUsers?.toString()}
                  getData={getLicenseTotalPieData}
                  showTooltip={true}
                ></PieChartStd>
              </Stack.Item>
              <Stack.Item>
                <div className="pieChartStdTargetCoachmark">
                  <PieChartStd
                    width={300}
                    height={200}
                    label={props.tenant?.getFreeLicenses().toString()}
                    getData={getLicenseDetailPieData}
                    showTooltip={true}
                  ></PieChartStd>
                </div>
                {props.showFreeLicenseCoach && (
                  <Coachmark target=".pieChartStdTargetCoachmark">
                    <TeachingBubbleContent
                      headline={t("adminUsers:TabLicensing.Coaches.FreeLicenses.Title")}
                      hasCloseButton
                      onDismiss={() => props.setState({ showFreeLicenseCoach: false })}
                    >
                      <p>{t("adminUsers:TabLicensing.Coaches.FreeLicenses.Text")}</p>
                      <DefaultButton onClick={() => navigateToExternalUrl(globalLicensingURL)}>
                        {t("adminUsers:TabLicensing.Commands.License.GetMore")}
                      </DefaultButton>
                    </TeachingBubbleContent>
                  </Coachmark>
                )}
              </Stack.Item>
            </Stack>
          </Fragment>
        )}
      </Stack.Item>
      <Stack.Item grow styles={globalStackItemStylesPaddingScene}>
        <UserList
          allitems={props.dbUsers}
          items={props.users}
          updateItems={onUpdateListItems}
          updateSelection={onUpdateListSelection}
          showFilter={true}
          updateLicense={onUpdateLicense}
        />
      </Stack.Item>
      <Stack.Item>
        <AddUsersPanel
          togglePanel={toggleAddPanel}
          user={appContext.user}
          isOpen={props.showAddPanel}
          save={addUsers}
          freeLicenses={props.tenant ? props.tenant.getFreeLicenses() : 0}
          setError={appContext.setError}
          getAccessToken={appContext.getAccessToken}
          canAddUser={canAddUser}
        ></AddUsersPanel>
      </Stack.Item>
    </Fragment>
  );
};

export default TabLicensing;
