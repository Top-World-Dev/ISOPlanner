import React from "react";
import {
  Panel,
  PanelType,
  PrimaryButton,
  DefaultButton,
  TextField,
  Checkbox,
} from "@fluentui/react";
import { Stack } from "@fluentui/react";
import AppContext from "../../../components/App/AppContext";
import { withTranslation, WithTranslation } from "react-i18next";
import {
  globalLayerRightSideBarProps,
  globalStackTokensGapLarge,
  globalStackTokensGapSmall,
  globalStackStylesPanel,
} from "../../../globalStyles";
import Norm from "../../../models/norm";

interface IEditNormPanelProps extends WithTranslation {
  togglePanel: any;
  isOpen: boolean;
  norm: Norm;
  save: any;
}

interface IEditNormPanelState {
  errors: any;
}

class EditNormPanel extends React.Component<IEditNormPanelProps, IEditNormPanelState> {
  static contextType = AppContext;
  _localizedFields: Record<string, string>;

  constructor(props: IEditNormPanelProps) {
    super(props);

    this.state = {
      errors: undefined,
    };

    this._localizedFields = {
      name: this.props.t("adminNorms:Panels.Edit.Name"),
      description: this.props.t("adminNorms:Panels.Edit.Description"),
      activate: this.props.t("adminNorms:Panels.Edit.Activate"),
    };
  }

  save = () => {
    this.props.save(this.props.norm);
  };

  close = () => {
    this.props.togglePanel();
  };

  hasError = (): boolean => {
    return this.state.errors;
  };

  validate = (fieldName: string) => {
    const result = this.props.norm.validate(this._localizedFields);
    this.setState({ errors: result.error });
    if (result.error) {
      const fieldError = result.error.details.find((e) => {
        return e.context?.key === fieldName;
      });
      return fieldError ? fieldError.message : undefined;
    }
    return undefined;
  };

  onRenderFooterContent = () => {
    return (
      <Stack horizontal styles={globalStackStylesPanel} tokens={globalStackTokensGapSmall}>
        <Stack.Item>
          <PrimaryButton onClick={this.save} disabled={this.hasError()}>
            {this.props.t("General.Button.Save")}
          </PrimaryButton>
        </Stack.Item>
        <Stack.Item>
          <DefaultButton onClick={this.close}>{this.props.t("General.Button.Cancel")}</DefaultButton>
        </Stack.Item>
      </Stack>
    );
  };

  render() {
    return (
      <Panel
        headerText={this.props.t("adminNorms:Panels.Edit.Title")}
        type={PanelType.smallFixedFar}
        isBlocking={true}
        isHiddenOnDismiss={false}
        isOpen={this.props.isOpen}
        onDismiss={this.close}
        isFooterAtBottom={true}
        layerProps={globalLayerRightSideBarProps}
        onRenderFooterContent={this.onRenderFooterContent}
      >
        <Stack styles={globalStackStylesPanel} tokens={globalStackTokensGapLarge}>
          <Stack.Item>
            <TextField
              label={this._localizedFields["name"]}
              defaultValue={this.props.norm.name}
              onChange={(ev, newValue) => {
                this.props.norm.name = newValue ? newValue : "";
              }}
              onGetErrorMessage={() => {
                return this.validate("name");
              }}
              required
            />
          </Stack.Item>
          <Stack.Item>
            <TextField
              label={this._localizedFields["description"]}
              multiline
              rows={5}
              defaultValue={this.props.norm.description}
              autoAdjustHeight
              onChange={(ev, newValue) => {
                this.props.norm.description = newValue ? newValue : "";
              }}
            />
          </Stack.Item>
          <Stack.Item>
            <Checkbox
              defaultChecked={this.props.norm.active}
              label={this._localizedFields["activate"]}
              onChange={(ev, checked) => {
                this.props.norm.active = checked ? true : false;
              }}
            ></Checkbox>
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }
}

export default withTranslation(["translation", "adminNorms"])(EditNormPanel);
