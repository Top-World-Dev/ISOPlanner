import React from "react";
import { useTranslation } from "react-i18next";
import { Text, Image, IImageProps, ImageFit } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import Config from "../../services/Config/configService";
import { globalStackStylesNoHeightPaddingSmall, globalStackTokensGapLarge } from "../../globalStyles";

interface INotFoundProps {

}

interface INotFoundState {
  
}


const NotFoundContent: React.FunctionComponent<INotFoundProps> = (props: INotFoundProps) => {
  const imageProps: IImageProps = {
    src: `${Config.getImageURL()}/logo.png`,
    imageFit: ImageFit.contain,
    width: 400,
    height: 300,
  };

  const { t } = useTranslation();

  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      styles={globalStackStylesNoHeightPaddingSmall}
      tokens={globalStackTokensGapLarge}
    >
      <Image {...imageProps} />
      <Text variant="xLarge">{t("NotFound.Main")}</Text>
    </Stack>
  );
};

export default class NotFound extends React.Component<INotFoundProps, INotFoundState> {
  render() {
    return <NotFoundContent {...this.props} />;
  }
}