import { getAppId, kintoneRequest } from './kintone-client.js';

const recordId = process.argv[2];
const action = process.argv[3];

if (!recordId || !action) {
  throw new Error(
    'Record ID and action are required. Example: npm run api:status -- 10 "初回対応へ"'
  );
}

const result = await kintoneRequest('/k/v1/record/status.json', {
  method: 'PUT',
  body: JSON.stringify({
    app: getAppId(),
    id: recordId,
    action,
  }),
});

console.log('Updated status:', result);
