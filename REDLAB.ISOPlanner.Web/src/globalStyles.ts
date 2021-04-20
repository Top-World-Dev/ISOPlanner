import { IStackStyles, IStackTokens, IStackItemStyles, ITextStyles, ILayerProps, IIconProps } from "@fluentui/react";

// App global
export const globalFontBoldWeight: string = "600";
const layerHostId = "layerHostRightSideBar";
export const globalLayerRightSideBarProps: ILayerProps = { hostId: layerHostId };

// Scene global
export const globalPaddingScene: number = 20;

// Stacks styles
export const globalStackStylesHeight100: IStackStyles = {
  root: {
    height: "100%",
  },
};

export const globalStackStylesHeight100PaddingSmall: IStackStyles = {
  root: {
    height: "100%",
    padding: 10,
  },
};

export const globalStackStylesHeight100PaddingMedium: IStackStyles = {
  root: {
    height: "100%",
    padding: 20,
  },
};

export const globalStackStylesNoHeightPaddingSmall: IStackStyles = {
  root: {
    padding: 10,
  },
};

export const globalStackStylesPanel: IStackStyles = {
  root: {
    paddingTop: 30,
    paddingBottom: 10,
  },
};

// Stacks item styles
export const globalStackItemStylesPaddingScene: IStackItemStyles = {
  root: {
    paddingLeft: globalPaddingScene,
    paddingRight: globalPaddingScene,
  },
};

// Stack tokens
export const globalStackTokensGapSmall: IStackTokens = {
  childrenGap: 10,
};

export const globalStackTokensGapMedium: IStackTokens = {
  childrenGap: 20,
};

export const globalStackTokensGapLarge: IStackTokens = {
  childrenGap: 30,
};

// Text styles
export const globalTextStylesBold: ITextStyles = {
  root: {
    fontWeight: globalFontBoldWeight,
  },
};

export const globalTextStylesPaddingScene: ITextStyles = {
  root: {
    paddingLeft: globalPaddingScene,
    paddingRight: globalPaddingScene,
  },
};

export const globalTextStylesBoldPaddingSmall: ITextStyles = {
  root: {
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: globalFontBoldWeight,
  },
};

export const globalTextStylesPaddingSmall: ITextStyles = {
  root: {
    paddingLeft: 10,
    paddingRight: 10,
  },
};

export const globalTextStylesPaddingLabelPanel: ITextStyles = {
  root: {
    paddingBottom: 6,
  },
}

//
// Icons
//

export const editIcon: IIconProps = { iconName: "Edit" };