import * as React from "react";
import { Pivot, PivotItem, IPivotStyles } from "@fluentui/react";
import { useHistory } from "react-router-dom";

export interface IPivotItemProps {
  key: string;
  text: string;
  url: string;
}

export interface IScenePivotProps {
  baseURL: string;
  items: IPivotItemProps[];
  selectedKey: string;
}

const ScenePivot: React.FunctionComponent<IScenePivotProps> = (props: IScenePivotProps) => {
  const history = useHistory();

  const handleLinkClick = (item: PivotItem | undefined) => {
    if (item && item.props.itemKey) {
      const pivot = props.items.find((i) => i.key === item.props.itemKey);
      if (pivot) {
        var url: string = props.baseURL + pivot.url;
        history.push(url);
      }
    }
  };

  const pivotStyles: Partial<IPivotStyles> = {
    root: {
      paddingLeft: 70,
      paddingRight: 70,
    },
  };

  return (
    <Pivot onLinkClick={handleLinkClick} headersOnly={true} styles={pivotStyles} selectedKey={props.selectedKey}>
      {props.items.map((pivot) => {
        return <PivotItem headerText={pivot.text} itemKey={pivot.key} />;
      })}
    </Pivot>
  );
};

export default ScenePivot;
