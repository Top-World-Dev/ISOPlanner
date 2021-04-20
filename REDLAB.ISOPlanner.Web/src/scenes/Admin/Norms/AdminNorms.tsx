import React from "react";
import Norm from "../../../models/norm";
import { apiRequest } from "../../../services/Auth/authConfig";
import AppContext from "../../../components/App/AppContext";
import { Stack } from "@fluentui/react";
import SceneBar from "../../../components/SceneBar/SceneBar";
import { withTranslation, WithTranslation } from "react-i18next";
import {
  globalStackStylesHeight100,
  globalStackTokensGapMedium,
  globalStackItemStylesPaddingScene,
} from "../../../globalStyles";
import { apiGetNorms, apiUpdateNorm } from "../../../services/Api/normService";
import NormList from "./NormList";
import EditNormPanel from "./EditNormPanel";
import { navigateToExternalUrl } from "../../../utils/url";
import { CommandBar, ICommandBarItemProps } from "@fluentui/react";
import { globalNewNormURL } from "../../../globalConstants";

interface IAdminNormsProps extends WithTranslation {}

interface IAdminNormsState {
  norms: Norm[];
  isLoading: boolean;
  isUpdating: boolean;
  showEditPanel: boolean;
  normToEdit: Norm;
}

class AdminNorms extends React.Component<IAdminNormsProps, IAdminNormsState> {
  static contextType = AppContext;
  private _sceneBaseURL = "/admin/norms";
  private _norms: Norm[];

  constructor(props: IAdminNormsProps) {
    super(props);

    this._norms = [];

    this.state = {
      norms: this._norms,
      isLoading: false,
      isUpdating: false,
      showEditPanel: false,
      normToEdit: new Norm(),
    };
  }

  componentDidMount() {
    this.loadData();
  }

  //
  // General
  //

  async loadData() {
    try {
      this.setState({ isLoading: true });
      this.context.showContentLoader();

      var accessToken = await this.context.getAccessToken(apiRequest.scopes);
      this._norms = await apiGetNorms(
        true,
        this.context.user.language.code,
        this.context.user.login.defLanguageCode,
        accessToken
      );

      this.setState({ norms: this._norms });
    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
      this.setState({ isLoading: false });
    }
  }

  onUpdateListItems = (items: Norm[]) => {
    this.setState({ norms: [...items] }); //re-create the array to update the list
  };

  saveNorm = async (norm: Norm) => {
    try {
      this.setState({ isUpdating: true });
      this.context.showContentLoader();

      //close the panel
      this.toggleAddPanel();

      // update list of norms
      const idx: number = this._norms.findIndex((n) => {
        return n.normId === norm.normId;
      });
      this._norms[idx] = norm;
      this.onUpdateListItems(this._norms);

      // update database
      var accessToken = await this.context.getAccessToken(apiRequest.scopes);
      await apiUpdateNorm(norm, accessToken);
    } catch (err) {
      this.context.setError(err);
    } finally {
      this.context.hideContentLoader();
      this.setState({ isUpdating: false });
    }
  };

  editNorm = (norm: Norm) => {
    this.setState({ normToEdit: norm.clone(), showEditPanel: !this.state.showEditPanel });
  };

  toggleAddPanel = () => {
    this.setState({ showEditPanel: !this.state.showEditPanel });
  };

  getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: "getMore",
        text: this.props.t("adminNorms:Commands.GetMoreNorms"),
        iconProps: { iconName: "AddToShoppingList" },
        onClick: () => navigateToExternalUrl(globalNewNormURL),
      },
    ];
  };

  render() {
    return (
      <Stack horizontal styles={globalStackStylesHeight100}>
        <Stack.Item grow>
          <Stack verticalFill tokens={globalStackTokensGapMedium}>
            <Stack.Item>
              <SceneBar
                user={this.context.user}
                title={this.props.t("adminNorms:Title")}
                subtitle={this.props.t("adminNorms:SubTitle")}
                image="admin-norms.png"
                pivotItems={undefined}
                selectedPivotKey={undefined}
                baseURL={this._sceneBaseURL}
              ></SceneBar>
            </Stack.Item>

            <CommandBar items={this.getCommandBarItems()}></CommandBar>
            <Stack.Item grow styles={globalStackItemStylesPaddingScene}>
              <NormList
                allitems={this._norms}
                items={this.state.norms}
                updateItems={this.onUpdateListItems}
                updateSelection={() => {}} //empty function because selection is not used
                showFilter={false}
                editRow={this.editNorm}
              />
            </Stack.Item>
            <Stack.Item>
              <EditNormPanel
                togglePanel={this.toggleAddPanel}
                isOpen={this.state.showEditPanel}
                norm={this.state.normToEdit}
                save={this.saveNorm}
              ></EditNormPanel>
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>{/* Right side bar */}</Stack.Item>
      </Stack>
    );
  }
}

export default withTranslation(["translation", "adminNorms"])(AdminNorms);
