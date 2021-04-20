import Norm_Translation from "./norm_Translation";
import Joi from "joi";
import { getLocalizedMessageOptions } from "../services/Localization/joiValidation";
import { deepClone } from "../utils/object";

export default class Norm {
  normId: string;
  logo?: string;
  active: boolean;
  isoNormId?: number;
  trans?: Array<Norm_Translation>;
  transIdx: number;

  //translation properties are flattened on the main class for the current language of the user
  name: string;
  description?: string;

  constructor() {
    this.normId = "";
    this.active = false;
    this.name = "";
    this.transIdx = -1;
  }

  getTransIdx(langCode: string, defLangCode: string): number {
    if (this.trans) {
      //find requested language
      for (let i = 0; i < this.trans.length; i++) {
        let t: Norm_Translation = this.trans[i];
        if (t.lang?.code === langCode) {
          return i;
        }
      }

      //if not found, find the default language
      for (let i = 0; i < this.trans.length; i++) {
        let t: Norm_Translation = this.trans[i];
        if (t.lang?.code === defLangCode) {
          return i;
        }
      }
    }

    return -1;
  }

  getLanguages(): string[] {
    const languages: string[] = [];

    if (this.trans) {
      for (let i = 0; i < this.trans.length; i++) {
        let t: Norm_Translation = this.trans[i];
        if (t.lang) {
          languages.push(t.lang.code);
        }
      }
    }

    return languages;
  }

  clone(): Norm {
    return deepClone<Norm>(this);
  }

  // Validate function that validates the contents of the fields that have user input and can be written to the database
  // - Set abortEarly=false to make sure all errors are returned for the class
  // - Use getLocalizedMessageOptions() from the Localization service to get localized error messages
  // - The localizedFields array must be used to give each field in the error message a localized label
  validate(localizedFields: Record<string, string>): Joi.ValidationResult {
    const schema: Joi.ObjectSchema = Joi.object({
      name: Joi.string().max(512).required().label(localizedFields["name"])
    }).prefs(getLocalizedMessageOptions());

    return schema.validate({ name: this.name }, { abortEarly: false });
  }
}
