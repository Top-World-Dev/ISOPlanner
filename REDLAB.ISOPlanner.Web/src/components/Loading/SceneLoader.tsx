import React from "react";
import { Spinner, SpinnerSize } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import { globalStackStylesNoHeightPaddingSmall, globalStackTokensGapLarge } from "../../globalStyles";

interface ISceneLoaderProps {

}

const SceneLoader: React.FunctionComponent<ISceneLoaderProps> = (props: ISceneLoaderProps) => {

  return (
    <Stack verticalFill
      horizontalAlign="center"
      verticalAlign="center"
      styles={globalStackStylesNoHeightPaddingSmall}
      tokens={globalStackTokensGapLarge}
    >
      <Spinner size={SpinnerSize.large} />
    </Stack>
  );
};

export default SceneLoader;