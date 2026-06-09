import { ZipReader, BlobReader, configure } from '@zip.js/zip.js';

configure({ useWebWorkers: false, useCompressionStream: false });

export interface ProcessingOptions {
  delimiter: string;
  includeHidden: boolean;
  includeMacSystem: boolean;
  notebookLMMode: boolean;
  filenameEncoding?: string;
  outputFileName: string;
}

export const NOTEBOOK_LM_EXTENSIONS = new Set([
  // Documents
  '.docx', '.txt', '.md', '.pdf', '.csv', '.pptx', '.epub',
  // Images
  '.avif', '.bmp', '.gif', '.heic', '.heif', '.ico', '.jp2', '.jpe', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp',
  // Audio
  '.3g2', '.3gp', '.aac', '.aif', '.aifc', '.aiff', '.amr', '.au', '.avi', '.cda', '.m4a', '.mid', '.mp3', '.mp4', '.mpeg', '.ogg', '.opus', '.ra', '.ram', '.snd', '.wav', '.wma',
]);

export interface FileItem {
  originalPath: string;
  newPath: string;
  isSkipped: boolean;
  skipReason?: string;
}

export const processZipFiles = async (
  zipFile: File,
  options: ProcessingOptions
): Promise<FileItem[]> => {
  const zipReader = new ZipReader(new BlobReader(zipFile), {
    filenameEncoding: options.filenameEncoding,
  });
  const entries = await zipReader.getEntries();
  const items: FileItem[] = [];
  const usedNames = new Set<string>();

  for (const entry of entries) {
    if (entry.directory) continue;

    // Normalize filename to NFC (macOS uses NFD, which causes mojibake)
    const rawPath = entry.filename;
    const path = rawPath.normalize('NFC');
    let isSkipped = false;
    let skipReason = '';

    // Check for macOS system files
    if (!options.includeMacSystem) {
      if (path.startsWith('__MACOSX/') || path.includes('.DS_Store')) {
        isSkipped = true;
        skipReason = 'macOS System File';
      }
    }

    // Check for hidden files
    if (!isSkipped && !options.includeHidden) {
      const fileName = path.split('/').pop() || '';
      if (fileName.startsWith('.')) {
        isSkipped = true;
        skipReason = 'Hidden File';
      }
    }

    // Check for NotebookLM supported files
    if (!isSkipped && options.notebookLMMode) {
      const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
      if (!NOTEBOOK_LM_EXTENSIONS.has(ext)) {
        isSkipped = true;
        skipReason = 'NotebookLM Unsupported';
      }
    }

    let newPath = '';
    if (!isSkipped) {
      // Flatten path: A/B/C.jpg -> A-B-C.jpg
      const parts = path.split('/');
      newPath = parts.join(options.delimiter);

      // Handle collisions
      let finalPath = newPath;
      let counter = 1;
      const dotIndex = newPath.lastIndexOf('.');
      const name = dotIndex !== -1 ? newPath.substring(0, dotIndex) : newPath;
      const ext = dotIndex !== -1 ? newPath.substring(dotIndex) : '';

      while (usedNames.has(finalPath)) {
        finalPath = `${name} (${counter})${ext}`;
        counter++;
      }
      newPath = finalPath;
      usedNames.add(newPath);
    }

    items.push({
      originalPath: rawPath, // Use original raw path to find the entry in the worker
      newPath,
      isSkipped,
      skipReason,
    });
  }

  await zipReader.close();
  return items;
};
