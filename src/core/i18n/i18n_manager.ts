/**
 * Gestor de Internacionalización (i18n) de Chroma.
 *
 * Soporta cambio dinámico reactivo entre Español (ES) e Inglés (EN),
 * persistencia en localStorage y actualización automática de atributos DOM
 * [data-i18n], [data-i18n-title] y [data-i18n-placeholder].
 */

import { en } from './locales/en';
import { es } from './locales/es';
import type { SupportedLanguage, TranslationDictionary } from './types';

const STORAGE_KEY = 'chroma_language';

class I18nManager {
  private currentLang: SupportedLanguage = 'es';
  private readonly dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
    es,
    en
  };
  private readonly listeners: Set<(lang: SupportedLanguage) => void> = new Set();

  public constructor() {
    this.currentLang = this.detectInitialLanguage();
  }

  /**
   * Detecta el idioma inicial según localStorage o el navegador del usuario.
   */
  private detectInitialLanguage(): SupportedLanguage {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
        if (saved === 'es' || saved === 'en') {
          return saved;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.language) {
        return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
      }
    } catch {
      // Fallback seguro a español
    }
    return 'es';
  }

  /**
   * Obtiene el código del idioma activo ('es' o 'en').
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  /**
   * Traduce una clave al idioma activo con reemplazo opcional de parámetros interpolados {param}.
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const dict = this.dictionaries[this.currentLang];
    let text = dict[key] ?? this.dictionaries.es[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  }

  /**
   * Cambia el idioma activo y actualiza el DOM completo.
   */
  public setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang === lang) {
      return;
    }
    this.currentLang = lang;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch {
      // Silencioso en entornos aislados
    }

    this.updateDomTranslations();
    this.listeners.forEach((listener) => listener(lang));
  }

  /**
   * Suscribe un callback a los cambios de idioma.
   */
  public onLanguageChange(callback: (lang: SupportedLanguage) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Recorre el árbol DOM y actualiza los elementos marcados con atributos de traducción.
   */
  public updateDomTranslations(root?: ParentNode): void {
    if (typeof document === 'undefined') return;
    const targetRoot = root ?? document;

    // 1. Textos directos [data-i18n]
    const textElements = targetRoot.querySelectorAll<HTMLElement>('[data-i18n]');
    textElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // 2. Títulos y Tooltips [data-i18n-title]
    const titleElements = targetRoot.querySelectorAll<HTMLElement>('[data-i18n-title]');
    titleElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // 3. Placeholders [data-i18n-placeholder]
    const placeholderElements = targetRoot.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-i18n-placeholder]'
    );
    placeholderElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });

    // 4. Actualizar botones de selector de idioma en el header
    const btnEs = document.getElementById('btnLangEs');
    const btnEn = document.getElementById('btnLangEn');
    if (btnEs && btnEn) {
      btnEs.classList.toggle('active', this.currentLang === 'es');
      btnEn.classList.toggle('active', this.currentLang === 'en');
    }
  }
}

export const i18n = new I18nManager();
export const t = (key: string, params?: Record<string, string | number>): string =>
  i18n.t(key, params);
