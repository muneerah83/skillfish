const TELEMETRY_URL = 'https://mcpmarket.com/api/telemetry';

/** Timeout for telemetry requests (ms) */
const TELEMETRY_TIMEOUT = 5000;

/**
 * Track a skill install. Returns a promise that resolves when the request
 * completes (or times out). Never rejects.
 *
 * @param owner GitHub repository owner
 * @param repo GitHub repository name
 * @param skillName Name of the skill being installed
 * @returns Promise that resolves when telemetry is sent (or times out)
 */
export function trackInstall(owner: string, repo: string, skillName: string): Promise<void> {
  try {
    if (process.env.DO_NOT_TRACK === '1' || process.env.CI === 'true') {
      return Promise.resolve();
    }
    if (!owner || !repo || !skillName) {
      return Promise.resolve();
    }

    // Use AbortController to properly timeout the request
    // This ensures the fetch actually completes (or aborts) before we return
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT);

    const body = JSON.stringify({ owner, repo, skillName });
    console.log(`[telemetry] Sending: ${body}`);

    return fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    })
      .then((res) => console.log(`[telemetry] Response: ${res.status}`))
      .catch((err) => console.log(`[telemetry] Error: ${err.message}`))
      .finally(() => clearTimeout(timeoutId));
  } catch {
    return Promise.resolve();
  }
}
