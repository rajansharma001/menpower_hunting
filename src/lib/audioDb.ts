// ==============================================================================
// IndexedDB Local Audio Vault for Field Voice Memos (Offline-first storage)
// Stores raw audio Blobs directly in browser IndexedDB (bypassing 5MB localStorage cap)
// ==============================================================================

import { VoiceMemo } from '../types/database';
import { generateUUID } from './db';

const DB_NAME = 'mph_audio_vault';
const DB_VERSION = 1;
const STORE_NAME = 'voice_memos';

let dbPromise: Promise<IDBDatabase> | null = null;

export function openAudioDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('opportunity_id', 'opportunity_id', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export async function saveVoiceMemo(
  memoData: Omit<VoiceMemo, 'id' | 'created_at'> & { id?: string; created_at?: string }
): Promise<VoiceMemo> {
  const db = await openAudioDatabase();
  const memo: VoiceMemo = {
    ...memoData,
    id: memoData.id || generateUUID(),
    created_at: memoData.created_at || new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(memo);

    request.onsuccess = () => {
      resolve(memo);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getVoiceMemosByOpportunity(opportunityId: string): Promise<VoiceMemo[]> {
  const db = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('opportunity_id');
    const request = index.getAll(opportunityId);

    request.onsuccess = () => {
      const items = (request.result as VoiceMemo[]) || [];
      // Sort newest first
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resolve(items);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllVoiceMemos(): Promise<VoiceMemo[]> {
  const db = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = (request.result as VoiceMemo[]) || [];
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resolve(items);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteVoiceMemo(id: string): Promise<boolean> {
  const db = await openAudioDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Triggers a browser file download of the recorded audio clip for safe offline keeping
 */
export function downloadVoiceMemo(memo: VoiceMemo): void {
  const url = URL.createObjectURL(memo.blob);
  const ext = memo.mime_type.includes('mp4') ? 'mp4' : memo.mime_type.includes('ogg') ? 'ogg' : 'webm';
  const cleanTitle = (memo.title || 'recording')
    .replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '_')
    .slice(0, 40);
  const dateStr = new Date(memo.created_at).toISOString().split('T')[0];
  const filename = `${cleanTitle}_${dateStr}.${ext}`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Formats seconds into mm:ss
 */
export function formatAudioDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats bytes into human readable KB / MB
 */
export function formatAudioSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
