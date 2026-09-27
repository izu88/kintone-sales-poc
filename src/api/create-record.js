import { getAppId, kintoneRequest } from './kintone-client.js';

const sampleRecord = {
  company_name: { value: '株式会社APIサンプル' },
  contact_name: { value: 'API 太郎' },
  deal_name: { value: 'REST API連携PoC' },
  lead_source: { value: 'Web問い合わせ' },
  customer_issue: {
    value: '営業情報の転記作業を削減したい',
  },
  deal_memo: {
    value: 'Node.jsからkintone REST APIで登録した検証用レコード',
  },
  probability: { value: 'B' },
  next_action: { value: '初回ヒアリング' },
  next_action_date: { value: '2026-10-01' },
  amount: { value: '1200000' },
};

const result = await kintoneRequest('/k/v1/record.json', {
  method: 'POST',
  body: JSON.stringify({
    app: getAppId(),
    record: sampleRecord,
  }),
});

console.log('Created record:', result);
