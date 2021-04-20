import { i18nBase } from "../services/Localization/i18n";
import Language from "./language";

// these must also be included in i18nBase.options.supportedLngs
const supportedLanguages: Map<string, string> = new Map<string, string>();
supportedLanguages.set("en", "English");
supportedLanguages.set("nl", "Nederlands");

export default class UserLanguage extends Language {
  private readonly _fallbackUserLanguage = "en"; // must match with i18nBase.options.fallbackLng
  private readonly _fallbackUserLanguageWithCulture = "en-EN";

  codeWithCulture: string;

  constructor(code: string) {
    super();

    // 1. when code is empty, set language to fallback language
    // 2. set language to full supported language when length > 2 and match is found
    // 3. set language to best fit based on language code only
    // 4. set language to fallback language

    if (!code || code.length < 2) {
      this.codeWithCulture = this._fallbackUserLanguageWithCulture;
      this.code = this._fallbackUserLanguage;
    } else {
      if (this.hasFullSupport(code)) {
        this.codeWithCulture = code;
        this.code = this.getLanguageCode(code);
      } else if (this.hasLanguageSupport(code)) {
        this.codeWithCulture = this.getBest(code);
        this.code = this.getLanguageCode(code);
      } else {
        this.codeWithCulture = this._fallbackUserLanguageWithCulture;
        this.code = this._fallbackUserLanguage;
      }
    }

    this.name = supportedLanguages.get(this.code) as string;
  }

  getLanguageCode(language: string): string {
    // return the language without culture
    if (!language || language.length < 2) {
      language = this._fallbackUserLanguage;
    }
    if (language.length > 2) {
      return language.substr(0, 2);
    }
    return language;
  }

  static getSupportedLanguages(): Map<string, string> {
    return supportedLanguages;
  }

  getSupportedFullLanguages(): string[] {
    return (i18nBase.options.supportedLngs as string[]) || [this._fallbackUserLanguage];
  }

  getFallBack(): string {
    return this._fallbackUserLanguage;
  }

  getBest(languageCode: string): string {
    // returns the first supported language with culture based on the code
    // 2-letter languages must be at the end of the array
    const lngs = this.getSupportedFullLanguages();

    for (let lng of lngs) {
      if (this.getLanguageCode(lng) === languageCode) {
        return lng;
      }
    }

    return this._fallbackUserLanguageWithCulture;
  }

  hasFullSupport(code: string): boolean {
    //returns true when the full code - language and culture - are configured on the localization service
    if (!code || code.length < 5) {
      return false;
    }
    const lngs = this.getSupportedFullLanguages();
    return lngs.indexOf(code) >= 0;
  }

  hasLanguageSupport(languageCode: string): boolean {
    //returns true when the language part of the code (languageCode) is supported
    return supportedLanguages.has(languageCode);
  }
}
