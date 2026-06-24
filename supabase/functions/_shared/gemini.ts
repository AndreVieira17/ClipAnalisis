// Official Gemini SDK client (@google/genai) for Deno / Supabase Edge.
// Uses the current auth-key method: the SDK handles authentication for both the
// new "AQ." auth keys and legacy "AIza" keys — we just pass `apiKey`. Native
// video: upload via the Files API, wait until ACTIVE, then generateContent over
// video + metrics image with temporal understanding (frames + speech + music).
import { GoogleGenAI, createPartFromUri, createUserContent } from 'npm:@google/genai@^1.16.0';

function client(): GoogleGenAI {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey });
}

export function model(): string {
  return Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
}

export interface FileRef {
  uri: string;
  mimeType: string;
  name: string;
}

/** Upload a video blob and poll until the Files API marks it ACTIVE. */
export async function uploadVideo(blob: Blob, mimeType: string, timeoutMs = 90_000): Promise<FileRef> {
  const ai = client();
  let file = await ai.files.upload({ file: blob, config: { mimeType } });

  const deadline = Date.now() + timeoutMs;
  while (file.state === 'PROCESSING') {
    if (Date.now() > deadline) throw new Error('Gemini file processing timed out');
    await new Promise((r) => setTimeout(r, 2000));
    file = await ai.files.get({ name: file.name as string });
  }
  if (file.state === 'FAILED') throw new Error('Gemini file processing FAILED');
  if (!file.uri || !file.name) throw new Error('Gemini upload: missing file uri/name');

  return { uri: file.uri, mimeType: file.mimeType ?? mimeType, name: file.name };
}

export async function deleteFile(name: string): Promise<void> {
  try {
    await client().files.delete({ name });
  } catch {
    /* best-effort cleanup */
  }
}

export interface MetricsInline {
  mimeType: string;
  data: string; // base64
}

/** Run generateContent over (optional) video + (optional) metrics image + prompt. */
export async function generateJson(
  system: string,
  opts: { video?: FileRef; metrics?: MetricsInline; prompt: string },
  temperature = 0.4,
): Promise<string> {
  const ai = client();

  const parts: unknown[] = [];
  if (opts.video) parts.push(createPartFromUri(opts.video.uri, opts.video.mimeType));
  if (opts.metrics) parts.push({ inlineData: { mimeType: opts.metrics.mimeType, data: opts.metrics.data } });
  parts.push(opts.prompt);

  const res = await ai.models.generateContent({
    model: model(),
    contents: createUserContent(parts as never),
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      temperature,
      maxOutputTokens: 8192,
    },
  });

  const text = res.text;
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}
