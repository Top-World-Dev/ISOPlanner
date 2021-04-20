import React from "react";
import { useTranslation } from "react-i18next";
import {
  DefaultButton,
  Image,
  IImageProps,
  ImageFit,
  IButtonStyles,
} from "@fluentui/react";
import Config from "../../services/Config/configService";
import { globalFontBoldWeight } from "../../globalStyles";

interface IMsButtonProps {
  onClick: any;
}

//https://docs.microsoft.com/nl-nl/azure/active-directory/develop/howto-add-branding-in-azure-ad-apps

const imagePropsMsLogo: IImageProps = {
  src: `${Config.getImageURL()}/ms-symbollockup_mssymbol_19.png`,
  imageFit: ImageFit.none,
  width: 33, //21 + 12 => center image left (imagefit.none) and give 12px padding between image and text
  height: 21,
};

const buttonStylesMs: IButtonStyles = {
  root: {
    height: "41px",
    fontSize: "15px",
    fontWeight: globalFontBoldWeight,
    padding: 12,
  },
};

export function MsLoginButton(props: IMsButtonProps) {
  const { t } = useTranslation();

  return (
    <DefaultButton onClick={props.onClick} styles={buttonStylesMs}>
      <Image {...imagePropsMsLogo} />
      {t("Welcome.Login")}
    </DefaultButton>
  );
}

export function MsConsentButton(props: IMsButtonProps) {
  const { t } = useTranslation();

  return (
    <DefaultButton primary onClick={props.onClick} styles={buttonStylesMs}>
      <Image {...imagePropsMsLogo} />
      {t("Settings.Button-Consent-Secondary")}
    </DefaultButton>
  );
}
