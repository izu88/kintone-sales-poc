const requiredEnv = [
  'KINTONE_BASE_URL',
  'KINTONE_APP_ID',
  'KINTONE_API_TOKEN',
];

for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const rawBaseUrl = process.env.KINTONE_BASE_URL.trim();
const appId = process.env.KINTONE_APP_ID.trim();
const apiToken = process.env.KINTONE_API_TOKEN.trim();

if (!/^\d+$/.test(appId)) {
  throw new Error(
    'KINTONE_APP_ID must be a numeric app ID, e.g. 123 (not /k/123/ or a full URL).'
  );
}

const parsedBaseUrl = new URL(rawBaseUrl);

if (parsedBaseUrl.pathname !== '/' || parsedBaseUrl.search || parsedBaseUrl.hash) {
  throw new Error(
    'KINTONE_BASE_URL must be the origin only, e.g. https://example.cybozu.com'
  );
}

const baseUrl = parsedBaseUrl.origin;

export const getAppId = () => appId;

export async function kintoneRequest(path, options = {}) {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = {
    'X-Cybozu-API-Token': apiToken,
    ...(options.headers ?? {}),
  };

  // kintoneのGETではContent-Typeは不要。
  // JSONボディを送るリクエストだけapplication/jsonを付与する。
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    method,
    headers,
  });

  const text = await response.text();

  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    console.error('[kintone API error]', {
      method,
      url,
      status: response.status,
      code: body?.code,
      id: body?.id,
      message: body?.message,
      errors: body?.errors,
    });

    const error = new Error(
      body?.message || `kintone API request failed: ${response.status}`
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}
