import * as React from "react";
import AppContext from "../App/AppContext";
import { ProgressIndicator, Layer } from "@fluentui/react";

const progressBarStyles = {
  root: {
    paddingTop: 0 
  },
  itemProgress : { 
    paddingTop: 0 
  } 
}

class ContentLoader extends React.Component {
  static contextType = AppContext;

  render() {
    if (this.context.isContentLoading) {
      return (
        <Layer hostId="layerHostContentAreaTop">
          <ProgressIndicator barHeight={3} styles={progressBarStyles}></ProgressIndicator>
        </Layer>
      );
    } else {
      return null;
    }
  }
}

export default ContentLoader;
