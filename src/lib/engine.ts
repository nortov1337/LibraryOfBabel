/**
 * Client wrapper around the generation worker.
 * Falls back to synchronous pure functions when Workers are unavailable
 * (e.g. tests, very old browsers) so behaviour is always identical.
 */

import { generatePageText, pageTextToIndex } from './page';
import { findText, type FindResult } from './search';
import type { GenerationMode } from './settings';

type Pending = { resolve: (value: unknown) => void; reject: (error: unknown) => void };

interface FindResponse {
  id: number;
  type: 'find';
  found: boolean;
  reason?: FindResult['reason'];
  missing: string[];
  queryLength: number;
  position: number;
  positions: number[];
  index: string;
}

type WorkerResponse =
  | { id: number; type: 'generate'; text: string }
  | { id: number; type: 'indexOf'; index: string }
  | FindResponse
  | { id: number; error: string };

export class LibraryEngine {
  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();

  constructor() {
    if (typeof Worker === 'undefined') return;
    try {
      const worker = new Worker(new URL('../workers/library.worker.ts', import.meta.url), {
        type: 'module',
      });
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;
        const entry = this.pending.get(data.id);
        if (!entry) return;
        this.pending.delete(data.id);
        if ('error' in data) entry.reject(new Error(data.error));
        else entry.resolve(data);
      };
      worker.onerror = () => {
        this.worker = null;
        for (const entry of this.pending.values()) entry.reject(new Error('worker-error'));
        this.pending.clear();
      };
      this.worker = worker;
    } catch {
      this.worker = null;
    }
  }

  private request(payload: Record<string, unknown>): Promise<WorkerResponse> {
    if (!this.worker) return Promise.reject(new Error('no-worker'));
    const id = ++this.seq;
    return new Promise<WorkerResponse>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      try {
        this.worker!.postMessage({ id, ...payload });
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  async generate(
    index: bigint,
    alphabet: string[],
    mode: GenerationMode = 'traditional',
  ): Promise<string> {
    if (this.worker) {
      try {
        const res = (await this.request({
          type: 'generate',
          index: index.toString(),
          alphabet,
          mode,
        })) as { text: string };
        return res.text;
      } catch {
        // fall through to sync
      }
    }
    return generatePageText(index, alphabet, mode);
  }

  async indexOf(text: string, alphabet: string[]): Promise<bigint> {
    if (this.worker) {
      try {
        const res = (await this.request({ type: 'indexOf', text, alphabet })) as { index: string };
        return BigInt(res.index);
      } catch {
        // fall through to sync
      }
    }
    return pageTextToIndex(text, alphabet);
  }

  async find(
    query: string,
    alphabet: string[],
    mode: GenerationMode = 'traditional',
  ): Promise<FindResult> {
    if (this.worker) {
      try {
        const res = (await this.request({ type: 'find', query, alphabet, mode })) as FindResponse;
        return {
          found: res.found,
          reason: res.reason,
          missing: res.missing,
          queryLength: res.queryLength,
          position: res.position,
          positions: res.positions ?? [],
          index: BigInt(res.index),
        };
      } catch {
        // fall through to sync
      }
    }
    return findText(query, alphabet, mode);
  }
}

export const engine = new LibraryEngine();
