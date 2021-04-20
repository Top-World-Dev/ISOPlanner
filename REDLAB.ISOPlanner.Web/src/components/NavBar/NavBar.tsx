import React from "react";
import { IconButton, Text, ITextStyles } from "@fluentui/react";
import { Stack, IStackTokens, IStackStyles } from "@fluentui/react";
import { navigateToExternalUrl } from "../../utils/url";
import AppContext from "../../components/App/AppContext";
import AuthNavItem from "./AuthNavItem";
import SettingsNavItem from "./SettingsNavItem";
import HelpNavItem from "./HelpNavItem";
import { o365Icon, navBarItemStyles } from "./NavBarStyles";
import { darkTheme, lightTheme } from "../../globalThemes";
import { withTranslation, WithTranslation } from "react-i18next";
import { globalFontBoldWeight } from "../../globalStyles";

interface INavBarProps extends WithTranslation {
  authButton: Function;
  adminConsent: Function;
}

interface INavBarState {
  isOpenAuthDialog: boolean;
  isOpenSettingsPanel: boolean;
  isOpenHelpPanel: boolean;
}

const GetStackStyles = (useDarkMode : boolean) => {
  const stackStyles: IStackStyles = {
    root: {
      background: useDarkMode ? darkTheme.palette?.neutralLight : lightTheme.palette?.themeLight,
      height: 48,
    },
  };
  return stackStyles;
}

class NavBar extends React.Component<INavBarProps, INavBarState> {
  static contextType = AppContext;

  constructor(props: INavBarProps) {
    super(props);

    this.toggleAuthDialog = this.toggleAuthDialog.bind(this);
    this.toggleSettingsPanel = this.toggleSettingsPanel.bind(this);
    this.toggleHelpPanel = this.toggleHelpPanel.bind(this);

    this.state = {
      isOpenAuthDialog: false,
      isOpenSettingsPanel: false,
      isOpenHelpPanel: false,
    };
  }

  stackTokens: IStackTokens = {
    childrenGap: 10,
  };

  toggleAuthDialog() {
    this.setState({
      isOpenAuthDialog: !this.state.isOpenAuthDialog,
    });
  }

  toggleSettingsPanel() {
    this.setState({
      isOpenSettingsPanel: !this.state.isOpenSettingsPanel,
      isOpenHelpPanel: !this.state.isOpenSettingsPanel ? false : this.state.isOpenHelpPanel,
      isOpenAuthDialog: false
    });
  }

  toggleHelpPanel() {
    this.setState({
      isOpenHelpPanel: !this.state.isOpenHelpPanel,
      isOpenSettingsPanel: !this.state.isOpenHelpPanel ? false : this.state.isOpenSettingsPanel,
      isOpenAuthDialog: false
    });
  }

  appTitleTextStyles: ITextStyles = {
    root: {
      fontWeight: globalFontBoldWeight,
    },
  };

  render() {
    return (
      <Stack horizontal styles={GetStackStyles(this.context.useDarkMode)}>
        <Stack.Item grow>
          <Stack horizontal verticalAlign="center" tokens={this.stackTokens}>
            <Stack.Item>
              <IconButton
                styles={navBarItemStyles}
                iconProps={o365Icon}
                onClick={() =>
                  navigateToExternalUrl("https://office.com", true)
                }
              ></IconButton>
            </Stack.Item>
            <Stack.Item>
              <Text styles={this.appTitleTextStyles} variant="large">{this.props.t("App.Title")}</Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal verticalAlign="center" tokens={this.stackTokens}>
            {this.context.isAuthenticated && <Stack.Item>
              <SettingsNavItem
                togglePanel={this.toggleSettingsPanel}
                isOpen={this.state.isOpenSettingsPanel}
                adminConsent={this.props.adminConsent}
              ></SettingsNavItem>
            </Stack.Item>}
            <Stack.Item>
              <HelpNavItem
                togglePanel={this.toggleHelpPanel}
                isOpen={this.state.isOpenHelpPanel}
              ></HelpNavItem>
            </Stack.Item>
            <Stack.Item>
              <AuthNavItem
                authButton={this.props.authButton}
                toggleDialog={this.toggleAuthDialog}
                isOpen={this.state.isOpenAuthDialog}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}

export default withTranslation()(NavBar)