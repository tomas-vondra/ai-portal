import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { phaseStates, uploadedFiles } from '../db/schema.js';

/** Get the output of a specific phase for a project */
export async function getPhaseOutput(projectId: string, phaseId: number): Promise<Record<string, unknown> | null> {
  const [row] = await db.select({ output: phaseStates.output })
    .from(phaseStates)
    .where(and(eq(phaseStates.projectId, projectId), eq(phaseStates.phaseId, phaseId)))
    .limit(1);
  return (row?.output as Record<string, unknown>) ?? null;
}

/** Get the system prompt for a phase */
export async function getPhaseSystemPrompt(projectId: string, phaseId: number): Promise<string> {
  const [row] = await db.select({ systemPrompt: phaseStates.systemPrompt })
    .from(phaseStates)
    .where(and(eq(phaseStates.projectId, projectId), eq(phaseStates.phaseId, phaseId)))
    .limit(1);
  return row?.systemPrompt ?? '';
}

/** Get the input for a phase */
export async function getPhaseInput(projectId: string, phaseId: number): Promise<Record<string, unknown> | null> {
  const [row] = await db.select({ input: phaseStates.input })
    .from(phaseStates)
    .where(and(eq(phaseStates.projectId, projectId), eq(phaseStates.phaseId, phaseId)))
    .limit(1);
  return (row?.input as Record<string, unknown>) ?? null;
}

/** Get extracted text from uploaded files for a phase */
export async function getUploadedTexts(projectId: string, phaseId: number): Promise<string[]> {
  const files = await db.select({ text: uploadedFiles.extractedText })
    .from(uploadedFiles)
    .where(and(eq(uploadedFiles.projectId, projectId), eq(uploadedFiles.phaseId, phaseId)));
  return files.filter((f) => f.text != null).map((f) => f.text!);
}
