type PhotoRecord = {
  photoUrl?: string;
};

function withoutEmbeddedPhoto<T extends PhotoRecord>(record: T): T {
  if (!record.photoUrl?.startsWith("data:")) return record;

  const copy = { ...record };
  delete copy.photoUrl;
  return copy;
}

export function cacheRecordsWithoutEmbeddedPhotos<T extends PhotoRecord>(key: string, records: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(records.map(withoutEmbeddedPhoto)));
  } catch (error) {
    console.warn(`Não foi possível salvar ${key} no cache local:`, error);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore cache cleanup failures.
    }
  }
}
