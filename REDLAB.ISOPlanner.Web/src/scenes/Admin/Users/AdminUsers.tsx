import React from "react";
import User from "../../../models/user";
import Tenant from "../../../models/tenant";
import { apiGetUsers, apiGetUsersByRole } from "../../../services/Api/userService";
import { apiGetTenant, apiGetTenantLicenses } from "../../../services/Api/tenantService";
import { apiGetSettings } from "../../../services/Api/settingService";
import { apiRequest } from "../../../services/Auth/authConfig";
import AppContext from "../../../components/App/AppContext";
import { Stack } from "@fluentui/react";
import { Selection } from "@fluentui/react";
import SceneBar from "../../../components/SceneBar/SceneBar";
import { IPivotItemProps } from "../../../components/SceneBar/ScenePivot";
import { withTranslation, WithTranslation } from "react-i18next";
import { globalStackStylesHeight100, globalStackTokensGapMedium } from "../../../globalStyles";
import { Route, Switch, Redirect } from "react-router-dom";
import { getCurrentPivotKeyFromURL } from "../../../utils/url";
import { appRoles } from "../../../services/Auth/appRoles";
import { AutoUserLicense, AutoCleanLicense } from "../../../models/setting";
import TabLicensing from "./TabLicensing";
import TabAudit from "./TabAudit";
import TabRoles from "./TabRoles";
import TabSettings from "./TabSettings";

// Business rules
//
// 1. # Used licensed cannot exceed # free licenses
// 2. User cannot unlincense him/her self
// 3. User cannot remove him/her self
// 4. Users in the database must be unique on Id from Graph
// 5. There must be at least 1 user with a license This is covered by #2 and #3 for front-end

interface IAdminUsersProps extends WithTranslation {}

export interface IAdminUsersState {
  users: User[];
  userselection?: Selection;
  tenant?: Tenant;
  showRemoveDialog: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  showEnableLicenseInvalidSelectionDialog: boolean;
  showDisableLicenseInvalidSelectionDialog: boolean;
  showAddPanel: boolean;
  showFreeLicenseCoach: boolean;
  toggleAutoUserLicense: boolean;
  toggleAutoCleanLicense: boolean;
  adminUsers: User[];
  managerUsers: User[];
  dbUsers: User[];
  dbAdminUsers: User[];
  dbManagerUsers: User[];
  dbTenant: Tenant;
  setState: Function;
  isBusy: Function;
}

class AdminUsers extends React.Component<IAdminUsersProps, IAdminUsersState> {
  static contextType = AppContext;
  private _sceneBaseURL = "/admin/users";

  constructor(props: IAdminUsersProps) {
    super(props);

    this.state = {
      users: [],
      userselection: undefined,
      tenant: new Tenant("", ""),
      showRemoveDialog: false,
      isLoading: false,
      isUpdating: false,
      showEnableLicenseInvalidSelectionDialog: false,
      showDisableLicenseInvalidSelectionDialog: false,
      showAddPanel: false,
      showFreeLicenseCoach: false,
      toggleAutoUserLicense: false,
      toggleAutoCleanLicense: false,
      adminUsers: [],
      managerUsers: [],
      dbUsers: [],
      dbTenant: new Tenant("", ""),
      dbAdminUsers: [],
      dbManagerUsers: [],
      setState: this.setStateFromTab,
      isBusy: this.isBusy,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  //
  // General
  //

  pivotItems: IPivotItemProps[] = [
    { key: "licensing", text: this.props.t("adminUsers:Pivot.Licensing"), url: "/licensing" },
    { key: "roles", text: this.props.t("adminUsers:Pivot.Roles"), url: "/roles" },
    { key: "settings", text: this.props.t("adminUsers:Pivot.Settings"), url: "/settings" },
    { key: "audit", text: this.props.t("adminUsers:Pivot.Audit"), url: "/audit" },
  ];

  async loadData() {
    try {
      this.setState({ isLoading: true });
      this.context.showContentLoader();

      // Load users
      var accessToken = await this.context.getAccessToken(apiRequest.scopes);
      var users = await apiGetUsers(accessToken);
      var tenant = await apiGetTenant(accessToken);
      tenant = await apiGetTenantLicenses(tenant, accessToken);

      // set the loaded state from the api to the 'db' vars as wel as the 'editable' vars
      this.setState({ dbUsers: users, dbTenant: tenant, users: users, tenant: tenant });

      //Load Settings
      accessToken = await this.context.getAccessToken(apiRequest.scopes);
      var settings = await apiGetSettings(accessToken);

      this.setState({
        toggleAutoUserLicense: settings.find((s) => s.settingName === AutoUserLicense)?.GetValue(),
        toggleAutoCleanLicense: settings.find((s) => s.settingName === AutoCleanLicense)?.GetValue(),
      });

      //Load Roles
      accessToken = await this.context.getAccessToken(apiRequest.scopes);
      var adminUsers = await apiGetUsersByRole(appRoles.Admin, accessToken);
      var managerUsers = await apiGetUsersByRole(appRoles.Manager, accessToken);

      // set the loaded state from the api to the 'db' vars as wel as the 'editable' vars
      this.setState({
        dbAdminUsers: adminUsers,
        dbManagerUsers: managerUsers,
        adminUsers: adminUsers,
        managerUsers: managerUsers,
      });

      //Load Audit
    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
      this.setState({ isLoading: false });
    }
  }

  setStateFromTab = (state: any) => {
    this.setState(state);
  };

  isBusy = (): boolean => {
    if (!this.state) {
      return false;
    }
    return this.state.isLoading || this.state.isUpdating;
  };

  render() {
    return (
      <Stack horizontal styles={globalStackStylesHeight100}>
        <Stack.Item grow>
          <Stack verticalFill tokens={globalStackTokensGapMedium}>
            <Stack.Item>
              <SceneBar
                user={this.context.user}
                title={this.props.t("adminUsers:Title")}
                subtitle={this.props.t("adminUsers:SubTitle")}
                image="admin-users.png"
                pivotItems={this.pivotItems}
                selectedPivotKey={getCurrentPivotKeyFromURL(this.pivotItems)}
                baseURL={this._sceneBaseURL}
              ></SceneBar>
            </Stack.Item>
            <Switch>
              <Route path={`${this._sceneBaseURL}/licensing`} render={() => <TabLicensing {...this.state} />} />
              <Route path={`${this._sceneBaseURL}/roles`} render={() => <TabRoles {...this.state} />} />
              <Route path={`${this._sceneBaseURL}/settings`} render={() => <TabSettings {...this.state} />} />
              <Route path={`${this._sceneBaseURL}/audit`} render={() => <TabAudit {...this.state} />} />
              <Redirect from={this._sceneBaseURL} to={`${this._sceneBaseURL}/licensing`}></Redirect>
              <Redirect to="/not-found"></Redirect>
            </Switch>
          </Stack>
        </Stack.Item>
        <Stack.Item>{/* Right side bar */}</Stack.Item>
      </Stack>
    );
  }
}

export default withTranslation(["translation", "adminUsers"])(AdminUsers);
