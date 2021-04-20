import { LayerHost, mergeStyles } from "@fluentui/react";

const layerHostClassContentAreaTop = mergeStyles({
  position: "relative",
  width: "100%",
  height: 0,
  overflow: "visible",
  zIndex: 900
});

export default function AppRightSideBarLayerHost() {
  return <LayerHost id="layerHostContentAreaTop" className={layerHostClassContentAreaTop}></LayerHost>;
}
