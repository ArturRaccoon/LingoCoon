export interface LexicoonExample {
  sentence: string;
  translation: string;
}

export interface LexicoonMeaning {
  antonyms: string[];
  definition: string;
  examples: LexicoonExample[];
  partOfSpeech: string;
  synonyms: string[];
  translation: string;
  usageNote: string | null;
}

export interface LexicoonContrast {
  explanation: string;
  label: string;
  word: string;
}

export interface LexicoonUsage {
  spoken: string;
  written: string;
}

export interface LexicoonCorrection {
  from: string;
  to: string;
}

export interface LexicoonEntry {
  category: string;
  collocations: string[];
  connotation: string;
  contrast: LexicoonContrast | null;
  correction: LexicoonCorrection | null;
  curiosity: string | null;
  essence: string;
  explanation: string;
  language: string;
  languageCode: string;
  meanings: LexicoonMeaning[];
  pronunciation: string | null;
  register: string;
  synonyms: string[];
  usage: LexicoonUsage | null;
  word: string;
}
