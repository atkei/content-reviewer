import { readFile } from 'fs/promises';
import type { Document } from '@content-reviewer/core';

export async function readDocument(filePath: string): Promise<Document> {
  try {
    const rawContent = await readFile(filePath, 'utf-8');

    return {
      rawContent,
      source: filePath,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}
