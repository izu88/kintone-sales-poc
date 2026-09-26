const requiredEnv = [
  'KINTONE_BASE_URL',
  'KINTONE_APP_ID',
  'KINTONE_API_TOKEN',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const baseUrl = process.env.KINTONE_BASE_URL.replace(/\/$/, '');
const appId = process.env.KINTONE_APP_ID;
const apiToken = process.env.KINTONE_API_TOKEN;

export const getAppId = () => appId;

export async function kintoneRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'X-Cybozu-API-Token': apiToken,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(
      body?.message || `kintone API request failed: ${response.status}`
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}
