import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Text, Image, IImageProps, ImageFit } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import AppContext from "../../components/App/AppContext";
import Config from "../../services/Config/configService";
import { MsLoginButton } from "../../components/Buttons/MsButtons";
import { globalStackStylesNoHeightPaddingSmall, globalStackTokensGapLarge } from "../../globalStyles";

interface IWelcomeProps {
  authButton: any;
}

interface IWelcomeState {}

const WelcomeContent: React.FunctionComponent<IWelcomeProps> = (props: IWelcomeProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const imagePropsLogo: IImageProps = {
    src: `${Config.getImageURL()}/logo.png`,
    imageFit: ImageFit.contain,
    width: 400,
    height: 300,
  };

  if (appContext.user.login.tenantId && appContext.user.login.tenantLicensed === false) {
    //user has tried to login but the tenant is not registered
    return (
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        styles={globalStackStylesNoHeightPaddingSmall}
        tokens={globalStackTokensGapLarge}
      >
        <Image {...imagePropsLogo} />
        <Text variant="mega">{t("Welcome.Main")}</Text>
        <Text variant="xLarge">{t("Welcome.Sub")}</Text>
        <Text block variant="xLarge">
          {t("Welcome.TenantNotRegistered", { tenant: appContext.user.tenant.name })}
        </Text>
        <MsLoginButton onClick={props.authButton}></MsLoginButton>
      </Stack>
    );
  }

  if (appContext.user.login.userId && appContext.user.login.userLicensed === false) {
    //user has tried to login but the he/she has no license
    return (
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        styles={globalStackStylesNoHeightPaddingSmall}
        tokens={globalStackTokensGapLarge}
      >
        <Image {...imagePropsLogo} />
        <Text variant="mega">{t("Welcome.Main")}</Text>
        <Text variant="xLarge">{t("Welcome.Sub")}</Text>
        <Text variant="xLarge">{t("Welcome.UserHasNoLicense1", { email: appContext.user.email })}</Text>
        <Text variant="xLarge">{t("Welcome.UserHasNoLicense2", { tenant: appContext.user.tenant.name })}</Text>
        <MsLoginButton onClick={props.authButton}></MsLoginButton>
      </Stack>
    );
  }

  // Not signed in yet
  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      styles={globalStackStylesNoHeightPaddingSmall}
      tokens={globalStackTokensGapLarge}
    >
      <Image {...imagePropsLogo} />
      <Text variant="mega">{t("Welcome.Main")}</Text>
      <Text variant="xLarge">{t("Welcome.Sub")}</Text>
      <MsLoginButton onClick={props.authButton}></MsLoginButton>
    </Stack>
  );
}

export default class Welcome extends React.Component<IWelcomeProps, IWelcomeState> {
  render() {
    return <WelcomeContent {...this.props} />;
  }
}
