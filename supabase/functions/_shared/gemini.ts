const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

// Uploads the video as a stream (no full buffer in memory) and then calls generateContent.
// videoStream must be a ReadableStream<Uint8Array>; contentLength is the byte size (required by the API).
export async function analyzeVideo(
  videoStream: ReadableStream<Uint8Array>,
  mimeType: string,
  contentLength: number,
  prompt: string
): Promise<string> {
  // 1. Resumable upload — initiate session
  const initRes = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': String(contentLength),
        'X-Goog-Upload-Header-Content-Type': mimeType,
      },
      body: JSON.stringify({ file: { display_name: 'video' } }),
    }
  )
  if (!initRes.ok) throw new Error(`Resumable init failed (${initRes.status}): ${await initRes.text()}`)

  const uploadUrl = initRes.headers.get('X-Goog-Upload-URL')
  if (!uploadUrl) throw new Error('No upload URL returned from Gemini resumable init')

  // 2. Stream the video bytes directly — no buffering in memory
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': String(contentLength),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    // @ts-ignore — Deno supports streaming request bodies
    body: videoStream,
    duplex: 'half',
  })
  if (!uploadRes.ok) throw new Error(`Resumable upload failed (${uploadRes.status}): ${await uploadRes.text()}`)

  const uploadData = await uploadRes.json()
  const fileUri: string = uploadData.file.uri
  const fileMimeType: string = uploadData.file.mimeType || mimeType
  console.log(`File uploaded (stream): ${fileUri}`)

  // 3. Poll until the file is ACTIVE (not just wait a fixed time)
  let fileState = uploadData.file.state as string
  for (let i = 0; i < 12 && fileState !== 'ACTIVE'; i++) {
    await new Promise(r => setTimeout(r, 5000))
    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/files/${fileUri.split('/').pop()}?key=${GEMINI_API_KEY}`
    )
    if (pollRes.ok) {
      const pollData = await pollRes.json()
      fileState = pollData.state ?? fileState
      console.log(`File state: ${fileState}`)
    }
  }
  if (fileState !== 'ACTIVE') throw new Error(`File not ready after polling: state=${fileState}`)

  // 4. generateContent
  const genRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { file_data: { mime_type: fileMimeType, file_uri: fileUri } },
            { text: prompt }
          ]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 65536, response_mime_type: 'application/json' }
      })
    }
  )
  if (!genRes.ok) throw new Error(`generateContent failed (${genRes.status}): ${await genRes.text()}`)
  const genData = await genRes.json()
  return genData.candidates[0].content.parts[0].text
}
