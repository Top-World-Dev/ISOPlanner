import React, { Suspense } from "react";
import ReactDOM from "react-dom";
//import reportWebVitals from "./reportWebVitals";
import { initializeIcons } from "@fluentui/react";
import logService from "./services/Logging/logService";
//import Config from "./services/Config/configService";
import App from "./components/App/App";
import AppLoader from "./components/Loading/AppLoader";
import localizationService from "./services/Localization/i18n";
import "./index.css";

logService.init();
localizationService.init();

initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<AppLoader isLoading={true}/>}>
      <App />
    </Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);

// if (!Config.isProd()) {
//   reportWebVitals(console.log);
// }

