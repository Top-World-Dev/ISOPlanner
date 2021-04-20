import Norm_TranslationDTO from './norm_TranslationDTO';

export default class NormDTO {

    normId: string;
    logo?: string;
    active: boolean;
    isoNormId?: number;
    trans?: Array<Norm_TranslationDTO>;

    constructor() {

        this.normId = "";
        this.active = false;
    }
}

