import type { TranslationDictionary } from '../types';

export const es: TranslationDictionary = {
  // Encabezado
  'header.badge': 'RYB / RGB',
  'header.lang_es': 'ES',
  'header.lang_en': 'EN',

  // Modos de armonía (Tooltips)
  'mode.mono': 'Monocromático',
  'mode.adjacent': 'Adyacente / Análogo',
  'mode.triad': 'Tríada',
  'mode.tetrad': 'Tétrada (4 colores)',
  'mode.freeform': 'Modo Libre (Free-style)',

  // Título dinámico de modo
  'mode_display.mono': 'Monocromático (1 color)',
  'mode_display.mono_comp': 'Monocromático (2 colores)',
  'mode_display.adjacent': 'Colores Adyacentes (3 colores)',
  'mode_display.adjacent_comp': 'Colores Adyacentes (4 colores)',
  'mode_display.triad': 'Tríada (3 colores)',
  'mode_display.triad_comp': 'Tríada (4 colores)',
  'mode_display.tetrad': 'Tétrada (4 colores)',
  'mode_display.freeform': 'Modo Libre (4 colores personalizados)',

  // Controles de barra lateral
  'control.add_complementary': 'añadir complementario',
  'control.add_comp_title': 'Añadir color complementario artístico (+180° en rueda RYB)',
  'control.primary_hue': 'Matiz Primario (Hue)',
  'control.angular_distance': 'Distancia Angular (Dist)',
  'control.base_color': 'Color Base (HEX / RGB)',
  'control.fine_tune_btn': 'Fine tune...',
  'control.fine_tune_title': 'Mostrar u ocultar panel de micro-ajustes Fine Tune',
  'control.tab_colors': 'COLORES',
  'control.tab_presets': 'PRESETS',
  'control.spectral_btn': 'Ajuste Espectral',
  'control.spectral_title': 'Ajuste Espectral: Calibración perceptual fotópica de luminancia (sin tonos chillantes) vs sRGB Digital estándar',

  // Panel Fine Tune Integrado
  'fine_tune.title': 'Palette Fine Tune (En Vivo)',
  'fine_tune.close_title': 'Cerrar panel Fine Tune',
  'fine_tune.hue': 'Matiz (Hue)',
  'fine_tune.saturation': 'Saturación',
  'fine_tune.brightness': 'Brillo / Luz',
  'fine_tune.contrast': 'Contraste',

  // Barra Inferior de la Rueda
  'footer_bar.my_palette': 'Mi Paleta:',
  'footer_bar.reset_dome': 'Reset Domo',
  'footer_bar.reset_dome_title': 'Restablecer selector al centro del domo',
  'footer_bar.vision_label': '👁 Visión:',

  // Simulador de Daltonismo
  'vision.normal': 'Normal',
  'vision.protanopia': 'Protanopia (Sin rojo)',
  'vision.deuteranopia': 'Deuteranopia (Sin verde)',
  'vision.tritanopia': 'Tritanopia (Sin azul)',
  'vision.achromatopsia': 'Acromatopsia (Escala de grises)',

  // Botones de Acción
  'action.share': '🔗 Share',
  'action.share_title': 'Copiar enlace permanente de esta paleta',
  'action.mixer': '🎨 Mixer',
  'action.mixer_title': 'Abrir simulador de mezcla física sustractiva de pintura',
  'action.extractor': '🖼 Extractor',
  'action.extractor_title': 'Extraer paleta y armonías a partir de una fotografía',
  'action.preview': 'Preview',
  'action.preview_title': 'Ver combinaciones de color y accesibilidad WCAG',
  'action.examples': 'Examples...',
  'action.examples_title': 'Ver maqueta de interfaz de usuario en vivo',
  'action.export': 'Tables / Export...',
  'action.export_title': 'Descargar paleta en HTML, CSS, LESS, SASS, XML, TXT, ASE o GPL',

  // Modal de Exportación
  'export.title': 'Tablas de Color & Exportación',
  'export.close_title': 'Cerrar modal de exportación',
  'export.download_files': 'Descargar Archivos',
  'export.btn_text': 'Texto (.txt)',
  'export.swatches': 'Muestras Swatches',

  // Modal de Preview & Contraste
  'preview.title': 'Previsualización de Paleta & Combinaciones',
  'preview.close_title': 'Cerrar modal de previsualización',
  'preview.clusters_heading': 'Familias Cromáticas Activas & Muestras',
  'preview.contrast_heading': 'Combinaciones de Color & Matriz de Contraste (WCAG AA/AAA)',
  'preview.wcag_info_toggle': '¿Qué es el contraste WCAG AA / AAA?',
  'preview.wcag_intro': 'Las directrices WCAG 2.1 (Web Content Accessibility Guidelines) miden la relación de luminancia relativa entre un texto y su color de fondo:',
  'preview.wcag_aaa_desc': 'Máxima accesibilidad. Legible para cualquier persona, incluidas personas con baja visión o bajo reflejos intensos de pantalla.',
  'preview.wcag_aa_desc': 'Nivel mínimo recomendado por la normativa web para texto regular en aplicaciones e interfaces de usuario.',
  'preview.wcag_fail_desc': 'Contraste insuficiente. El texto no se diferencia claramente del fondo y dificulta o impide la lectura.',
  'preview.filter_title': 'Filtrar combinaciones:',
  'preview.filter_all': 'Todos',
  'preview.filter_aaa': 'Pasan AAA',
  'preview.filter_aa': 'Pasan AA',
  'preview.filter_fail': 'Fallan',
  'preview.sample_headline': 'Aa Bb 123',

  // Modal Examples
  'examples.title': 'Previsualización de Interfaz en Vivo',
  'examples.close_title': 'Cerrar ejemplos',
  'examples.heading': 'Sistema de Diseño Chroma',
  'examples.btn_cta': 'Botón Acción CTA',
  'examples.card_title': 'Tarjeta de Componente Armónico',
  'examples.card_desc': 'Esta es una muestra interactiva donde los colores calculados en el espacio sustractivo RYB se aplican a elementos reales de interfaz.',
  'examples.accent_box': 'Caja de Acento',

  // Modal Mezclador de Pintura
  'mixer.title': '🎨 Simulador de Mezcla Sustractiva de Pintura Física',
  'mixer.close_title': 'Cerrar simulador de pintura',
  'mixer.tubes_header': 'Tubos y Gotas de Pigmento',
  'mixer.clear_well': '↺ Limpiar',
  'mixer.clear_well_title': 'Limpiar pocillo de mezcla',
  'mixer.active_palette': 'Pigmentos de la Paleta Activa',
  'mixer.classic_paints': 'Tubos de Bellas Artes (RYB + B/N)',
  'mixer.well_title': 'Pocillo de Mezcla en Vivo',
  'mixer.total_drops': 'gotas',
  'mixer.total_drop_single': 'gota',
  'mixer.recipe': 'Composición de la Mezcla',
  'mixer.empty_well': 'Agrega gotas de pigmento con los botones (+) para mezclar.',
  'mixer.apply_wheel': '✨ Aplicar como Color Base en la Rueda',

  // Modal Extractor de Imagen
  'extractor.title': '🖼 Extractor de Paleta & Armonías desde Imagen',
  'extractor.close_title': 'Cerrar extractor de imagen',
  'extractor.drag_drop_title': 'Arrastra una imagen aquí o',
  'extractor.click_select': 'haz clic para explorar',
  'extractor.drag_drop_sub': 'Soporta PNG, JPG, WebP o SVG',
  'extractor.color_resolution': 'Cantidad de colores:',
  'extractor.dominant_title': 'Colores Dominantes Cuantizados',
  'extractor.empty_hint': 'Sube una imagen para extraer su paleta de color.',
  'extractor.detected_badge': 'Armonía RYB Detectada',
  'extractor.apply_harmony': '✨ Aplicar Armonía a la Rueda',
  'extractor.mode_mono_name': 'Monocromático',
  'extractor.mode_mono_desc': 'Los colores dominantes se concentran en una gama tonal cerrada dentro del mismo cuadrante RYB.',
  'extractor.mode_adjacent_name': 'Adyacente / Análogo',
  'extractor.mode_adjacent_desc': 'Los colores dominantes forman una transición fluida en un arco de hasta 90° en la rueda artística RYB.',
  'extractor.mode_triad_name': 'Tríada Equilibrada',
  'extractor.mode_triad_desc': 'Los tonos principales se distribuyen en tres polos equidistantes (~120° en el círculo tradicional RYB).',
  'extractor.mode_tetrad_name': 'Tétrada / Doble Complementario',
  'extractor.mode_tetrad_desc': 'La imagen presenta un alto dinamismo cromático con tonos opuestos en ejes complementarios de 180°.',
  'extractor.mode_freeform_name': 'Libre / Free-style',
  'extractor.mode_freeform_desc': 'Distribución personalizada sin restricciones de eje geométrico estricto.',
  'extractor.suggested_hue': 'Matiz primario sugerido:',

  // Roles de Clusters
  'cluster.primary': 'Primario',
  'cluster.secondary1': 'Secundario #1',
  'cluster.secondary2': 'Secundario #2',
  'cluster.complementary': 'Complementario',
  'cluster.tone': 'Tono #{index}',

  // Notificaciones Toast y Avisos
  'toast.link_copied': '🔗 ¡Enlace permanente de la paleta copiado al portapapeles!',
  'toast.dome_reset': '↺ Selector del domo restablecido al centro',
  'toast.spectral_on': '✨ Ajuste Espectral Activado: Calibración perceptual fotópica de luminancia',
  'toast.spectral_off': '⚙️ Ajuste Espectral Desactivado: Modo digital sRGB estándar',
  'toast.mixed_applied': '✨ ¡Color mezclado aplicado como nuevo tono base!',
  'toast.image_harmony_applied': '✨ ¡Armonía {mode} extraída de la imagen aplicada a la rueda!',
  'toast.preset_applied': '✨ Preset aplicado: {name}',
  'toast.file_downloaded': '📥 Archivo {filename} descargado',
  'toast.well_cleared': 'Pocillo de pintura limpiado',
  'toast.copied': '¡Copiado: {text}!',
  'toast.valid_image': 'Por favor sube un archivo de imagen válido',

  // Pie de página (Footer)
  'footer.created_by': 'Creado con pasión por',
  'footer.author_name': 'Elbert',
  'footer.icons_designed_by': 'Iconos diseñados por',
  'footer.icons_from': 'desde'
};
