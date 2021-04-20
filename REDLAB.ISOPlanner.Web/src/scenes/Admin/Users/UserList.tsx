import * as React from "react";
import { Checkbox, Stack, TooltipHost } from "@fluentui/react";
import {
  DetailsList,
  DetailsListLayoutMode,
  IDetailsColumnStyles,
  Selection,
  SelectionMode,
  IColumn,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  IRenderFunction,
} from "@fluentui/react";
import { ScrollablePane, ScrollbarVisibility, Sticky, StickyPositionType } from "@fluentui/react";
import { MarqueeSelection } from "@fluentui/react";
import User from "../../../models/user";
import { withTranslation, WithTranslation } from "react-i18next";
import { SearchBox, ISearchBoxStyles } from "@fluentui/react";
import { toLocaleDateTimeNoSeconds } from "../../../utils/datetime";
import { globalMinFilterChars, globalFilterDelay } from "../../../globalConstants";

export interface IUserListState {
  columns: IColumn[];
}

export interface IUserListProps extends WithTranslation {
  allitems: User[];
  items: User[];
  updateItems: Function;
  updateSelection: Function;
  updateLicense: Function;
  showFilter?: boolean;
}

class UserList extends React.Component<IUserListProps, IUserListState> {
  private _selection: Selection;
  private _columns: IColumn[];
  private _timer?: NodeJS.Timeout;

  constructor(props: IUserListProps) {
    super(props);

    this.updateItems = this.updateItems.bind(this);
    this.updateSelection = this.updateSelection.bind(this);

    this._selection = new Selection({
      onSelectionChanged: () => {
        this.updateSelection();
      },
    });

    this._columns = this.getColumns();

    this.state = {
      columns: this._columns,
    };
  }

  componentWillUnmount() {
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }

  searchBoxStyles: Partial<ISearchBoxStyles> = { root: { width: 200 } };

  columnCenterStyle: Partial<IDetailsColumnStyles> = {
    root: {
      textAlign: "center",
    },
  };

  updateItems(items: User[]) {
    this.props.updateItems(items);
  }

  updateSelection() {
    this.props.updateSelection(this._selection);
  }

  public render(): JSX.Element {
    return (
      <Stack verticalFill>
        <Stack horizontal>
          {this.props.showFilter && (
            <Stack.Item> 
              <SearchBox
                underlined={true}
                styles={this.searchBoxStyles}
                placeholder={this.props.t("General.Filter.Placeholder")}
                onChange={(ev, newValue) => {
                  if (this._timer) {
                    clearTimeout(this._timer);
                  }
                  this._timer = setTimeout(() => this.onFilter(ev, newValue), globalFilterDelay);
                }}
              />
            </Stack.Item>
          )}
        </Stack>
        <Stack.Item grow styles={{ root: { position: "relative" } }}>
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <MarqueeSelection selection={this._selection}>
              <DetailsList
                items={this.props.items}
                columns={this.state.columns}
                compact={false}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.multiple}
                selection={this._selection}
                selectionPreservedOnEmptyClick={true}
                isHeaderVisible={true}
                onColumnHeaderClick={this.onColumnClick}
                onRenderDetailsHeader={this.onRenderDetailsHeader}
                // onItemInvoked={this._onItemInvoked}
                // onActiveItemChanged={this._activeItemChanged}
              />
            </MarqueeSelection>
          </ScrollablePane>
        </Stack.Item>
      </Stack>
    );
  }

  private onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props) {
      return null;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> = (tooltipHostProps) => (
      <TooltipHost {...tooltipHostProps} />
    );
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
        {defaultRender!({
          ...props,
          onRenderColumnHeaderTooltip,
        })}
      </Sticky>
    );
  };

  private getColumns(): IColumn[] {
    return [
      {
        key: "License",
        name: this.props.t("adminUsers:TabLicensing.List.License"),
        fieldName: "hasLicense",
        minWidth: 40,
        maxWidth: 64,
        isRowHeader: true,
        isResizable: true,
        isCollapsible: true,
        isSorted: true,
        isSortedDescending: true,
        data: "boolean",
        isPadded: true,
        onRender: (item: User, index: number | undefined) => (
          <Checkbox
            checked={item.hasLicense}
            onChange={(ev, checked) => this.props.updateLicense(item, checked, index)}
          ></Checkbox>
        ),
        styles: this.columnCenterStyle,
      },
      {
        key: "Name",
        name: this.props.t("adminUsers:TabLicensing.List.Name"),
        fieldName: "name",
        minWidth: 100,
        maxWidth: 300,
        isRowHeader: false,
        isResizable: true,
        isCollapsible: true,
        isSorted: false,
        isSortedDescending: false,
        data: "string",
        isPadded: true,
      },
      {
        key: "E-mail",
        name: this.props.t("adminUsers:TabLicensing.List.Email"),
        fieldName: "email",
        minWidth: 100,
        isRowHeader: false,
        isResizable: true,
        isCollapsible: true,
        isSorted: false,
        isSortedDescending: false,
        data: "string",
        isPadded: true,
      },
      {
        key: "Last login",
        name: this.props.t("adminUsers:TabLicensing.List.LastLogin"),
        fieldName: "lastLogin",
        minWidth: 100,
        maxWidth: 200,
        isRowHeader: false,
        isResizable: true,
        isCollapsible: true,
        isSorted: false,
        isSortedDescending: false,
        data: "Date",
        isPadded: true,
        onRender: (item: User) => <span>{toLocaleDateTimeNoSeconds(item.lastLogin)}</span>,
      },
      {
        key: "Created",
        name: this.props.t("adminUsers:TabLicensing.List.Created"),
        fieldName: "created",
        minWidth: 100,
        maxWidth: 200,
        isRowHeader: false,
        isResizable: true,
        isCollapsible: true,
        isSorted: false,
        isSortedDescending: false,
        data: "Date",
        isPadded: true,
        onRender: (item: User) => <span>{toLocaleDateTimeNoSeconds(item.created)}</span>,
      },
    ];
  }

  private onFilter = (ev: React.ChangeEvent<HTMLInputElement> | undefined, text: string | undefined): void => {
    if (!text || text.length < globalMinFilterChars) {
      this.updateItems(this.props.allitems);
    } else {
      this.updateItems(this.props.allitems.filter(
        (i) => i.name.toLowerCase().indexOf(text) > -1 || i.email.toLowerCase().indexOf(text) > -1
      ));
    }
  };

  private onColumnClick = (ev: React.MouseEvent<HTMLElement> | undefined, column: IColumn | undefined): void => {
    const { columns } = this.state;
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter((currCol) => column?.key === currCol.key)[0];

    for (var newCol of newColumns) {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = false;
      }
    }

    const newItems = this.copyAndSort(this.props.items, currColumn.fieldName!, currColumn.isSortedDescending);

    this.setState({
      columns: newColumns,
    });

    this.updateItems(newItems);
  };

  private copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }

  private _renderItemColumn(item: User, index: number | undefined, column: IColumn | undefined) {}

  private _activeItemChanged = (
    item: User,
    index: number | undefined,
    ev: React.FocusEvent<HTMLElement> | undefined
  ): void => {};

  private _onItemInvoked = (item: User): void => {};
}

export default withTranslation(['translation', 'adminUsers'])(UserList);
