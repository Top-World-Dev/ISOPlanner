import * as React from 'react';
import CurrentUser from "../../models/currentuser";
import AppError from "../../utils/appError";

export interface IAppContext {
    useDarkMode: boolean,
    setUseDarkMode: Function,
    isAppLoading: boolean,
    showAppLoader: Function,
    hideAppLoader: Function,
    isContentLoading: boolean,
    showContentLoader: Function,
    hideContentLoader: Function,
    reloadPage: Function,
    error?: AppError,
    setError: Function,
    getAccessToken: Function,
    isAuthenticated: boolean;
    isAuthInProgress: boolean;
    user: CurrentUser;
}

const appContext : IAppContext = {
    useDarkMode: false,
    setUseDarkMode: () => {},
    isAppLoading: false,
    showAppLoader: () => {},
    hideAppLoader: () => {},
    isContentLoading: false,
    showContentLoader: () => {},
    hideContentLoader: () => {},
    reloadPage: () => {},
    error: undefined,
    setError: () => {},
    getAccessToken: () => {},
    isAuthenticated: false,
    isAuthInProgress: false,
    user: CurrentUser.getEmptyUser()
}

const AppContext = React.createContext(appContext);
AppContext.displayName = 'Global app context';

export default AppContext;