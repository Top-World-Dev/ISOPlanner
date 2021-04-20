class Config {

  static appURL: string | undefined;
  static appVersion: string = "1.2.0";

  getVersion(): string {
    return Config.appVersion;
  }
  
  // the REACT_APP_STAGE environment variable is injected into the build in package.json in the scripts section

  isLocal(): boolean {
    return process.env.REACT_APP_STAGE?.trimEnd() === "local";    // local front-end and local API
  }

  isDev(): boolean {
    return process.env.REACT_APP_STAGE?.trimEnd() === "development"; // production build in development mode in Azure
  }

  isTest(): boolean {
    return process.env.REACT_APP_STAGE?.trimEnd() === "test"; // run testing
  }

  isProd(): boolean {
    return process.env.REACT_APP_STAGE?.trimEnd() === "production"; // production build in production mode in Azure
  }

  isFront(): boolean {
    return process.env.REACT_APP_STAGE?.trimEnd() === "front"; // local front-end and development back-end in Azure
  }

  getAppEnv(): string {
    return process.env.REACT_APP_STAGE ? process.env.REACT_APP_STAGE?.trimEnd() : "unknown";
  }

  getAppURL(): string {

    if (Config.appURL === undefined) {
      Config.appURL = document.location.protocol + '//' + document.location.host;
      if (Config.appURL.endsWith("/")) { 
        Config.appURL = Config.appURL.slice(0, -1) ;
      }
    }

    return Config.appURL;
  }

  getImageURL(): string {
    return this.getAppURL() + '/images';
  }

  get(name: string): any {

    if (this.isProd()) {
      return this.getProd(name);
    }

    if (this.isTest()) {
      return this.getTest(name);
    }

    if (this.isDev() || this.isFront()) {
      return this.getDev(name);
    }

    if (this.isLocal()) {
      return this.getLocal(name);
    }

    throw new Error(`Unknown environment: ${this.getAppEnv()}`);
  }

  getLocal(name: string): any {
    switch (name) {
      case "Log.Level":
        return "debug";
      case "Log.SentryDSN":
        return "https://e2a553116e474ea48e6c2a500475f886@o517261.ingest.sentry.io/5624815";
      case "Log.SentrySampleRate":
          return 1;
      case "Cookies.MaxAgeDays":
        return 30;
      case "App.ClientId":
        return "bc5e2cfd-a5b7-4f96-814e-1a61561e9309";
      case "Auth.CacheLocation":
        return "localStorage";
      case "Api.BaseURL":
        return "https://localhost:44377";
      case "Api.ClientId":
        return "31991075-3bb4-433c-bca5-5b9129e7aeda";
      default:
        throw new Error(`Value of dev appsetting ${name} not defined.`);
    }
  }

  getDev(name: string): any {
    switch (name) {
      case "Log.Level":
        return "debug";
      case "Log.SentryDSN":
        return "https://e2a553116e474ea48e6c2a500475f886@o517261.ingest.sentry.io/5624815";
      case "Log.SentrySampleRate":
          return 1;
      case "Cookies.MaxAgeDays":
        return 30;
      case "App.ClientId":
        return "bc5e2cfd-a5b7-4f96-814e-1a61561e9309";
      case "Auth.CacheLocation":
        return "localStorage";
      case "Api.BaseURL":
        return "https://redlab-ip-dev-api.azurewebsites.net";
      case "Api.ClientId":
        return "31991075-3bb4-433c-bca5-5b9129e7aeda";
      default:
        throw new Error(`Value of dev appsetting ${name} not defined.`);
    }
  }

  getTest(name: string): any {
    switch (name) {
      case "Log.Level":
        return "info";
      case "Log.SentryDSN":
        return "https://e2a553116e474ea48e6c2a500475f886@o517261.ingest.sentry.io/5624815";
      case "Log.SentrySampleRate":
        return 0;
      case "Cookies.MaxAgeDays":
        return 30;
      case "App.ClientId":
        return "bb5db5ea-acea-4c03-8749-25b33e387a65";
      case "Auth.CacheLocation":
        return "sessionStorage";
      case "Api.BaseURL":
        return "https://redlab-ip-test-api.azurewebsites.net";
      case "Api.ClientId":
        return "70db3e97-f4c1-445b-8713-e671f3c7d59f";
      default:
        throw new Error(`Value of test appsetting ${name} not defined.`);
    }
  }

  getProd(name: string): any {
    switch (name) {
      case "Log.Level":
        return "error";
      case "Log.SentryDSN":
        return "https://e2a553116e474ea48e6c2a500475f886@o517261.ingest.sentry.io/5624815";
      case "Log.SentrySampleRate":
        return 0;
      case "Cookies.MaxAgeDays":
        return 30;
      case "App.ClientId":
        return "e5996169-d700-4c29-9e39-728fad0d9204";
      case "Auth.CacheLocation":
        return "sessionStorage";
      case "Api.BaseURL":
        return "https://redlab-ip-prod-api.azurewebsites.net";
      case "Api.ClientId":
        return "dd5b5352-8e5b-4e18-82b5-b51b4e26a4c9";
      default:
        throw new Error(`Value of prod appsetting ${name} not defined.`);
    }
  }
}

export default new Config();
