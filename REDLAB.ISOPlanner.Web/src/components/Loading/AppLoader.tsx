import * as React from "react";
import { Modal, Image, IImageProps, ImageFit, Spinner, SpinnerSize, IStackStyles, Stack } from "@fluentui/react";
import AppContext from "../../components/App/AppContext";
import Config from "../../services/Config/configService";
import { globalStackTokensGapMedium } from "../../globalStyles";

interface IAppLoaderProps {
  isLoading?: boolean;
}

const stackStyles: IStackStyles = {
  root: {
    padding: 20,
    height: 200,
  },
};

const imageProps: IImageProps = {
  src: `${Config.getImageURL()}/logo.png`,
  imageFit: ImageFit.contain,
  width: 120,
  height: 80,
};

const AppLoader: React.FunctionComponent<IAppLoaderProps> = (props: IAppLoaderProps) => {
  return (
    <AppContext.Consumer>
      {(context) => (
        <Modal isOpen={context.isAppLoading || props.isLoading}>
          <Stack
            verticalAlign="center"
            horizontalAlign="center"
            styles={stackStyles}
            tokens={globalStackTokensGapMedium}
          >
            <Image {...imageProps} />
            <Spinner size={SpinnerSize.large} />
          </Stack>
        </Modal>
      )}
    </AppContext.Consumer>
  );
};

export default AppLoader;
