import * as React from "react";
import { Stack, SearchBox } from "@fluentui/react";
import { Persona, PersonaSize } from "@fluentui/react";
import { DetailsList, IDetailsListStyles, IColumn, DetailsListLayoutMode, SelectionMode } from "@fluentui/react";
import User from "../../models/user";
import { withTranslation, WithTranslation } from "react-i18next";
import AppContext from "../App/AppContext";
import { globalStackTokensGapSmall } from "../../globalStyles";
import { graphRequest } from "../../services/Auth/authConfig";
import { getUsers } from "../../services/Graph/graphService";
import InfoMessage from "../Notification/InfoMessage";
import { globalGraphMaxRecords, globalMinFilterChars, globalFilterDelay } from "../../globalConstants";

export interface IAdUserPickerProps extends WithTranslation {
  getAccessToken: Function;
  setError: Function;
  selectUser: Function;
}

export interface IAdUserPickerState {
  users: User[];
  isLoading: boolean;
  columns: IColumn[];
  noData: boolean;
  selectedItem: User | undefined;
}

class AdUserPicker extends React.Component<IAdUserPickerProps, IAdUserPickerState> {
  static contextType = AppContext;
  private _columns: IColumn[];
  private _users: User[];
  private _timer?: NodeJS.Timeout;

  listStyles: Partial<IDetailsListStyles> = { root: { height: 300 } };

  constructor(props: IAdUserPickerProps) {
    super(props);

    this._columns = this.getColumns();
    this._users = [];

    this.state = {
      users: this._users,
      columns: this._columns,
      isLoading: false,
      noData: false,
      selectedItem: undefined
    };

    this.loadData = this.loadData.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.onFilter = this.onFilter.bind(this);
  }

  onFilter(ev: React.ChangeEvent<HTMLInputElement> | undefined, text: string | undefined): void {
    this.loadData(text);
  };

  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }

  async loadData(filterText: string | undefined) {
    try {
      if (this.state.isLoading) {
        return;
      }
      if (!filterText || filterText.length < globalMinFilterChars) {
        this.setState({ users: [] });
        return;
      }

      this.setState({ isLoading: true });
      this.context.showContentLoader();

      var accessToken = await this.props.getAccessToken(graphRequest.scopes);
      this._users = await getUsers(accessToken, filterText);

      this.setState({ noData: this._users.length === 0, users: this._users, selectedItem: undefined });

    } catch (err) {
      this.props.setError(err);
    } finally {
      this.context.hideContentLoader();
      this.setState({ isLoading: false });
    }
  }

  private getColumns(): IColumn[] {
    return [
      {
        key: "user",
        name: "user",
        minWidth: 80,
        maxWidth: 180,
        isRowHeader: true,
        isSorted: false,
        isSortedDescending: false,
        isPadded: true,
        onRender: (item: User, index: number | undefined) => (
          <Persona
            text={item.name}
            secondaryText={item.jobTitle}
            size={PersonaSize.size40}
            hidePersonaDetails={false}
          />
        ),
      },
    ];
  }

  private activeItemChanged = (
    item: User,
    index: number | undefined,
    ev: React.FocusEvent<HTMLElement> | undefined
  ): void => {
    //remember the last selected item in state
    //this event will fire also when the samen item is focused again which can lead to unexpected results
    //like the dialog saying that the user is already registered being shown in a loop
    if (item !== this.state.selectedItem) {
      this.setState( { selectedItem: item });
      this.props.selectUser(item);
    }
  };

  render() {
    return (
      <Stack tokens={globalStackTokensGapSmall}>
        <Stack.Item>
          <SearchBox
            underlined={false}
            placeholder={this.props.t("General.Search.Placeholder")}
            onChange={(ev, newValue) => {
              if (this._timer) {
                clearTimeout(this._timer);
              }
              this._timer = setTimeout(() => this.onFilter(ev, newValue), globalFilterDelay);
            }}
          />
        </Stack.Item>
        <Stack.Item>
          {this.state.noData && (
            <InfoMessage message={this.props.t("General.Search.NoData")} onDismiss={null}></InfoMessage>
          )}
          <DetailsList
            items={this.state.users}
            columns={this.state.columns}
            compact={true}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            selectionMode={SelectionMode.none}
            selectionPreservedOnEmptyClick={true}
            isHeaderVisible={false}
            styles={this.listStyles}
            onActiveItemChanged={this.activeItemChanged}
          />
          {this.state.users.length >= globalGraphMaxRecords && (
            <InfoMessage
              message={this.props.t("General.Search.MaxRecords", { max: globalGraphMaxRecords })}
              onDismiss={null}
            ></InfoMessage>
          )}
        </Stack.Item>
      </Stack>
    );
  }
}

export default withTranslation()(AdUserPicker);
