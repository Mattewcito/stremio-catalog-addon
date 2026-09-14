/**
 * catalog.js — Enrutador de catálogos.
 * Recibe el ID del catálogo (ej: "tmdb.trending.movie") y delega a la fuente correcta.
 */

const { fetchTMDBCatalog } = require('./sources/tmdb');

/**
 * Parsea el ID del catálogo y busca los metas correspondientes.
 *
 * @param {object} config     — config completa del usuario
 * @param {string} stremioType — 'movie' | 'series' (viene de la URL de Stremio)
 * @param {string} catalogId   — 'tmdb.trending.movie' (fuente.categoría.tipo)
 */
async function fetchCatalog(config, stremioType, catalogId) {
  const parts = catalogId.split('.');
  if (parts.length < 3) throw new Error(`ID de catálogo inválido: ${catalogId}`);

  const [source, category, type] = parts;

  switch (source) {
    case 'tmdb': {
      const apiKey = config.sources?.tmdb?.apiKey;
      const language = config.language || 'es-MX';
      return fetchTMDBCatalog({ category, type, language, apiKey });
    }

    default:
      throw new Error(`Fuente desconocida: ${source}`);
  }
}

module.exports = { fetchCatalog };
