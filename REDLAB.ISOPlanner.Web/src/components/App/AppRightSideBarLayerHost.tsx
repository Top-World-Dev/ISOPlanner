import { LayerHost, mergeStyles } from "@fluentui/react";

const layerHostClassRightSideBar = mergeStyles({
  position: "fixed",
  width: 0,
  height: "calc(100% - 48px)",
  overflow: "visible",
  zIndex: 800
});

export default function AppRightSideBarLayerHost() {
  return (
    <LayerHost
      id="layerHostRightSideBar"
      className={layerHostClassRightSideBar}
    ></LayerHost>
  );
}
