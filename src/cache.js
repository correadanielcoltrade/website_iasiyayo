// Cache LRU sencillo en memoria. Reemplazable por Redis a futuro.
const crypto = require('crypto');

class TTLCache {
  constructor({ maxEntries = 500, ttlMs = 3_600_000 } = {}) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.map = new Map();
  }

  static key(text, tone) {
    return crypto.createHash('sha256').update(`${tone}::${text}`).digest('hex');
  }

  get(k) {
    const entry = this.map.get(k);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(k);
      return null;
    }
    // refresh LRU order
    this.map.delete(k);
    this.map.set(k, entry);
    return entry.value;
  }

  set(k, value) {
    if (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (oldest) this.map.delete(oldest);
    }
    this.map.set(k, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

module.exports = { TTLCache };
