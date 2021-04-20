import LanguageDTO from './languageDTO';

export default class Norm_TranslationDTO {

    name: string;
    description?: string;
    lang?: LanguageDTO;

    constructor() {
        this.name = "";
    }
}
