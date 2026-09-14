/**
 * config.js — Encode/decode de la configuración del usuario en la URL.
 * No hay base de datos: toda la config vive en la URL del addon.
 * Cada usuario tiene su URL única → el servidor es completamente stateless.
 */

const DEFAULT_CONFIG = {
  language: 'es-MX',
  sources: {
    // tmdb: { apiKey: '' }   ← se llena cuando el usuario elige TMDB
  },
  catalogs: [
    { source: 'tmdb', category: 'trending', type: 'movie',  name: 'Tendencias — Películas', enabled: true  },
    { source: 'tmdb', category: 'trending', type: 'series', name: 'Tendencias — Series',    enabled: true  },
    { source: 'tmdb', category: 'popular',  type: 'movie',  name: 'Populares — Películas',  enabled: true  },
    { source: 'tmdb', category: 'popular',  type: 'series', name: 'Populares — Series',     enabled: false },
    { source: 'tmdb', category: 'top_rated',type: 'movie',  name: 'Mejor Valoradas — Películas', enabled: false },
    { source: 'tmdb', category: 'top_rated',type: 'series', name: 'Mejor Valoradas — Series',    enabled: false },
  ]
};

/**
 * Codifica la config a base64url (seguro para URLs sin encoding extra).
 * Usado en el servidor para generar URLs de ejemplo.
 */
function encodeConfig(config) {
  return Buffer.from(JSON.stringify(config)).toString('base64url');
}

/**
 * Decodifica la config desde la URL.
 * Acepta tanto base64url (guiones/underscores) como base64 clásico (desde el browser).
 */
function decodeConfig(encoded) {
  try {
    // Normalizar: base64url → base64 estándar para que Buffer lo entienda
    const std = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = std + '='.repeat((4 - std.length % 4) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

module.exports = { encodeConfig, decodeConfig, DEFAULT_CONFIG };
