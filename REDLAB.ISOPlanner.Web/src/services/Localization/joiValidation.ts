import { nlErrors, enErrors } from './joiCustomErrors';
import { i18nBase } from "./i18n";
import Joi from 'joi';

const nlMessages: Joi.LanguageMessages = { ...nlErrors }
const enMessages: Joi.LanguageMessages = { ...enErrors }

export const getLocalizedMessageOptions = (): Joi.ValidationOptions => {

    switch (i18nBase.language.substr(0, 2)) {
        case "nl": 
            return { messages: nlMessages }
        default: 
            return { messages: enMessages }
    }
}
