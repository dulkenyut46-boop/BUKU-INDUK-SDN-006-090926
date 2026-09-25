import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Scope required for creating and managing files created by this app in Google Drive
 */
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

// Configure GoogleAuthProvider with Drive scopes
export const googleDriveProvider = new GoogleAuthProvider();
googleDriveProvider.addScope('https://www.googleapis.com/auth/drive.file');
// Request offline access prompt when needed
googleDriveProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (Do NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveBackupFile {
  id: string;
  name: string;
  size?: string;
  createdTime: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Initialize Drive Auth listener
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User exists in Firebase but token expired or refreshed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google with Drive scope
 */
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleDriveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Drive. Harap beri izin akses.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out from Google
 */
export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Get the current cached access token
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Set or refresh the cached token manually if obtained elsewhere
 */
export const setDriveAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

/**
 * Upload a backup file (JSON or .DB) to user's Google Drive using multipart upload
 */
export const uploadBackupToGoogleDrive = async (params: {
  fileName: string;
  content: string;
  mimeType?: string;
  description?: string;
}): Promise<DriveBackupFile> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Sesi Google Drive belum terhubung. Silakan login ke Google Drive terlebih dahulu.');
  }

  const boundary = '-------BukuIndukDriveUploadBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: params.fileName,
    mimeType: params.mimeType || 'application/json',
    description: params.description || 'Cadangan Database Buku Induk Siswa Digital',
    properties: {
      app: 'buku-induk-siswa-digital',
      type: 'database-backup',
    },
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${params.mimeType || 'application/json'}\r\n\r\n` +
    params.content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || 
      `Gagal mengunggah cadangan ke Google Drive (Status: ${response.status})`
    );
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    size: data.size,
    createdTime: data.createdTime || new Date().toISOString(),
    webViewLink: data.webViewLink,
  };
};

/**
 * List backup files stored in Google Drive by this app
 */
export const listGoogleDriveBackups = async (): Promise<DriveBackupFile[]> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Sesi Google Drive belum terhubung.');
  }

  const query = "trashed = false";
  const fields = 'files(id,name,size,createdTime,modifiedTime,webViewLink)';
  const orderBy = 'createdTime desc';

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(orderBy)}&pageSize=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || 
      `Gagal mengambil daftar berkas Google Drive (Status: ${response.status})`
    );
  }

  const data = await response.json();
  const files: DriveBackupFile[] = (data.files || []).filter((f: any) => {
    const name = (f.name || '').toLowerCase();
    return name.endsWith('.json') || name.endsWith('.db') || name.includes('buku_induk') || name.includes('backup');
  });

  return files;
};

/**
 * Download / Read a backup file content from Google Drive
 */
export const downloadGoogleDriveBackupContent = async (fileId: string): Promise<string> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Sesi Google Drive belum terhubung.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengunduh berkas cadangan dari Google Drive (Status: ${response.status})`);
  }

  return await response.text();
};

/**
 * Delete a backup file from Google Drive (Requires explicit confirmation)
 */
export const deleteGoogleDriveBackup = async (fileId: string): Promise<void> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Sesi Google Drive belum terhubung.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || 
      `Gagal menghapus berkas dari Google Drive (Status: ${response.status})`
    );
  }
};
