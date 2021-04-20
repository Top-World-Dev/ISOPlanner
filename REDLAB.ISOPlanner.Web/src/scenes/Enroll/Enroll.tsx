import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Text, Image, IImageProps, ImageFit } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import AppContext from "../../components/App/AppContext";
import Config from "../../services/Config/configService";
import { globalStackStylesNoHeightPaddingSmall, globalStackTokensGapLarge } from "../../globalStyles";

interface IEnrollProps {}

interface IEnrollState {}

const EnrollContent: React.FunctionComponent<IEnrollProps> = (props: IEnrollProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const imageProps: IImageProps = {
    src: `${Config.getImageURL()}/logo.png`,
    imageFit: ImageFit.contain,
    width: 400,
    height: 300,
  };

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      styles={globalStackStylesNoHeightPaddingSmall}
      tokens={globalStackTokensGapLarge}
    >
      <Image {...imageProps} />
      <Text variant="mega">{t("Enroll.Main")}</Text>
      <Text variant="xLarge">{t("Enroll.Sub", { tenant: appContext.user.tenant.name })}</Text>
      {
        // <Text variant="xLarge">
        //<Link underline href={`https://portal.azure.com/#blade/Microsoft_AAD_IAM/ManagedAppMenuBlade/Users/appId/${Config.get("Api.ClientId")}/objectId/${CustomerAppObjId}`}>
        //  {t('Enroll.AssignRolesLink')}
        //</Link>
        //</Text>
      }
    </Stack>
  );
};

export default class Enroll extends React.Component<IEnrollProps, IEnrollState> {
  render() {
    return <EnrollContent {...this.props} />;
  }
}
