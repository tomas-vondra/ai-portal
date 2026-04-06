import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { uploadedFiles } from '../db/schema.js';
import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { v4 as uuid } from 'uuid';

export async function uploadFile(
  projectId: string,
  phaseId: number,
  filename: string,
  buffer: Buffer,
): Promise<{ id: string; originalName: string; extractedText: string | null }> {
  // Ensure upload directory exists
  const dir = join(config.UPLOAD_DIR, projectId, String(phaseId));
  await mkdir(dir, { recursive: true });

  // Store file
  const ext = extname(filename);
  const storedName = `${uuid()}${ext}`;
  const storedPath = join(dir, storedName);
  await writeFile(storedPath, buffer);

  // Extract text based on file type
  let extractedText: string | null = null;
  try {
    extractedText = await extractText(buffer, ext.toLowerCase());
  } catch (err) {
    // Log but don't fail the upload
    console.error('Text extraction failed:', err);
  }

  const [file] = await db.insert(uploadedFiles).values({
    projectId,
    phaseId,
    originalName: filename,
    storedPath,
    extractedText,
  }).returning();

  return { id: file.id, originalName: file.originalName, extractedText: file.extractedText };
}

async function extractText(buffer: Buffer, ext: string): Promise<string | null> {
  switch (ext) {
    case '.txt':
    case '.md':
      return buffer.toString('utf-8');
    case '.pdf': {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      return result.text;
    }
    case '.docx': {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    default:
      return null;
  }
}

export async function listFiles(projectId: string, phaseId: number) {
  return db.select().from(uploadedFiles)
    .where(and(eq(uploadedFiles.projectId, projectId), eq(uploadedFiles.phaseId, phaseId)));
}

export async function getFile(fileId: string) {
  const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId)).limit(1);
  if (!file) throw new AppError(404, 'File not found');
  return file;
}

export async function getFileBuffer(fileId: string): Promise<{ buffer: Buffer; filename: string }> {
  const file = await getFile(fileId);
  const buffer = await readFile(file.storedPath);
  return { buffer, filename: file.originalName };
}

export async function getFileText(fileId: string): Promise<string | null> {
  const file = await getFile(fileId);
  return file.extractedText;
}
