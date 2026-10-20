/**
 * Tipos e interfaces del subsistema de internacionalización (i18n) de Chroma.
 */

export type SupportedLanguage = 'es' | 'en';

export interface TranslationDictionary {
  readonly [key: string]: string;
}
