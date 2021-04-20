import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../../../components/App/AppContext";
import { IAdminUsersState } from "./AdminUsers";
import { Stack, Text, CommandBar } from "@fluentui/react";
import { IBasePickerSuggestionsProps, IPersonaProps, ICommandBarItemProps, NormalPeoplePicker } from "@fluentui/react";
import { apiRequest } from "../../../services/Auth/authConfig";
import { apiSetUserRole } from "../../../services/Api/userService";
import { globalStackItemStylesPaddingScene } from "../../../globalStyles";
import { globalSuggestionsMaxRecords, globalFilterDelay } from "../../../globalConstants";
import { appRoles } from "../../../services/Auth/appRoles";
import User from "../../../models/user";
import { areDifferent } from "../../../utils/array";

interface IAdminUsersTabProps extends IAdminUsersState {}

const TabRoles: React.FunctionComponent<IAdminUsersTabProps> = (props: IAdminUsersTabProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: t("General.Suggestions.Header"),
    noResultsFoundText: t("General.Suggestions.NoData"),
    showRemoveButtons: false,
    resultsMaximumNumber: globalSuggestionsMaxRecords,
  };

  const onManagerRolesChange = (personas: IPersonaProps[] | undefined): void => {
    let users: User[] = getUsersFromPersonas(personas);
    props.setState({ managerUsers: users });
  };

  const onAdminRolesChange = (personas: IPersonaProps[] | undefined): void => {
    let users: User[] = getUsersFromPersonas(personas);
    //cannot remove the last admin or yourself
    if (users.length > 0 && users.find((u) => u.id === appContext.user.id) !== undefined) {
      props.setState({ adminUsers: users });
    }
  };

  const getAdminRolePersonas = (): IPersonaProps[] => {
    return getPersonasFromUsers(props.adminUsers);
  };

  const getManagerRolePersonas = (): IPersonaProps[] => {
    return getPersonasFromUsers(props.managerUsers);
  };

  const getPersonasFromUsers = (users: User[]): IPersonaProps[] => {
    const personaProps: IPersonaProps[] = [];

    for (var user of users) {
      var personaProp: IPersonaProps = {};
      personaProp.text = user.name;
      personaProp.secondaryText = user.jobTitle;
      personaProp.key = user.id;
      personaProps.push(personaProp);
    }

    return personaProps;
  };

  const getUsersFromPersonas = (personas: IPersonaProps[] | undefined): User[] => {
    const users: User[] = [];
    if (!personas) {
      return users;
    }

    for (let persona of personas) {
      var user: User | undefined = props.dbUsers.find((u) => u.id === persona.key);
      if (user) {
        users.push(user);
      }
    }

    return users;
  };

  const getNameFromUser = (persona: IPersonaProps): string => {
    return persona.text as string;
  };

  const onRoleSuggestion = (
    filterText: string,
    currentPersonas: IPersonaProps[] | undefined,
    limitResults?: number
  ): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText) {
      let filteredPersonas: IPersonaProps[] = getPersonasFromUsers(filterAllUsersByText(filterText));
      filteredPersonas = removeDuplicatesRoles(filteredPersonas, currentPersonas);
      filteredPersonas = limitResults ? filteredPersonas.slice(0, limitResults) : filteredPersonas;
      return filteredPersonas;
    } else {
      return [];
    }
  };

  const filterAllUsersByText = (filterText: string): User[] => {
    return props.users.filter(
      (item) => item.hasLicense && item.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0
    );
  };

  const removeDuplicatesRoles = (personas: IPersonaProps[], possibleDupes: IPersonaProps[] | undefined) => {
    return personas.filter((persona) => !listContainsPersona(persona, possibleDupes));
  };

  const listContainsPersona = (persona: IPersonaProps, personas: IPersonaProps[] | undefined) => {
    if (!personas || !personas.length || personas.length === 0) {
      return false;
    }
    return personas.filter((item) => item.text === persona.text).length > 0;
  };

  const getCommandBarItemsRoles = (): ICommandBarItemProps[] => {
    return [
      {
        key: "save",
        disabled: props.isBusy() || !getRoleStateChanged(),
        text: t("adminUsers:TabRoles.Commands.Roles.Save"),
        iconProps: { iconName: "Save" },
        onClick: saveRoleChanges,
      },
      {
        key: "discard",
        disabled: props.isBusy() || !getRoleStateChanged(),
        text: t("adminUsers:TabRoles.Commands.Roles.Discard"),
        iconProps: { iconName: "Cancel" },
        onClick: discardRoleChanges,
      },
    ];
  };

  const getRoleStateChanged = () => {
    if (areDifferent<User>(props.dbAdminUsers, props.adminUsers, (u1, u2) => u1.id === u2.id)) {
      return true;
    }
    if (areDifferent<User>(props.dbManagerUsers, props.managerUsers, (u1, u2) => u1.id === u2.id)) {
      return true;
    }
    return false;
  };

  const saveRoleChanges = async () => {
    try {
      if (props.isUpdating) {
        return;
      }

      props.setState({ isUpdating: true });
      appContext.showContentLoader();
      var accessToken = await appContext.getAccessToken(apiRequest.scopes);

      //admin users
      for (let user of props.adminUsers) {
        //new admins
        const isNewUser = props.dbAdminUsers.find((u) => u.id === user.id) === undefined;
        if (isNewUser) {
          await apiSetUserRole(user.id, appRoles.Admin, true, accessToken);
        }
      }

      for (let user of props.dbAdminUsers) {
        //removed admins
        const isRemovedUser = props.adminUsers.find((u) => u.id === user.id) === undefined;
        if (isRemovedUser) {
          await apiSetUserRole(user.id, appRoles.Admin, false, accessToken);
        }
      }

      //manager users
      for (let user of props.managerUsers) {
        //new admins
        const isNewUser = props.dbManagerUsers.find((u) => u.id === user.id) === undefined;
        if (isNewUser) {
          await apiSetUserRole(user.id, appRoles.Manager, true, accessToken);
        }
      }

      for (let user of props.dbManagerUsers) {
        //removed admins
        const isRemovedUser = props.managerUsers.find((u) => u.id === user.id) === undefined;
        if (isRemovedUser) {
          await apiSetUserRole(user.id, appRoles.Manager, false, accessToken);
        }
      }

      props.setState({ dbAdminUsers: props.adminUsers, dbManagerUsers: props.managerUsers });
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  const discardRoleChanges = () => {
    props.setState({ adminUsers: props.dbAdminUsers, managerUsers: props.dbManagerUsers });
  };

  return (
    <Fragment>
      <Stack.Item>
        <CommandBar items={getCommandBarItemsRoles()}></CommandBar>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="medium">
          {t("adminUsers:TabRoles.Intro")}
        </Text>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="large">
          {t("adminUsers:TabRoles.Admins.Title")}
        </Text>
        <Text block variant="medium">
          {t("adminUsers:TabRoles.Admins.Text")}
        </Text>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <NormalPeoplePicker
          onResolveSuggestions={onRoleSuggestion}
          getTextFromItem={getNameFromUser}
          pickerSuggestionsProps={suggestionProps}
          selectedItems={getAdminRolePersonas()}
          onChange={onAdminRolesChange}
          resolveDelay={globalFilterDelay}
        ></NormalPeoplePicker>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="large">
          {t("adminUsers:TabRoles.Managers.Title")}
        </Text>
        <Text block variant="medium">
          {t("adminUsers:TabRoles.Managers.Text")}
        </Text>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <NormalPeoplePicker
          onResolveSuggestions={onRoleSuggestion}
          getTextFromItem={getNameFromUser}
          pickerSuggestionsProps={suggestionProps}
          selectedItems={getManagerRolePersonas()}
          onChange={onManagerRolesChange}
          resolveDelay={globalFilterDelay}
        ></NormalPeoplePicker>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="large">
          {t("adminUsers:TabRoles.Users.Title")}
        </Text>
        <Text block variant="medium">
          {t("adminUsers:TabRoles.Users.Text")}
        </Text>
      </Stack.Item>
    </Fragment>
  );
};

export default TabRoles;
