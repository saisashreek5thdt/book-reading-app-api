// app/api/utils/cache.js
let bookCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60_000; // 1 minute

export function getBooksFromCache() {
  const now = Date.now();
  if (bookCache.data && now - bookCache.timestamp < CACHE_TTL_MS) {
    return bookCache.data;
  }
  return null;
}

export function updateBooksCache(data) {
  bookCache = {
    data,
    timestamp: Date.now(),
  };
}

// app/api/utils/cache.js
let featuredBooksCache = {
  data: null,
  timestamp: 0,
};


export function getFeaturedBooksFromCache() {
  const now = Date.now();
  if (
    featuredBooksCache.data &&
    now - featuredBooksCache.timestamp < CACHE_TTL_MS
  ) {
    return featuredBooksCache.data;
  }
  return null;
}

export function updateFeaturedBooksCache(data) {
  featuredBooksCache = {
    data,
    timestamp: Date.now(),
  };
}