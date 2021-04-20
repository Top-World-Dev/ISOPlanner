import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalConfig, loginRequest, graphRequest, apiRequest, adminRequest } from "../../services/Auth/authConfig";
import { getUserDetails } from "../../services/Graph/graphService";
import CurrentUser from "../../models/currentuser";
import UserLanguage from "../../models/userLanguage";
import { apiLoginUser } from "../../services/Api/userService";
import logger from "../../services/Logging/logService";
import { setCookie, getCookie, cookieNames, removeAllCookies } from "../../utils/cookie";
import { i18nBase } from "../../services/Localization/i18n";
import { AuthStateUpdate } from "../../components/App/App";

const ssoSilent = (publicClientApplication: PublicClientApplication, authStateUpdate: AuthStateUpdate) => {
  try {
    // If MSAL already has an account, the user
    // is already logged in, else try to do a silent SSO
    authStateUpdate(undefined, undefined, true, undefined);

    const accounts = publicClientApplication.getAllAccounts();

    if (accounts && accounts.length > 0) {
      if (accounts.length > 1) {
        login(publicClientApplication, authStateUpdate);
      } else {
        setUserProfile(publicClientApplication, authStateUpdate);
      }
    } else {
      const ssoRequest = {
        scopes: loginRequest.scopes,
        loginHint: getUserNameFromCookie(),
      };

      publicClientApplication
        .ssoSilent(ssoRequest)
        .then((response) => {
          setUserProfile(publicClientApplication, authStateUpdate);
        })
        .catch((err) => {
            //ignore the error
          authStateUpdate(false, CurrentUser.getEmptyUser(), false, undefined);
        });
    }
  } catch (err) {
    authStateUpdate(false, CurrentUser.getEmptyUser(), false, err);
  }
};

const login = async (publicClientApplication: PublicClientApplication, authStateUpdate: AuthStateUpdate) => {
  try {
    authStateUpdate(undefined, undefined, true, undefined);

    await publicClientApplication.loginPopup({
      scopes: loginRequest.scopes,
      prompt: "select_account",
    });

    await setUserProfile(publicClientApplication, authStateUpdate);
    
  } catch (err) {
    if (isShouldDisplayLoginError(err)) {
      authStateUpdate(false, CurrentUser.getEmptyUser(), false, err);
    } else {
      authStateUpdate(false, CurrentUser.getEmptyUser(), false, undefined);
    }
  }
};

const adminConsent = (publicClientApplication: PublicClientApplication, authStateUpdate: AuthStateUpdate) => {
  try {
    // if you want to work with multiple accounts, add your account selection logic below
    const accounts = publicClientApplication.getAllAccounts();

    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      const state = Math.floor(Math.random() * 90000) + 10000; // state parameter for anti token forgery
      const adminConsentUri = `https://login.microsoftonline.com/${account.tenantId}/v2.0/adminconsent?client_id=${msalConfig.auth.clientId}&state=${state}&redirect_uri=${msalConfig.auth.redirectUri}/enroll&scope=${adminRequest.scopes}`;

      window.location.replace(adminConsentUri);
    }
  } catch (err) {
    authStateUpdate(undefined, undefined, undefined, err);
  }
};

const logout = async (publicClientApplication: PublicClientApplication, authStateUpdate: AuthStateUpdate) => {
  try {
    await publicClientApplication.logoutPopup();
    removeAllCookies();
    authStateUpdate(false, CurrentUser.getEmptyUser(), false, undefined);
  } catch (err) {
    logger.error(err);
  } finally {
    authStateUpdate(false, CurrentUser.getEmptyUser(), false, undefined);
    removeAllCookies();
  }
};

const getAccessToken = async (publicClientApplication: PublicClientApplication, scopes: string[]): Promise<string> => {
  try {
    const accounts = publicClientApplication.getAllAccounts();

    if (!accounts || accounts.length <= 0) throw new Error("login_required");

    // Get the access token silently
    // If the cache contains a non-expired token, this function
    // will just return the cached token. Otherwise, it will
    // make a request to the Azure OAuth endpoint to get a token
    var silentResult = await publicClientApplication.acquireTokenSilent({
      scopes: scopes,
      account: accounts[0],
    });

    if (silentResult.accessToken) {
      return silentResult.accessToken;
    } else {
      throw new Error("Could not obtain an access token for unknown reason.");
    }
  } catch (err) {
    // If a silent request fails, it may be because the user needs
    // to login or grant consent to one or more of the requested scopes
    if (isInteractionRequired(err)) {
      var interactiveResult = await publicClientApplication.acquireTokenPopup({
        scopes: scopes,
      });

      return interactiveResult.accessToken;
    } else {
      throw err;
    }
  }
};

const setUserProfile = async (publicClientApplication: PublicClientApplication, authStateUpdate: AuthStateUpdate) => {
  try {
    saveUserNameToCookie(publicClientApplication);

    // Get the user's profile from Graph
    const accessTokenGraph = await getAccessToken(publicClientApplication, graphRequest.scopes);
    var usr = await getUserDetails(accessTokenGraph);

    // Send user to API for authentication checks of the tenant and registering the login
    const accessTokenApi = await getAccessToken(publicClientApplication, apiRequest.scopes);
    var login = await apiLoginUser(accessTokenApi);

    if (login) {
      usr.login = login;

      // Language setting from database overrides the Microsoft account setting
      if (usr.login.userLanguageCode) {
        usr.language = new UserLanguage(usr.login.userLanguageCode);
      }
      i18nBase.changeLanguage(usr.language.codeWithCulture);

      if (usr.id !== usr.login.userId) {
        // somehow, the back-end reports another userId than the frond-end. Hacked?
        throw new Error(`The user Id is not valid`);
      }

      if (login.userLicensed) {
        authStateUpdate(true, usr, false, undefined);
      } else {
        authStateUpdate(false, usr, false, undefined);
      }
    } else {
      throw new Error(`The user details cannot be retrieved`);
    }
  } catch (err) {
    authStateUpdate(false, CurrentUser.getEmptyUser(), false, err);
  }
};

const saveUserNameToCookie = (publicClientApplication: PublicClientApplication) => {
  try {
    const accounts: AccountInfo[] = publicClientApplication.getAllAccounts();
    const claims: any = accounts[0].idTokenClaims;
    const preferredUserName: string | undefined = claims.preferred_username;

    if (preferredUserName) {
      setCookie(cookieNames.UserName, preferredUserName);
    } else {
      throw new Error("The claim preferred-username is not present in the claim collection");
    }
  } catch (err) {
    logger.debug("Cannot save user name to cookie", err);
  }
};

const getUserNameFromCookie = (): string => {
  return getCookie(cookieNames.UserName, "");
};

const isShouldDisplayLoginError = (error: Error): boolean => {
  if (!error.message || error.message.length <= 0) {
    return true;
  }

  return error.message.indexOf("user_cancelled") === -1;
};

const isInteractionRequired = (error: Error): boolean => {
  if (!error.message || error.message.length <= 0) {
    return false;
  }

  return (
    error.message.indexOf("consent_required") > -1 ||
    error.message.indexOf("interaction_required") > -1 ||
    error.message.indexOf("login_required") > -1 ||
    error.message.indexOf("no_account_in_silent_request") > -1 ||
    error.message.indexOf("invalid_grant") > -1
  );
};

const authService = {
  getAccessToken: getAccessToken,
  ssoSilent: ssoSilent,
  adminConsent: adminConsent,
  login: login,
  logout: logout,
};

export default authService;
