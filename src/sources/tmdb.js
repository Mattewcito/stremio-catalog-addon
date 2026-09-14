/**
 * tmdb.js — Fuente TMDB para catálogos de Stremio.
 *
 * Retorna IDs de IMDB (tt...) para que los addons de streaming
 * (AIOStreams, Torrentio, etc.) puedan encontrar los streams correctamente.
 *
 * Flujo:
 *   1. Pide la lista de la categoría (trending/popular/top_rated)
 *   2. Para cada ítem, busca el IMDB ID en paralelo
 *   3. Devuelve los metas con el IMDB ID como `id`
 */

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p';

// Endpoints de TMDB según categoría y tipo
const ENDPOINTS = {
  trending: { movie: '/trending/movie/week', series: '/trending/tv/week' },
  popular:  { movie: '/movie/popular',        series: '/tv/popular'       },
  top_rated:{ movie: '/movie/top_rated',      series: '/tv/top_rated'     },
};

async function tmdbGet(path, apiKey, params = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`TMDB ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Obtiene el IMDB ID de un ítem de TMDB.
 * - Para películas: el campo imdb_id viene directo en /movie/{id}
 * - Para series: se necesita append_to_response=external_ids en /tv/{id}
 */
async function getImdbId(tmdbId, type, apiKey) {
  try {
    if (type === 'movie') {
      const d = await tmdbGet(`/movie/${tmdbId}`, apiKey);
      return d.imdb_id || null;
    } else {
      const d = await tmdbGet(`/tv/${tmdbId}`, apiKey, { append_to_response: 'external_ids' });
      return d.external_ids?.imdb_id || null;
    }
  } catch {
    return null;
  }
}

/**
 * Busca el catálogo solicitado en TMDB y devuelve metas para Stremio.
 *
 * @param {object} params
 * @param {string} params.category  — 'trending' | 'popular' | 'top_rated'
 * @param {string} params.type      — 'movie' | 'series'
 * @param {string} params.language  — 'es-MX' | 'en-US' | etc.
 * @param {string} params.apiKey    — API key gratuita del usuario de TMDB
 */
async function fetchTMDBCatalog({ category, type, language, apiKey }) {
  if (!apiKey) throw new Error('TMDB requiere una API key. Agregala en la configuración del addon.');

  const endpoint = ENDPOINTS[category]?.[type];
  if (!endpoint) throw new Error(`Categoría desconocida: ${category}/${type}`);

  // 1. Obtener lista
  const data = await tmdbGet(endpoint, apiKey, { language, page: 1 });
  const results = (data.results || []).slice(0, 20);

  // 2. Resolver IMDB IDs en paralelo
  const metas = await Promise.all(
    results.map(async (item) => {
      const imdbId = await getImdbId(item.id, type, apiKey);
      if (!imdbId) return null;

      return {
        id: imdbId,                                          // ← ID de IMDB (tt...)
        type: type === 'series' ? 'series' : 'movie',
        name: item.title || item.name || 'Sin título',
        poster:     item.poster_path   ? `${IMG_BASE}/w500${item.poster_path}`   : undefined,
        background: item.backdrop_path ? `${IMG_BASE}/w1280${item.backdrop_path}` : undefined,
        description: item.overview || undefined,
        releaseInfo: (item.release_date || item.first_air_date || '').slice(0, 4) || undefined,
        imdbRating:  item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : undefined,
      };
    })
  );

  return metas.filter(Boolean);
}

module.exports = { fetchTMDBCatalog };
