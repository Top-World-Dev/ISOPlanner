import React, { Fragment } from "react";
import { Panel, IconButton, Link, Separator, Text } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import { navBarItemStyles, helpIcon } from "./NavBarStyles";
import { useTranslation } from "react-i18next";
import Config from "../../services/Config/configService";
import { globalStackTokensGapLarge, globalStackStylesPanel, globalLayerRightSideBarProps } from "../../globalStyles";
import { globalWebsiteURL } from "../../globalConstants";

interface IHelpNavItemProps {
  togglePanel: any;
  isOpen: boolean;
}

const HelpNavItem: React.FunctionComponent<IHelpNavItemProps> = (props: IHelpNavItemProps) => {
  const { t } = useTranslation();

  function onRenderFooterContent(): JSX.Element {
    return (
      <Stack horizontal horizontalAlign="center" styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
        <Link href={`${globalWebsiteURL}/privacystatement`}>{t("Help.PrivacyLink")}</Link>
        <Separator vertical></Separator>
        <Link href={`${globalWebsiteURL}/terms-of-service`}>{t("Help.TermsOfServiceLink")}</Link>
      </Stack>
    );
  }

  return (
    <Fragment>
      <Stack.Item>
        <IconButton styles={navBarItemStyles} iconProps={helpIcon} onClick={props.togglePanel}></IconButton>
      </Stack.Item>
      <Panel
        headerText={t("Help.Title")}
        isBlocking={false}
        isOpen={props.isOpen}
        layerProps={globalLayerRightSideBarProps}
        onDismiss={props.togglePanel}
        isFooterAtBottom={true}
        onRenderFooterContent={onRenderFooterContent}
      >
        <Stack styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
          <Stack.Item>
            <Text block variant="medium">
              {t("App.Title") + " " + Config.getVersion()}
            </Text>
            {!Config.isProd() && (
              <Text block variant="small">
                {Config.getAppEnv()}
              </Text>
            )}
            {!Config.isProd() && <Text variant="small">{Config.getAppURL()}</Text>}
          </Stack.Item>
        </Stack>
      </Panel>
    </Fragment>
  );
};

export default HelpNavItem;
