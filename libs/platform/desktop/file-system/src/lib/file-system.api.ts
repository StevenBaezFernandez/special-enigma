import { ipcMain, dialog } from 'electron';
import { writeFile } from 'fs/promises';

export class FileSystemApi {
  static registerHandlers() {
    ipcMain.handle('fs:save-report', async (event, content: string, filename: string) => {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Report',
        defaultPath: filename,
        filters: [{ name: 'Text Files', extensions: ['txt', 'csv', 'json'] }]
      });

      if (filePath) {
        await writeFile(filePath, content, 'utf-8');
        return { success: true, path: filePath };
      }
      return { success: false };
    });

    ipcMain.handle('fs:read-config', async () => {
        // Default values for local config
        return { theme: 'dark', language: 'en' };
    });
  }
}
