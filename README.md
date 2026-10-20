# 🎨 Chroma: Precision Color Wheel & Art-Theory Palette Studio

> **Chroma** es una aplicación web profesional de teoría del color y diseño de paletas armónicas, construida desde cero con tipado estricto en **TypeScript** y diseño modular.
>
> Integra una rueda concéntrica dual a 60 FPS en HTML5 Canvas con el círculo cromático artístico tradicional **RYB** (Itten / Goethe), calibración espectral con atenuación fotópica de luminancia, cinemática de proyección esférica 3D para el domo polar de matices, cálculo de contraste de accesibilidad **WCAG 2.1 (AA / AAA)**, simulador de mezcla física sustractiva de pigmentos, extractor de paletas desde imágenes y exportación a 8 formatos de la industria.

---

## 🌟 Características Principales

### 1. Rueda Concéntrica Dual a 60 FPS (Canvas 2D)
- **Anillo Exterior RYB Continuo:** 64 sectores angulares calibrados con solape subpíxel milimétrico para erradicar costuras oscuras y franjas de moiré.
- **Ajuste Espectral (Atenuación Fotópica de Luminancia):** Calibración perceptual que atenúa las anclas de verde, cian y azul para prevenir colores deslumbrantes o chillantes, replicando el equilibrio visual de los pigmentos al óleo tradicionales.
- **Domo Interior Polar 2D:** Gradiente tridimensional que modula saturación y luminosidad.
- **Cinemática Esférica 3D:** El cluster de 5 variantes (Base, Tinte, Brillante, Sombra y Tono) se proyecta ortográficamente desde una semiesfera 3D rotada en $Z$ a $45^\circ$, generando curvaturas orgánicas que se amoldan fluidamente al contorno del domo sin atravesar el perímetro.
- **Botón `↺ Reset Dome`:** Restablece en un clic el selector al centro neutro exacto ($S=50\%$, $L=50\%$, contraste $= 1.0$).
- **Apertura Angular Continua ($5^\circ$ a $175^\circ$):** Permite recorrer con fluidez desde adyacentes mínimos hasta extremos casi opuestos, impidiendo el colapso a $0^\circ$ (colores idénticos) y a $180^\circ$ (colapso con el complementario).

### 2. Esquemas Armónicos Clásicos y Modo Free-style
- **Monocromático:** 1 familia tonal (o 2 si se añade complementario artístico).
- **Adyacente / Análogo:** 3 familias tonales (o 4 con complementario).
- **Tríada:** 3 familias tonales equitativas (o 4 con complementario).
- **Tétrada (4 colores):** 4 familias tonales con dos ejes complementarios a $180^\circ$ en RYB.
- **Free-style (Engranajes):** Inicializa en tétrada y desacopla completamente las restricciones geométricas, permitiendo arrastrar individualmente cada nodo a cualquier grado de la rueda. Al volver a otro modo, se restauran las reglas geométricas.
- **Toggle "Add Complementary":** Conmutador reactivo que actualiza en tiempo real los iconos vectoriales SVG de los modos.

### 3. Paleta Viva y Catálogo de Presets
- **Tira "My Palette" y Cuadrantes 2x2:** Hasta 20 muestras simultáneas (Base, Tinte, Brillante, Sombra y Tono para cada familia activa) con sus valores HEX, RGB y HSL.
- **Pestaña Presets Sincronizada:** Catálogo visual (Default, Pastel, Shiny, Warm, Fresh, Dark, Pale, etc.) adaptado en tiempo real al número de familias activas sin barras de desplazamiento interno innecesarias.
- **Panel Fine Tune en Vivo:** Ajustes incrementales de micro-calibración (`[-10]`, `[-5]`, `[-1]`, `[+1]`, `[+5]`, `[+10]`) para Matiz, Saturación, Luminosidad y Contraste, situado en la parte inferior del círculo cromático sin desenfocar el lienzo.

### 4. Diagnóstico de Accesibilidad y Diagnóstico de Visión
- **Color Combinations & Contrast Matrix:** Matriz de combinaciones de fondo y texto evaluadas según la especificación matemática de **WCAG 2.1**.
  - **AAA (Óptimo, ratio $\ge 7.0:1$):** Lectura nítida bajo cualquier condición.
  - **AA (Estándar, ratio $\ge 4.5:1$):** Nivel mínimo legal y comercial recomendado para interfaces.
  - **Fail (Insuficiente, ratio $< 4.5:1$):** Contraste inadecuado.
- **Explicación Colapsable y Filtros Multi-Criterio:** Bloque desplegable explicativo y chips interactivos (`AAA`, `AA`, `Fail` y `Todos`) con conteos en vivo para filtrar la matriz al instante.
- **Simulador de Daltonismo:** Previsualización en tiempo real con matrices de simulación espectral para Protanopia, Deuteranopia, Tritanopia y Acromatopsia.

### 5. Características Avanzadas
- **🎨 Simulador de Mezcla Sustractiva de Pintura Física (`paint_mixer.ts`):**
  - Simulación sustractiva en el cubo unitario de 8 vértices Gossett & Chen.
  - Tubos interactivos de la paleta activa + Tubos clásicos de Bellas Artes (*Cadmium Red*, *Cadmium Yellow*, *Ultramarine Blue*, *Titanium White*, *Carbon Black*).
  - Dosificador de gotas con pocillo circular interactivo, textura de pintura fresca y desglose porcentual de la receta.
  - Botón *"✨ Aplicar a la Rueda"* para transferir el color mezclado directamente como base en Chroma.
- **🖼 Extractor de Paletas desde Imágenes (`image_palette_extractor.ts`):**
  - Carga mediante arrastrar y soltar (Drag & Drop) de archivos PNG, JPG, WebP y SVG.
  - Algoritmo de cuantización cromática **Median Cut** procesado en cliente en menos de 10 ms.
  - Selector de resolución (4, 6 u 8 colores dominantes).
  - Detección automática del esquema armónico RYB afín y botón *"✨ Aplicar Armonía a la Rueda"*.

### 6. Sistema Universal de Exportación y Permalinks
- **Descargas Directas:**
  - Código Web: **HTML**, **CSS Variables**, **SCSS**, **LESS**, **XML**, **Texto plano (.txt)**.
  - Muestras para Software Gráfico: **Adobe Swatch Exchange (.ASE)** y **GIMP / Krita (.GPL)**.
- **Permalink Compartible (`🔗 Share`):**
  - Hash URL bidireccional reactivo que almacena en el enlace el modo, matiz primario, distancia, saturación, luminosidad, complementario, contraste y calibración espectral sin tocar servidor.

---

## 🛠️ Tecnologías Utilizadas

- **Lenguaje:** TypeScript 5.5+ (Strict Mode)
- **Compilador / Bundler:** Vite 5.4+
- **Motor Gráfico:** HTML5 Canvas API (Renderizado reactivo a 60 FPS)
- **Suite de Pruebas:** Vitest 1.6+
- **Estilos:** CSS3 Modular con Variables Nativas y Flexbox/Grid
- **Zero Dependencias en Runtime:** Todo el motor de cálculo y renderizado es 100% nativo.

---

## 🚀 Instalación y Puesta en Marcha

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/chroma.git
cd chroma

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo en vivo (Vite)
npm run dev

# 4. Ejecutar la suite completa de pruebas unitarias
npm test

# 5. Generar bundle optimizado para producción
npm run build
```

---

## 🧪 Cobertura de Pruebas

El proyecto cuenta con **79 pruebas automatizadas al 100% de aprobación** distribuidas en 13 suites de prueba:

| Módulo de Prueba | Ficheros | Tests | Estado |
| :--- | :--- | :---: | :---: |
| **Motor de Rueda Espectral** | `chroma_wheel_engine.spec.ts` | 3 | ✅ Aprobado |
| **Mapeo Angular RYB / sRGB** | `ryb_hue_mapping.test.ts` | 8 | ✅ Aprobado |
| **Cubo Trilineal Gossett & Chen** | `ryb_cube_interpolation.test.ts` | 12 | ✅ Aprobado |
| **Conversiones sRGB / HSL / HEX** | `color_converters.test.ts` | 7 | ✅ Aprobado |
| **Value Object Color** | `Color.test.ts` | 7 | ✅ Aprobado |
| **Value Object ColorCluster** | `ColorCluster.test.ts` | 3 | ✅ Aprobado |
| **Calculador de Armonías RYB** | `harmony_calculator.test.ts` | 9 | ✅ Aprobado |
| **Cinemática Esférica 3D de Domo** | `spherical_point_follower.test.ts` | 3 | ✅ Aprobado |
| **Catálogo de Presets Tonales** | `preset_catalog.test.ts` | 2 | ✅ Aprobado |
| **Serialización Permalink URL** | `palette_url_serializer.test.ts` | 5 | ✅ Aprobado |
| **Motor de Mezcla de Pintura** | `paint_mixer.test.ts` | 7 | ✅ Aprobado |
| **Extractor y Cuantizador de Imágenes** | `image_palette_extractor.test.ts` | 8 | ✅ Aprobado |
| **Flujos Integrados End-to-End** | `full_workflow.test.ts` | 5 | ✅ Aprobado |
| **TOTAL** | **13 Suites** | **79 Tests** | **100% Passing** |

---

## 📄 Licencia y Atribución

"Chroma implements photopic luminance attenuation on the RYB color wheel, inspired by the pioneering color harmony research of Petr Staníček (Paletton / Color Scheme Designer) and classical Itten color theory."

Distribuido bajo la **Licencia MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
