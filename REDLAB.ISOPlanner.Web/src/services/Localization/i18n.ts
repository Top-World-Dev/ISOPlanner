import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import Config from "../Config/configService";

export const i18nBase = i18n;

function init() {

  i18n
    // Enables the i18next backend
    .use(Backend)
    // Enables the hook initialization module
    .use(initReactI18next)
    // Enable automatic language detection
    .use(LanguageDetector)

    .init({
      // Allowed languages
      // Make sure the supported 2-letter languages are also in this list for when the user overrides the Microsoft account setting
      // 2-letter languages must be at the end of the array
      supportedLngs: ["nl-NL", "en-EN", "en-GB", "en-US", "en", "nl"],
      // Standard language used
      load: "all",
      preload: ["en"],
      fallbackLng: "en",
      debug: Config.isDev(),
      //Detects and caches a cookie from the language provided
      detection: {
        order: ['cookie', 'localStorage', 'htmlTag'],
        caches: ['cookie', 'localStorage'],
        cookieMinutes: 86400 * Config.get("Cookies.MaxAgeDays"),
        cookieOptions: { path: '/' }
      },
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: `${Config.getAppURL()}/locales/{{lng}}/{{ns}}.json`,
      },
    });
}

const localizationService = { init };

export default localizationService;
