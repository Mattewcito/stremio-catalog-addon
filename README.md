# 🎬 Mi Catálogo — Addon personalizable para Stremio

Addon gratuito y open source que te permite elegir **qué catálogos ver en Stremio, en qué orden y en qué idioma** — sin tocar los addons por defecto que no se pueden desinstalar.

## ✨ Características

- **100% gratuito** — un solo deploy en Vercel sirve a todos los usuarios sin costo
- **Sin cuentas** — la configuración vive en tu URL personal, sin base de datos
- **Multi-usuario** — cada persona genera su propia URL con su configuración
- **Drag & drop** — arrastrá los catálogos para cambiar el orden
- **Multi-idioma** — los metadatos se muestran en el idioma que elijas
- **TV + PC + móvil** — funciona en cualquier dispositivo que tenga tu URL

## 🚀 Deploy en Vercel (gratis)

1. Hacé fork de este repo en GitHub
2. Entrá a [vercel.com](https://vercel.com) y conectá tu cuenta de GitHub
3. Importá el repo → Vercel lo detecta automáticamente
4. ¡Listo! Tu instancia queda en `https://tu-proyecto.vercel.app/configure`

## 🔑 Fuentes soportadas

| Fuente | Requiere | Catálogos disponibles |
|--------|----------|-----------------------|
| TMDB   | API key gratuita | Trending, Popular, Mejor Valoradas (películas y series) |

> La API key de TMDB es gratuita: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

## 🛠 Desarrollo local

```bash
git clone https://github.com/tu-usuario/stremio-catalog-addon
cd stremio-catalog-addon
npm install
npm run dev
# Abrí http://localhost:3000/configure
```

## 📡 Cómo funciona

1. El usuario visita `/configure`, configura sus catálogos y genera su URL personal
2. La URL tiene la configuración codificada: `https://addon.vercel.app/{config}/manifest.json`
3. Stremio instala el addon con esa URL → muestra exactamente los catálogos configurados
4. El servidor es completamente **stateless** — no guarda nada, no necesita base de datos

## 📋 Roadmap

- [x] Fase 1: TMDB (Trending, Popular, Top Rated)
- [ ] Fase 2: IMDB Lists, MDBList
- [ ] Fase 3: Trakt (Watchlist personal con login OAuth)
