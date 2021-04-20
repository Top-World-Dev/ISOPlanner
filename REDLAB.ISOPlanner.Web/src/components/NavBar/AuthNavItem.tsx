import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Callout, DirectionalHint, Spinner, SpinnerSize } from "@fluentui/react";
import { IIconProps } from "@fluentui/react";
import { DefaultButton, IconButton, Label, Link } from "@fluentui/react";
import { Stack } from "@fluentui/react";
import { mergeStyleSets } from "@fluentui/react";
import { navigateToExternalUrl } from "../../utils/url";
import { useHistory } from "react-router-dom";
import { PersonaSmall, PersonaDetails } from "./Persona";
import { navBarItemStyles } from "./NavBarStyles";
import { globalStackStylesHeight100PaddingMedium, globalStackTokensGapMedium } from "../../globalStyles";
import AppContext from "../../components/App/AppContext";

interface IUserDialogProps {
  isOpen: boolean;
  authButton: any;
  toggleDialog: any;
}

const UserAccountDialog: React.FunctionComponent<IUserDialogProps> = (props: IUserDialogProps) => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  const styles = mergeStyleSets({
    callout: {
      maxWidth: 500,
    },
    button: {
      border: 0,
    },
  });

  return (
    <Callout
      className={styles.callout}
      alignTargetEdge={true}
      gapSpace={0}
      target=".calloutTargetAuthButton"
      isBeakVisible={false}
      directionalHint={DirectionalHint.bottomRightEdge}
      hidden={!props.isOpen}
      onDismiss={props.toggleDialog}
    >
      <Stack styles={globalStackStylesHeight100PaddingMedium} tokens={globalStackTokensGapMedium}>
        <Stack horizontal horizontalAlign="space-between" tokens={globalStackTokensGapMedium}>
          <Label onClick={props.authButton}>{appContext.user.tenant.name}</Label>
          <DefaultButton className={styles.button} onClick={props.authButton}>
            {t("NavBar.UserDialog.Button-SignOut")}
          </DefaultButton>
        </Stack>

        <PersonaDetails/>

        <Stack horizontal tokens={globalStackTokensGapMedium}>
          <Link onClick={() => navigateToExternalUrl(appContext.user.getMyAccountURL(), true)}>
            {t("NavBar.UserDialog.ViewAccount")}
          </Link>
        </Stack>
      </Stack>
    </Callout>
  );
};

interface AuthNavItemProps {
  toggleDialog: any;
  authButton: any;
  isOpen: boolean;
}

const AuthNavItem: React.FunctionComponent<AuthNavItemProps> = (props: AuthNavItemProps) => {
  const history = useHistory();
  const appContext = useContext(AppContext);

  function handleAuthButtionClick() {
    props.authButton();
    history.push("/");
  }

  const signInIcon: IIconProps = { iconName: "Signin" };

  // If authenticated, return a call-out with the user profile
  if (appContext.isAuthenticated) {
    return (
      <Fragment>
        <IconButton className="calloutTargetAuthButton" styles={navBarItemStyles} onClick={props.toggleDialog}>
          <PersonaSmall/>
        </IconButton>
        <UserAccountDialog
          authButton={props.authButton}
          isOpen={props.isOpen}
          toggleDialog={props.toggleDialog}
        />
      </Fragment>
    );
  }

  // Not authenticated, return a sign in link or a spinner when authentication is in progress
  return (
    <Fragment>
      {!appContext.isAuthInProgress && <IconButton styles={navBarItemStyles} onClick={handleAuthButtionClick} iconProps={signInIcon}></IconButton>}
      {appContext.isAuthInProgress && <IconButton styles={navBarItemStyles}><Spinner size={SpinnerSize.medium}/></IconButton>}
    </Fragment>
  );
};

export default AuthNavItem;
