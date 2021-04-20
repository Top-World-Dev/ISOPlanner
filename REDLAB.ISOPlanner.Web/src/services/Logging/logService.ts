import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import Config from "../Config/configService";
import AppError from "../../utils/appError";

function init() {
  Sentry.init({
    dsn: Config.get("Log.SentryDSN"),
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: Config.get("Log.SentrySampleRate"),
    environment: Config.getAppEnv()
  });
}

function info(msg: string): void {
  if (Config.get("Log.Level") === "error") {
    return;
  }
  console.info(msg);
  //Sentry.captureMessage(msg, Sentry.Severity.Info);
}

function error(err: AppError | undefined): void {
  console.error(err);
  Sentry.captureException(err);
}

function debug(msg: string, payload?: any): void {
  if (Config.get("Log.Level") !== "debug") {
    return;
  }
  console.debug(msg, payload);
  //Sentry.captureMessage(msg, Sentry.Severity.Debug);
}

const logService = { init, info, debug, error };

export default logService;
