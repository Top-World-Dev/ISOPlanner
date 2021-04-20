import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import AppContext from "../../../components/App/AppContext";
import { IAdminUsersState } from "./AdminUsers";
import { Stack, Text, Toggle } from "@fluentui/react";
import { apiSetSetting } from "../../../services/Api/settingService";
import { apiRequest } from "../../../services/Auth/authConfig";
import { AutoUserLicense, AutoCleanLicense } from "../../../models/setting";
import { globalStackItemStylesPaddingScene } from "../../../globalStyles";

interface IAdminUsersTabProps extends IAdminUsersState {}

const TabSettings: React.FunctionComponent<IAdminUsersTabProps> = (props: IAdminUsersTabProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const onChangeToggleSettingAutoUserLicence = async () => {
    try {
      props.setState({ isUpdating: true });
      appContext.showContentLoader();

      props.setState({ toggleAutoUserLicense: !props.toggleAutoUserLicense });

      var accessToken = await appContext.getAccessToken(apiRequest.scopes);
      await apiSetSetting(AutoUserLicense, !props.toggleAutoUserLicense, accessToken);
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  const onChangeToggleSettingAutoCleanLicence = async () => {
    try {
      props.setState({ isUpdating: true });
      appContext.showContentLoader();
      props.setState({ toggleAutoCleanLicense: !props.toggleAutoCleanLicense });

      var accessToken = await appContext.getAccessToken(apiRequest.scopes);
      await apiSetSetting(AutoCleanLicense, !props.toggleAutoCleanLicense, accessToken);
    } catch (err) {
      appContext.setError(err);
    } finally {
      appContext.hideContentLoader();
      props.setState({ isUpdating: false });
    }
  };

  return (
    <Fragment>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="medium">
          {t("adminUsers:TabSettings.AutoUserLicence.Text")}
        </Text>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Toggle
          label={t("adminUsers:TabSettings.AutoUserLicence.Label")}
          onText={t("General.Toggle.On")}
          offText={t("General.Toggle.Off")}
          disabled={props.isBusy()}
          checked={props.toggleAutoUserLicense}
          onChange={onChangeToggleSettingAutoUserLicence}
        ></Toggle>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Text block variant="medium">
          {t("adminUsers:TabSettings.AutoCleanLicence.Text")}
        </Text>
      </Stack.Item>
      <Stack.Item styles={globalStackItemStylesPaddingScene}>
        <Toggle
          label={t("adminUsers:TabSettings.AutoCleanLicence.Label")}
          onText={t("General.Toggle.On")}
          offText={t("General.Toggle.Off")}
          disabled={props.isBusy() || !props.toggleAutoUserLicense}
          checked={props.toggleAutoCleanLicense}
          onChange={onChangeToggleSettingAutoCleanLicence}
        ></Toggle>
      </Stack.Item>
    </Fragment>
  );
};

export default TabSettings;
