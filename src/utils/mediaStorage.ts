// LocalHub High-Capacity IndexedDB Media Storage Service
// Handles large video and high-resolution photo uploads without localStorage quota limits

const DB_NAME = 'localhub_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

interface StoredMedia {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  thumbnailUrl?: string;
}

// In-memory object URL cache to avoid re-generating blobs and avoid leaks
const urlCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

/**
 * Save a file or Blob into IndexedDB with zero localStorage size limits.
 * Returns a media reference string (e.g. "idb://media_123456") and an active Object URL.
 */
export async function saveMediaFile(
  file: File | Blob,
  customName?: string,
  thumbnailUrl?: string
): Promise<{ id: string; ref: string; objectUrl: string; size: number; type: string; name: string }> {
  const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const name = customName || (file instanceof File ? file.name : `file_${id}`);
  const type = file.type || 'application/octet-stream';
  const size = file.size;

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredMedia = {
        id,
        blob: file,
        name,
        type,
        size,
        createdAt: Date.now(),
        thumbnailUrl
      };

      const putReq = store.put(record);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });

    const objectUrl = URL.createObjectURL(file);
    const ref = `idb://${id}`;
    urlCache.set(ref, objectUrl);
    urlCache.set(id, objectUrl);

    return { id, ref, objectUrl, size, type, name };
  } catch (err) {
    console.warn('[mediaStorage] IndexedDB save failed, falling back to ObjectURL:', err);
    const objectUrl = URL.createObjectURL(file);
    const ref = objectUrl;
    return { id, ref, objectUrl, size, type, name };
  }
}

/**
 * Resolve a media reference (either idb://..., blob:..., or https://...) to an active playable URL.
 */
export async function resolveMediaUrl(refOrUrl: string): Promise<string> {
  if (!refOrUrl) return '';

  // Already a web URL or active blob
  if (refOrUrl.startsWith('http://') || refOrUrl.startsWith('https://') || refOrUrl.startsWith('data:')) {
    return refOrUrl;
  }

  // Check cache first
  if (urlCache.has(refOrUrl)) {
    return urlCache.get(refOrUrl)!;
  }

  const id = refOrUrl.replace(/^idb:\/\//, '');

  try {
    const db = await getDB();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const result = getReq.result as StoredMedia | undefined;
        resolve(result ? result.blob : null);
      };
      getReq.onerror = () => reject(getReq.error);
    });

    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      urlCache.set(refOrUrl, objectUrl);
      urlCache.set(id, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn('[mediaStorage] Error loading media from IndexedDB:', err);
  }

  return refOrUrl;
}

/**
 * Generate a thumbnail data URL from a video file using HTML5 canvas.
 */
export function generateVideoThumbnail(videoFile: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      // Timeout safety (resolve empty after 4s)
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(videoUrl);
        resolve('');
      }, 4000);

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 1) / 2);
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 480;
          let width = video.videoWidth || 640;
          let height = video.videoHeight || 360;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, width, height);
            const thumb = canvas.toDataURL('image/jpeg', 0.75);
            URL.revokeObjectURL(videoUrl);
            resolve(thumb);
            return;
          }
        } catch {
          // ignore canvas taint
        }
        URL.revokeObjectURL(videoUrl);
        resolve('');
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(videoUrl);
        resolve('');
      };
    } catch {
      resolve('');
    }
  });
}

/**
 * Format bytes to readable size (e.g. 15.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
