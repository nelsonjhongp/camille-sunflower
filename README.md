# Carta celestial para Camille

Experiencia web estática, mobile-first, creada con HTML, CSS, JavaScript y SVG.

## Estructura

- `index.html`: contenido y SVG de la experiencia.
- `styles.css`: diseño, temas y animaciones.
- `script.js`: interacciones, audio y persistencia del tema.
- `assets/audio`: música y efectos de sonido en OGG/MP3.
- `assets/fonts`: tipografías locales.
- `assets/images`: retrato y galería de ilustraciones.
- `scripts/build.ps1`: genera una copia limpia y publicable en `dist`.
- `dist`: salida configurada para publicación; no se edita manualmente.

## Desarrollo local

Sirve la raíz del proyecto con cualquier servidor estático. Por ejemplo:

```powershell
python -m http.server 4173
```

## Generar la versión publicable

Desde PowerShell:

```powershell
.\scripts\build.ps1
```

El script reemplaza `dist` con `index.html`, `styles.css`, `script.js` y `assets`.
