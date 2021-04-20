import React from "react";
import { useTranslation } from "react-i18next";
import { Text, Image, IImageProps, ImageFit } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import Config from "../../services/Config/configService";
import { globalStackStylesNoHeightPaddingSmall, globalStackTokensGapLarge } from "../../globalStyles";

interface INotAuthorizedProps {

}

interface INotAuthorizedState {
  
}


const NotAuthorizedContent: React.FunctionComponent<INotAuthorizedProps> = (props: INotAuthorizedProps) => {
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
      <Text variant="xLarge">{t("NotAuthorized.Main")}</Text>
    </Stack>
  );
};

export default class NotAuthorized extends React.Component<INotAuthorizedProps, INotAuthorizedState> {
  render() {
    return <NotAuthorizedContent {...this.props} />;
  }
}