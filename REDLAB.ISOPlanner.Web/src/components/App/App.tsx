import React, { Suspense } from "react";
import AuthService from "../../services/Auth/authService";
import { Stack, Separator, ScrollablePane, ScrollbarVisibility } from "@fluentui/react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import NavMain from "../NavMain/NavMain";
import NavAdmin from "../NavMain/NavAdmin";
import { ErrorMessage } from "../Notification/ErrorMessage";
import Welcome from "../../scenes/Welcome/Welcome";
import Enroll from "../../scenes/Enroll/Enroll";
import Logout from "../../scenes/Logout/Logout";
import SceneLoader from "../Loading/SceneLoader";
import NotFound from "../../scenes/NotFound/NotFound";
import NotAuthorized from "../../scenes/NotAuthorized/NotAuthorized";
import Tasks from "../../scenes/Tasks/Tasks";
import AdminUsers from "../../scenes/Admin/Users/AdminUsers";
import AdminGroups from "../../scenes/Admin/Groups/AdminGroups";
import AdminNorms from "../../scenes/Admin/Norms/AdminNorms";
import Dashboard from "../../scenes/Dashboard/Dashboard";
import AppContext, { IAppContext } from "./AppContext";
import AppLoader from "../../components/Loading/AppLoader";
import ContentLoader from "../../components/Loading/ContentLoader";
import { darkTheme, lightTheme } from "../../globalThemes";
import AppRightSideBarLayerHost from "./AppRightSideBarLayerHost";
import AppContentAreaTopLayerHost from "./AppContentAreaTopLayerHost";
import { setCookie, getCookie, cookieNames } from "../../utils/cookie";
import { ThemeProvider } from "@fluentui/react";
import ProtectedRoute from "../Routing/ProtectedRoute";
import { appRoles } from "../../services/Auth/appRoles";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../../services/Auth/authConfig";
import CurrentUser from "../../models/currentuser";
import logger from "../../services/Logging/logService";
import AppError from "../../utils/appError";
import { Ajax } from "@syncfusion/ej2-base";

export type AuthStateUpdate = (
  isAuthenticated?: boolean | undefined,
  user?: CurrentUser | undefined,
  isAuthInProgress?: boolean | undefined,
  error?: any | undefined
) => void;

export interface IAppProps {}

class App extends React.Component<IAppProps, IAppContext> {
  private publicClientApplication: PublicClientApplication;

  constructor(props: IAppProps) {
    super(props);

    this.state = {
      useDarkMode: false,
      setUseDarkMode: this.setUseDarkMode,
      isAppLoading: false,
      showAppLoader: this.showAppLoader,
      hideAppLoader: this.hideAppLoader,
      isContentLoading: false,
      showContentLoader: this.showContentLoader,
      hideContentLoader: this.hideContentLoader,
      reloadPage: this.reloadPage,
      error: undefined,
      setError: this.setErrorMessage,
      getAccessToken: this.getAccessToken,
      isAuthenticated: false,
      isAuthInProgress: true, // set to true because we start with a silent SSO request
      user: CurrentUser.getEmptyUser(),
    };

    // Initialize the MSAL application object
    this.publicClientApplication = new PublicClientApplication(msalConfig);
    logger.debug("MSAL client app initialized", msalConfig);
  }

  //
  // Startup
  //
  componentDidMount() {
    // Set the light or dark mode
    this.setState({
      useDarkMode: !(getCookie(cookieNames.DarkMode, "false") === "false"),
    });

    this.setSyncFusionDarkMode(this.state.useDarkMode);

    // Try to login silently
    AuthService.ssoSilent(this.publicClientApplication, this.authStateUpdate);
  }

  //
  // Loader functions
  //
  showAppLoader = () => this.setState({ isAppLoading: true });
  hideAppLoader = () => this.setState({ isAppLoading: false });
  showContentLoader = () => this.setState({ isContentLoading: true });
  hideContentLoader = () => this.setState({ isContentLoading: false });
  reloadPage = () => window.location.reload();

  //
  // Light and dark mode functions
  //
  setUseDarkMode = (useDarkMode: boolean) => {
    this.setState({ useDarkMode: useDarkMode });
    this.setSyncFusionDarkMode(useDarkMode);
    setCookie(cookieNames.DarkMode, useDarkMode);
  };

  setSyncFusionDarkMode = (useDarkMode: boolean) => {
    // this load a 2.5MB css which is really slow however there is no other solution in 18.4
    // we need to evaluate how this works for users
    const styleTag: HTMLElement | null = document.getElementById("theme");
    if (styleTag) {
      const theme: string = useDarkMode ? "fabric-dark" : "fabric";
      const sas: string = '?sv=2020-02-10&ss=f&srt=sco&sp=rl&se=2031-04-07T21:06:56Z&st=2021-04-07T13:06:56Z&spr=https&sig=6FpTosQYBeNIoLXhINvLyvDrJkWoP4lQoMWorqIe1ls%3D'
      const ticks: string = `&ticks=${new Date(1970, 0, 1).getTime()}`;
      const ajax: Ajax = new Ajax({ url: `https://redlabstorage.file.core.windows.net/cdn/${theme}.css${sas}${ticks}` }, "GET", true);
      ajax
        .send()
        .then((result: any) => { 
          styleTag.innerHTML = `/*${theme}*/` + result;
        })
        .catch((err: any) => {
          this.setErrorMessage(err);
        });
    }
  };

  //
  // Authentication service wrapper functions
  //
  authStateUpdate = (
    isAuthenticated?: boolean | undefined,
    user?: CurrentUser | undefined,
    isAuthInProgress?: boolean | undefined,
    error?: any | undefined
  ) => {
    // Update the state with 1 statement, otherwise timing issues will arrise
    // So for each state property to set, check if it's defined and if so, set it, otherwise set it to the current state
    const newState = {
      isAuthenticated: isAuthenticated !== undefined ? isAuthenticated : this.state.isAuthenticated,
      isAuthInProgress: isAuthInProgress !== undefined ? isAuthInProgress : this.state.isAuthInProgress,
      user: user !== undefined ? user : this.state.user,
      error: error !== undefined ? error : this.state.error,
    };

    this.setState(newState);
  };

  login = async () => {
    return await AuthService.login(this.publicClientApplication, this.authStateUpdate);
  };

  logout = async () => {
    return await AuthService.logout(this.publicClientApplication, this.authStateUpdate);
  };

  adminConsent = () => {
    return AuthService.adminConsent(this.publicClientApplication, this.authStateUpdate);
  };

  getAccessToken = async (scopes: string[]) => {
    return await AuthService.getAccessToken(this.publicClientApplication, scopes);
  };

  //
  // Global error message functions
  //
  setErrorMessage = (error: string | any) => {
    this.setState({
      error: this.normalizeError(error),
    });
  };

  normalizeError = (error: string | any): AppError | undefined => {
    if (!error) {
      return undefined;
    }
    var normalizedError: AppError;
    if (typeof error === "string") {
      var errParts = error.split("|");
      normalizedError = errParts.length > 1 ? new AppError(errParts[1], "", errParts[0]) : new AppError(error);
    } else {
      normalizedError = new AppError(
        error.message,
        error.code ? error.code : "",
        JSON.stringify(error),
        error.stack ? error.stack : ""
      );
    }
    return normalizedError;
  };

  //
  // Main render
  //
  render() {
    return (
      <ThemeProvider applyTo="body" theme={this.state.useDarkMode ? darkTheme : lightTheme}>
        <AppContext.Provider value={this.state}>
          <Router>
            <Stack verticalFill styles={{ root: { height: "100vh" } }}>
              {/* Main App */}

              <Stack.Item>
                {/* Top bar */}

                <NavBar
                  authButton={this.state.isAuthenticated ? this.logout : this.login}
                  adminConsent={this.adminConsent}
                ></NavBar>

                <AppLoader />
              </Stack.Item>

              <Stack.Item grow>
                {/* Body */}

                <Stack horizontal styles={{ root: { height: "100%" } }}>
                  <Stack.Item styles={{ root: { position: "relative", minWidth: 230 } }}>
                    {/* Left side bar */}
                    <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                      <NavMain />
                      <NavAdmin />
                    </ScrollablePane>
                  </Stack.Item>
                  <Separator vertical></Separator>
                  <Stack.Item grow>
                    {/* Content area */}

                    <Stack styles={{ root: { height: "100%" } }}>
                      <Stack.Item>
                        {/* Notification area */}
                        <AppContentAreaTopLayerHost />
                        <ContentLoader />
                        <ErrorMessage error={this.state.error} setError={this.state.setError} />
                      </Stack.Item>

                      <Stack.Item grow styles={{ root: { position: "relative" } }}>
                        {/* Scene area */}
                        <Suspense fallback={<SceneLoader />}>
                          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
                            <Switch>
                              {/* 1. All users may navigate to unprotected routes, signed in or not
                                  2. When authentication is in progress, wait until completed by rendering the ProgressIndicator
                                  3. When the user is not authenticated and requests a protected route, navigate to not-authorized
                                  4. When the user is authenticated, navigate to the protected route, the route itself is responsible for checking role and redirect to not-authorized
                                  5. Navigate to not-found when the route is not found 
                              */}

                              {/* These routes are not protected  */}
                              <Route path="/logout" render={(props) => <Logout {...props} />} />
                              <Route path="/not-found" render={(props) => <NotFound {...props} />} />
                              <Route path="/not-authorized" render={(props) => <NotAuthorized {...props} />} />

                              {/* Route all paths (not exact /) to the SceneLoader component when authorization is in progress */}
                              {this.state.isAuthInProgress && <Route path="/" render={(props) => <SceneLoader />} />}

                              {/* Route to home and switch between is/not authenticated */}
                              <Route
                                path="/"
                                exact
                                render={(props) =>
                                  this.state.isAuthenticated ? (
                                    <Dashboard {...props} />
                                  ) : (
                                    <Welcome authButton={this.login} {...props} />
                                  )
                                }
                              />

                              {/* After this point all routes are protected and must have a logged in user */}
                              {!this.state.isAuthenticated && <Redirect to="/not-authorized"></Redirect>}

                              <ProtectedRoute
                                path="/admin/users"
                                user={this.state.user}
                                role={appRoles.Admin}
                                render={(props) => <AdminUsers {...props} />}
                              />

                              <ProtectedRoute
                                path="/admin/groups"
                                user={this.state.user}
                                role={appRoles.Admin}
                                render={(props) => <AdminGroups {...props} />}
                              />

                              <ProtectedRoute
                                path="/admin/norms"
                                user={this.state.user}
                                role={appRoles.Admin}
                                render={(props) => <AdminNorms {...props} />}
                              />

                              <Route path="/tasks" render={(props) => <Tasks {...props} />} />

                              <Route path="/enroll" render={(props) => <Enroll {...props} />} />

                              <Redirect to="/not-found"></Redirect>
                            </Switch>
                          </ScrollablePane>
                        </Suspense>
                      </Stack.Item>
                    </Stack>
                  </Stack.Item>
                  <Stack.Item>
                    {/* Panel area */}
                    <AppRightSideBarLayerHost />
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            </Stack>
          </Router>
        </AppContext.Provider>
      </ThemeProvider>
    );
  }
}

export default App;
