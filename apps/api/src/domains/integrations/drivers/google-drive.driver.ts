import { logger } from '@sous/logger';

export class GoogleDriveDriver {
  private accessToken: string;

  constructor(credentials: { accessToken: string }) {
    this.accessToken = credentials.accessToken;
  }

  async listFiles(folderId?: string) {
    if (!this.accessToken) {
      throw new Error('Google Drive Access Token is missing');
    }

    const q = folderId
      ? `'${folderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType contains 'image/')`
      : "(mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType contains 'image/') and 'root' in parents";

    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.append('q', q);
    url.searchParams.append(
      'fields',
      'files(id, name, mimeType, webViewLink, thumbnailLink)',
    );
    url.searchParams.append('orderBy', 'folder,name');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = response.statusText;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorJson.error || errorBody;
      } catch (e) {
        // Not JSON
      }

      logger.error('[GoogleDrive] Failed to list files', {
        status: response.status,
        error: errorBody,
        tokenPrefix: this.accessToken
          ? this.accessToken.substring(0, 10) + '...'
          : 'null',
      });

      throw new Error(`Failed to list Google Drive files: ${errorMessage}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  async getFile(fileId: string) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.json();
  }

  async downloadFile(fileId: string, mimeType: string) {
    let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // If it's a Google Doc, we need to export it
    if (mimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    if (mimeType === 'application/vnd.google-apps.document') {
      return {
        type: 'text',
        data: await response.text(),
      };
    }

    const buffer = await response.arrayBuffer();
    return {
      type: 'buffer',
      data: Buffer.from(buffer),
      mimeType,
    };
  }
}
