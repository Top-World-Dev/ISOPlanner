import React, { Fragment, useContext } from "react";
import { Panel, IconButton, Toggle, Link, Text } from "@fluentui/react";
import { ComboBox, IComboBox, IComboBoxOption } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import AppContext from "../../components/App/AppContext";
import { navBarItemStyles, settingsIcon } from "./NavBarStyles";
import { useTranslation } from "react-i18next";
import { MsConsentButton } from "../../components/Buttons/MsButtons";
import { navigateToExternalUrl } from "../../utils/url";
import { globalLayerRightSideBarProps } from "../../globalStyles";
import {
  globalStackTokensGapLarge,
  globalTextStylesPaddingLabelPanel,
  globalStackStylesPanel,
} from "../../globalStyles";
import UserLanguage from "../../models/userLanguage";
import { apiUpdateUser } from "../../services/Api/userService";
import { apiRequest } from "../../services/Auth/authConfig";
import { i18nBase } from "../../services/Localization/i18n";

interface ISettingsNavItemProps {
  togglePanel: any;
  adminConsent: any;
  isOpen: boolean;
}

const SettingsNavItem: React.FunctionComponent<ISettingsNavItemProps> = (props: ISettingsNavItemProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  function onRenderFooterContent(): JSX.Element {
    return (
      <Stack horizontal horizontalAlign="center" styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
        <Stack.Item>
          {appContext.isAuthenticated && <MsConsentButton onClick={props.adminConsent}></MsConsentButton>}
        </Stack.Item>
      </Stack>
    );
  }

  const getLanguageComboOptions = (): IComboBoxOption[] => {
    var languageComboItems: IComboBoxOption[] = [];

    const comboOption: IComboBoxOption = {
      key: "cancel",
      text: t("Settings.OverrideLanguage-Cancel"),
    };
    languageComboItems.push(comboOption);

    var lngs = UserLanguage.getSupportedLanguages();
    for (let lng of lngs) {
      const comboOption: IComboBoxOption = {
        key: lng[0],
        text: lng[1],
      };
      languageComboItems.push(comboOption);
    }

    return languageComboItems;
  };

  const setUserLanguage = async (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption | undefined,
    index?: number | undefined,
    value?: string | undefined
  ): Promise<void | undefined> => {
    if (option) {
      try {
        appContext.showContentLoader();

        if (option?.key === "cancel") {
          // restore the language code of the Microsoft account of the user
          appContext.user.login.userLanguageCode = "";
          appContext.user.language = new UserLanguage(appContext.user.accountLanguageCode);
        } else {
          // set the selected language 
          appContext.user.login.userLanguageCode = option?.key as string;
          appContext.user.language = new UserLanguage(appContext.user.login.userLanguageCode);
        }

        var accessToken = await appContext.getAccessToken(apiRequest.scopes);
        await apiUpdateUser(appContext.user, accessToken);

        await i18nBase.changeLanguage(appContext.user.language.codeWithCulture);

      } catch (err) {
        appContext.setError(err);
      } finally {
        appContext.hideContentLoader();
      }
    }
  };

  return (
    <AppContext.Consumer>
      {(context) => (
        <Fragment>
          <Stack.Item>
            <IconButton styles={navBarItemStyles} iconProps={settingsIcon} onClick={props.togglePanel}></IconButton>
          </Stack.Item>

          <Panel
            headerText={t("Settings.Title")}
            isBlocking={false}
            isOpen={props.isOpen}
            onDismiss={props.togglePanel}
            isFooterAtBottom={true}
            layerProps={globalLayerRightSideBarProps}
            onRenderFooterContent={onRenderFooterContent}
          >
            <Stack styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
              <Stack.Item>
                <Text styles={globalTextStylesPaddingLabelPanel} block variant="mediumPlus">
                  {t("Settings.Theme-Switch")}
                </Text>
                <Toggle
                  checked={context.useDarkMode}
                  onText={t("General.Toggle.On")}
                  offText={t("General.Toggle.Off")}
                  onChange={() => context.setUseDarkMode(!context.useDarkMode)}
                />
              </Stack.Item>
              <Stack.Item>
                <Text styles={globalTextStylesPaddingLabelPanel} block variant="mediumPlus">
                  {t("Settings.ChangeLanguage-Label")}
                </Text>
                <Link onClick={() => navigateToExternalUrl(appContext.user.getMyAccountLanguageURL(), true)}>
                  {t("Settings.ChangeLanguage-Link")}
                </Link>
              </Stack.Item>
              <Stack.Item>
                <Text styles={globalTextStylesPaddingLabelPanel} block variant="mediumPlus">
                  {t("Settings.OverrideLanguage-Text")}
                </Text>
                <ComboBox
                  allowFreeform={false}
                  autoComplete="on"
                  options={getLanguageComboOptions()}
                  onChange={setUserLanguage}
                  defaultSelectedKey={appContext.user.login.userLanguageCode}
                />
              </Stack.Item>
            </Stack>
          </Panel>
        </Fragment>
      )}
    </AppContext.Consumer>
  );
};

export default SettingsNavItem;
