/**
 * API client for CommitIQ backend.
 *
 * - Non-streaming endpoints use the `axios` `client` instance.
 * - Streaming endpoints (SSE) use the native `fetch` API + `ReadableStream`
 *   reader because axios cannot stream responses. See `streamNarrative`.
 */

import axios, { AxiosError } from 'axios';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const API_ROOT = `${API_BASE}/api`;

export const client = axios.create({
  baseURL: API_ROOT,
  headers: { 'Content-Type': 'application/json' },
});

export interface NarrativeResponse {
  repo_id: number;
  commit_sha: string;
  prompt_type: string;
  explanation: string;
  tokens_used: number;
  cost_usd: number;
  cached: boolean;
  model: string;
  provider?: string;
  demo_mode: boolean;
}

export interface NarrativeStreamChunk {
  token?: string;
  done: boolean;
  explanation?: string;
  tokens_total?: number;
  cost_usd?: number;
  cached?: boolean;
  model?: string;
  provider?: string;
  demo_mode?: boolean;
  error?: string;
}

/**
 * Stream an `explain_drop` narrative from `POST /api/explain/stream`.
 *
 * Calls `onChunk` once per SSE payload. The final chunk has `done: true`
 * and carries the full explanation, token totals, cost, and provider
 * metadata.
 *
 * Uses native `fetch` + `ReadableStream.getReader()` because axios does
 * not support streaming responses. Chunks split mid-`\n\n` are
 * reassembled via a small buffer.
 */
export async function streamNarrative(
  repoId: string | number,
  sha: string,
  onChunk: (chunk: NarrativeStreamChunk) => void,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const response = await fetch(`${API_ROOT}/explain/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo_id: Number(repoId),
      commit_sha: sha,
      prompt_type: 'explain_drop',
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || `Narrative stream failed (${response.status})`);
  }

  if (!response.body) {
    throw new Error('Narrative stream did not return a response body');
  }

  await consumeSseStream(response.body, onChunk);
}

/**
 * Stream a `predict_merge` narrative from `POST /api/predict/stream`.
 * Mirrors `streamNarrative` but targets the merge-impact endpoint.
 */
export async function streamPredictNarrative(
  repoId: string | number,
  sha: string,
  onChunk: (chunk: NarrativeStreamChunk) => void,
  options: { signal?: AbortSignal } = {},
): Promise<void> {
  const response = await fetch(`${API_ROOT}/predict/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo_id: Number(repoId),
      commit_sha: sha,
      prompt_type: 'predict_merge',
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.detail || `Predict stream failed (${response.status})`);
  }

  if (!response.body) {
    throw new Error('Predict stream did not return a response body');
  }

  await consumeSseStream(response.body, onChunk);
}

/**
 * Internal helper: consume a `ReadableStream<Uint8Array>` of SSE-formatted
 * bytes, reassembling chunks split across network reads.
 */
async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (chunk: NarrativeStreamChunk) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const payload = extractSsePayload(event);
        if (payload) {
          onChunk(JSON.parse(payload) as NarrativeStreamChunk);
        }
      }
    }

    // Flush any trailing event that didn't end with a blank line.
    const trailing = extractSsePayload(buffer);
    if (trailing) {
      onChunk(JSON.parse(trailing) as NarrativeStreamChunk);
    }
  } finally {
    reader.releaseLock();
  }
}

function extractSsePayload(event: string): string | null {
  const line = event.split('\n').find((part) => part.startsWith('data: '));
  if (!line) return null;
  const payload = line.slice(6).trim();
  return payload || null;
}

/** Convenience wrapper for the non-streaming `POST /api/explain` endpoint. */
export async function fetchNarrative(
  repoId: string | number,
  sha: string,
  promptType: 'explain_drop' | 'predict_merge' = 'explain_drop',
): Promise<NarrativeResponse> {
  try {
    const { data } = await client.post<NarrativeResponse>('/explain', {
      repo_id: Number(repoId),
      commit_sha: sha,
      prompt_type: promptType,
    });
    return data;
  } catch (err) {
    const axErr = err as AxiosError<{ detail?: string }>;
    const detail = axErr.response?.data?.detail || axErr.message;
    throw new Error(detail);
  }
}
