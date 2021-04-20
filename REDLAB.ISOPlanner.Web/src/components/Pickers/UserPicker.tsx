// not finished
// - render picker item
// - remove item

import React, { Fragment } from "react";
import {
  IBasePickerProps,
  IBasePickerSuggestionsProps,
  IPickerItemProps,
  BasePicker,
  ISuggestionItemProps,
  Persona,
  PersonaSize,
  IPersonaStyles,
  IconButton,
  IIconProps,
} from "@fluentui/react";
import User from "../../models/user";
import { globalSuggestionsMaxRecords } from "../../globalConstants";
import { useTranslation } from "react-i18next";

export interface IUserPickerProps {
  allUsers: User[];
  selectedUsers: User[];
  onChange: any;
}

class BaseUserPicker extends BasePicker<User, IBasePickerProps<User>> {}

export const UserPicker: React.FunctionComponent<IUserPickerProps> = (props: IUserPickerProps) => {
  const { t } = useTranslation();

  const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: t("General.Suggestions.Header"),
    noResultsFoundText: t("General.Suggestions.NoData"),
    showRemoveButtons: false,
    resultsMaximumNumber: globalSuggestionsMaxRecords,
  };

  function getNameFromUser(item: User): string {
    return item.name;
  }

  const onUserSuggestion = (
    filterText: string,
    currentPersonas: User[] | undefined,
    limitResults?: number
  ): User[] | Promise<User[]> => {
    if (filterText) {
      let filteredPersonas: User[] = filterAllUsersByText(filterText);
      filteredPersonas = removeDuplicatesRoles(filteredPersonas, currentPersonas);
      filteredPersonas = limitResults ? filteredPersonas.slice(0, limitResults) : filteredPersonas;
      return filteredPersonas;
    } else {
      return [];
    }
  };

  const filterAllUsersByText = (filterText: string): User[] => {
    return props.allUsers.filter(
      (item) => item.hasLicense && item.name.toLowerCase().indexOf(filterText.toLowerCase()) >= 0
    );
  };

  function removeDuplicatesRoles(users: User[], possibleDupes: User[] | undefined) {
    return users.filter((user) => !listContainsPersona(user, possibleDupes));
  }

  function listContainsPersona(user: User, users: User[] | undefined) {
    if (!users || !users.length || users.length === 0) {
      return false;
    }
    return users.filter((item) => item.name === user.name).length > 0;
  }

  const personaStyles: Partial<IPersonaStyles> = {
    root: {
      margin: "3px 3px 3px 3px",
      background: "gray",
    },
  };

  const onRenderSuggestedUser: (user: User, itemProps: ISuggestionItemProps<User>) => JSX.Element = (
    user: User,
    itemProps: ISuggestionItemProps<User>
  ) => {
    return (
      <Persona
        imageUrl={user.getAvatarURL()}
        text={user.name}
        secondaryText={user.email}
        size={PersonaSize.size40}
        styles={personaStyles}
      />
    );
  };

  const cancelIcon: IIconProps = { iconName: "Cancel" };

  const onRemoveUser = () => {};

  const onRenderUser: (itemProps: IPickerItemProps<User>) => JSX.Element = (itemProps: IPickerItemProps<User>) => {
    const user: User = itemProps.item;

    return (
      <Fragment>
        <Persona
          imageUrl={user.getAvatarURL()}
          text={user.name}
          secondaryText={user.email}
          size={PersonaSize.size40}
          styles={personaStyles}
        />
        <IconButton iconProps={cancelIcon} onClick={onRemoveUser}></IconButton>
      </Fragment>
    );
  };

  return (
    <BaseUserPicker
      onRenderSuggestionsItem={onRenderSuggestedUser}
      onRenderItem={onRenderUser}
      onResolveSuggestions={onUserSuggestion}
      getTextFromItem={getNameFromUser}
      pickerSuggestionsProps={suggestionProps}
      selectedItems={props.selectedUsers}
      onChange={props.onChange}
    ></BaseUserPicker>
  );
};
