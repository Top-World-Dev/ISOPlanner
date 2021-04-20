import { IIconProps } from "@fluentui/react";
import { mergeStyleSets } from "@fluentui/react";
import { IStackItemStyles } from "@fluentui/react";

export const o365Icon: IIconProps = { iconName: "WaffleOffice365" };
export const helpIcon: IIconProps = { iconName: "Help" };
export const settingsIcon: IIconProps = { iconName: "Settings" };

export const navBarItemStyles: IStackItemStyles = mergeStyleSets({
  root: {
    height: 48,
    width: 48,
    justifyContent: "center",
  },
});
