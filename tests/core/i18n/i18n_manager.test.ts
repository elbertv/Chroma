import { describe, expect, it } from 'vitest';
import { i18n, t } from '../../../src/core/i18n/i18n_manager';

describe('I18nManager', () => {
  it('debe traducir claves al español y al inglés correctamente', () => {
    i18n.setLanguage('es');
    expect(t('mode.mono')).toBe('Monocromático');
    expect(t('control.tab_colors')).toBe('COLORES');
    expect(t('footer.created_by')).toBe('Creado con pasión por');
    expect(t('footer.icons_designed_by')).toBe('Iconos diseñados por');
    expect(t('footer.icons_from')).toBe('desde');

    i18n.setLanguage('en');
    expect(t('mode.mono')).toBe('Monochromatic');
    expect(t('control.tab_colors')).toBe('COLORS');
    expect(t('footer.created_by')).toBe('Crafted with passion by');
    expect(t('footer.icons_designed_by')).toBe('Icons designed by');
    expect(t('footer.icons_from')).toBe('from');
  });

  it('debe interpolar parámetros dinámicos {param}', () => {
    i18n.setLanguage('es');
    expect(t('toast.preset_applied', { name: 'Pastel' })).toBe('✨ Preset aplicado: Pastel');

    i18n.setLanguage('en');
    expect(t('toast.preset_applied', { name: 'Pastel' })).toBe('✨ Preset applied: Pastel');
  });

  it('debe retornar la clave si la traducción no existe en ningún diccionario', () => {
    expect(t('clave_inexistente_xyz')).toBe('clave_inexistente_xyz');
  });
});
