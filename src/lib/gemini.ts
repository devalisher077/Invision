export async function geminiScoreTranscript(transcript: string): Promise<any> {
  const response = await fetch('/api/gemini-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript }),
  });
  if (!response.ok) return null;
  return await response.json();
}
