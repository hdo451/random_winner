# AZAR

Aplicación web estática para sortear nombres extraídos desde imágenes o números dentro de un rango.

## Ejecutar localmente

```bash
npm install
npm run dev
```

El OCR se procesa en el navegador con Tesseract.js. Las imágenes no se suben a ningún servidor.

## Publicar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub usando la rama `main`.
2. En **Settings > Pages**, selecciona **GitHub Actions** como fuente.
3. Cada push a `main` ejecutará el workflow de `.github/workflows/deploy.yml` y publicará la carpeta `dist`.
