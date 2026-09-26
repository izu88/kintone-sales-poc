import { getAppId, kintoneRequest } from './kintone-client.js';

const recordId = process.argv[2];

if (!recordId) {
  throw new Error(
    'Record ID is required. Example: npm run api:update -- 10'
  );
}

const result = await kintoneRequest('/k/v1/record.json', {
  method: 'PUT',
  body: JSON.stringify({
    app: getAppId(),
    id: recordId,
    record: {
      probability: { value: 'A' },
      next_action: { value: '提案資料を送付' },
      next_action_date: { value: '2026-10-05' },
    },
  }),
});

console.log('Updated record:', result);
