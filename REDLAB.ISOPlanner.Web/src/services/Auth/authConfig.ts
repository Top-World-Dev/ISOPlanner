import { LogLevel } from "@azure/msal-browser";
import Config from "../Config/configService";
import logger from "../Logging/logService";
import AppError from "../../utils/appError"; 

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
const appClientId = Config.get("App.ClientId") as string;

export const msalConfig = {
  auth: {
    clientId: appClientId,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: Config.getAppURL(),
    postLogoutRedirectUri: Config.getAppURL() + "/logout",
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: Config.get("Auth.CacheLocation"), // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean
      ): void => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Warning:
          case LogLevel.Error:
            logger.error(new AppError(message));
            return;
          case LogLevel.Info:
            logger.info(message);
            return;
          case LogLevel.Verbose:
            logger.debug(message);
            return;
        }
      },
      piiLoggingEnabled: false,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    asyncPopups: false,
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
 const apiClientId = Config.get("Api.ClientId") as string;
 
export const loginRequest = {
  scopes: ["offline_access", "User.Read", "Mailboxsettings.Read", "Presence.Read", "User.Read.All"]
};

export const adminRequest = {
  scopes: `offline_access User.Read Mailboxsettings.Read Presence.Read User.Read.All ${apiClientId}/access_as_user`
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const graphRequest = {
  scopes: ["User.Read", "Mailboxsettings.Read", "Presence.Read", "User.Read.All"],
}; 

/**
 * Add here the scopes to request when obtaining an access token for the API.
 */
export const apiRequest = {
  scopes: ["offline_access", `${apiClientId}/.default`],
};
