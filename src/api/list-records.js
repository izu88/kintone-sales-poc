import { getAppId, kintoneRequest } from './kintone-client.js';

// まずは app のみで最小のGETを実行し、認証と接続を確認する。
// 接続確認後に並び順などのquery条件を追加する。
const params = new URLSearchParams({
  app: getAppId(),
});

const result = await kintoneRequest(
  `/k/v1/records.json?${params.toString()}`,
  { method: 'GET' }
);

const records = result.records.map((record) => ({
  id: record.$id?.value,
  companyName: record.company_name?.value,
  dealName: record.deal_name?.value,
  probability: record.probability?.value,
  nextAction: record.next_action?.value,
  nextActionDate: record.next_action_date?.value,
  amount: record.amount?.value,
  status: record['ステータス']?.value,
}));

console.table(records);
console.log(`Fetched ${records.length} record(s).`);
