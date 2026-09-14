/**
 * manifest.js — Genera el manifest de Stremio a partir de la config del usuario.
 * Solo se incluyen los catálogos que el usuario habilitó, en el orden que eligió.
 */

function buildManifest(config, baseUrl) {
  const enabled = (config.catalogs || []).filter(c => c.enabled);

  const catalogs = enabled.map(cat => ({
    type: cat.type === 'series' ? 'series' : 'movie',
    id: `${cat.source}.${cat.category}.${cat.type}`,
    name: cat.name
  }));

  const types = [...new Set(enabled.map(c => c.type === 'series' ? 'series' : 'movie'))];

  return {
    id: 'community.stremio.mi-catalogo',
    version: '1.0.0',
    name: '🎬 Mi Catálogo',
    description: 'Tu catálogo personalizable de Stremio. Organizá tus fuentes, idioma y orden.',
    logo: `${baseUrl}/logo.png`,
    resources: ['catalog'],
    types: types.length ? types : ['movie', 'series'],
    catalogs,
    behaviorHints: {
      configurable: true,
      configurationURL: `${baseUrl}/configure`
    }
  };
}

module.exports = { buildManifest };
