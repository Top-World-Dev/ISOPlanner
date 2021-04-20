import React, { useContext } from "react";
import { Text, Image, IImageProps, ImageFit } from "@fluentui/react";
import { Stack, IStackStyles } from "@fluentui/react";
import CurrentUser from "../../models/currentuser";
import AppContext from "../../components/App/AppContext";
import { darkTheme, lightTheme } from "../../globalThemes";
import Config from "../../services/Config/configService";
import ScenePivot, { IPivotItemProps } from "../../components/SceneBar/ScenePivot";
import {
  globalTextStylesPaddingSmall,
  globalTextStylesBoldPaddingSmall,
  globalStackItemStylesPaddingScene,
  globalStackTokensGapSmall,
} from "../../globalStyles";

interface ISceneBarProps {
  user: CurrentUser;
  title: string;
  subtitle: string;
  image: string;
  baseURL: string;
  pivotItems: IPivotItemProps[] | undefined;
  selectedPivotKey: string | undefined;
}

const SceneBar: React.FunctionComponent<ISceneBarProps> = (props: ISceneBarProps) => {
  const appContext = useContext(AppContext);

  const getStackStyles = () => {
    const stackStyles: IStackStyles = {
      root: {
        background: appContext.useDarkMode ? darkTheme.palette?.neutralLight : lightTheme.palette?.themeLighterAlt,
        height: 64,
      },
    };
    return stackStyles;
  };

  const imagePropsSceneTitle: IImageProps = {
    src: `${Config.getImageURL()}/${props.image}`,
    imageFit: ImageFit.centerContain,
    width: 48,
    height: 48,
  };

  return (
    <Stack horizontal verticalAlign="center" styles={getStackStyles()}>
      <Stack.Item>
        <Stack
          horizontal
          verticalAlign="center"
          styles={globalStackItemStylesPaddingScene}
          tokens={globalStackTokensGapSmall}
        >
          <Stack.Item>
            <Image {...imagePropsSceneTitle}></Image>
          </Stack.Item>
          <Stack.Item>
            <Text styles={globalTextStylesBoldPaddingSmall} block variant="large">
              {props.title}
            </Text>
            <Text styles={globalTextStylesPaddingSmall} block variant="small">
              {props.subtitle}
            </Text>
          </Stack.Item>
        </Stack>
      </Stack.Item>
      {props.pivotItems && props.selectedPivotKey &&
      <Stack.Item grow>
        <ScenePivot baseURL={props.baseURL} items={props.pivotItems} selectedKey={props.selectedPivotKey}/>
      </Stack.Item>}
    </Stack>
  );
};

export default SceneBar;
