/**
 * Web Worker: keeps heavy BigInt base conversion off the main thread.
 * BigInts are transferred as decimal strings for maximum compatibility.
 */

import { generatePageText, pageTextToIndex } from '../lib/page';
import { findText } from '../lib/search';
import type { GenerationMode } from '../lib/settings';

export interface GenerateRequest {
  id: number;
  type: 'generate';
  index: string;
  alphabet: string[];
  mode: GenerationMode;
}

export interface IndexOfRequest {
  id: number;
  type: 'indexOf';
  text: string;
  alphabet: string[];
}

export interface FindRequest {
  id: number;
  type: 'find';
  query: string;
  alphabet: string[];
  mode: GenerationMode;
}

export type WorkerRequest = GenerateRequest | IndexOfRequest | FindRequest;

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

ctx.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    if (request.type === 'generate') {
      const text = generatePageText(BigInt(request.index), request.alphabet, request.mode);
      ctx.postMessage({ id: request.id, type: 'generate', text });
      return;
    }
    if (request.type === 'indexOf') {
      const index = pageTextToIndex(request.text, request.alphabet);
      ctx.postMessage({ id: request.id, type: 'indexOf', index: index.toString() });
      return;
    }
    const result = findText(request.query, request.alphabet, request.mode);
    ctx.postMessage({
      id: request.id,
      type: 'find',
      found: result.found,
      reason: result.reason,
      missing: result.missing,
      queryLength: result.queryLength,
      position: result.position,
      positions: result.positions,
      index: result.index.toString(),
    });
  } catch (error) {
    ctx.postMessage({ id: request.id, error: error instanceof Error ? error.message : String(error) });
  }
};
