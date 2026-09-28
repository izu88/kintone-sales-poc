# n8n連携

## 概要

Web問い合わせをn8nのWebhookで受け付け、入力内容を整形・検証したうえでkintoneへ商談を自動登録するPoCです。

kintoneへの登録結果に応じてHTTPステータスを返し、入力不備と外部APIエラーを区別できる構成にしています。

## Workflow

```text
Webhook
↓
問い合わせデータ整形
↓
必須項目チェック
├─ false → 400 入力エラー
└─ true
    ↓
  kintone商談登録
    ↓
  kintone API結果判定
    ├─ success → 成功レスポンス整形 → 201 登録成功
    └─ error   → 502 APIエラー
```

![n8n問い合わせ自動登録フロー](images/06-n8n-workflow.png)

## Nodeの役割

| Node | 役割 |
| --- | --- |
| Webhook | Web問い合わせをPOSTで受信 |
| 問い合わせデータ整形 | 受信JSONをkintone登録用データへ整形 |
| 必須項目チェック | `company_name` と `deal_name` の入力有無を確認 |
| 400 入力エラー | 必須項目不足時に `400 Bad Request` を返却 |
| kintone商談登録 | kintone REST APIへ商談をPOST |
| kintone API結果判定 | kintoneのHTTPステータスを判定 |
| 成功レスポンス整形 | 登録結果のレコードID・revisionをレスポンス用に整形 |
| 201 登録成功 | 正常登録時に `201 Created` を返却 |
| 502 APIエラー | kintone API失敗時に `502 Bad Gateway` を返却 |

## 入力データ

Webhookでは次のJSONを想定しています。

```json
{
  "company_name": "株式会社サンプル",
  "contact_name": "山田 太郎",
  "deal_name": "営業DX相談",
  "customer_issue": "営業管理を改善したい",
  "lead_source": "Web問い合わせ"
}
```

必須項目は次の2項目です。

- `company_name`
- `deal_name`

## レスポンス

### 正常登録

```http
HTTP/1.1 201 Created
```

```json
{
  "success": true,
  "message": "商談を登録しました。",
  "recordId": "17",
  "revision": "1"
}
```

### 必須項目不足

```http
HTTP/1.1 400 Bad Request
```

```json
{
  "success": false,
  "message": "必須項目が不足しています。",
  "required": ["company_name", "deal_name"]
}
```

### kintone API失敗

```http
HTTP/1.1 502 Bad Gateway
```

```json
{
  "success": false,
  "message": "kintoneへの登録に失敗しました。"
}
```

## ローカル起動

Dockerが利用できる環境で実行します。

```bash
cd n8n
docker compose up -d
```

起動後、ブラウザで次へアクセスします。

```text
http://localhost:5678
```

停止する場合は次を実行します。

```bash
docker compose down
```

## WorkflowのImport

Workflow JSONは次に保存しています。

```text
n8n/workflows/sales-inquiry-to-kintone.json
```

n8nへImport後、利用環境に合わせてkintone接続先とCredentialsを設定します。

## kintone認証

APIトークンはWorkflow JSONへ直接保存しません。

HTTP Request NodeではHeader AuthのCredentialを利用し、次のヘッダーをCredentials側で管理します。

```text
X-Cybozu-API-Token
```

APIトークン、認証情報、実在顧客データはGit管理対象にしません。

## Webhook URL

テスト時はTest URLを利用します。

```text
http://localhost:5678/webhook-test/sales-inquiry
```

Test URLは、n8n側でWorkflowをテスト待機状態にしてから呼び出します。

WorkflowをPublishした後はProduction URLを利用します。

```text
http://localhost:5678/webhook/sales-inquiry
```

## 動作確認

Production Webhookで次のケースを実機確認済みです。

| ケース | 期待結果 | 結果 |
| --- | --- | --- |
| 正常な問い合わせ | kintoneへ商談登録 | ✅ |
| 正常登録 | `201 Created` | ✅ |
| 必須項目不足 | `400 Bad Request` | ✅ |
| kintone API失敗 | `502 Bad Gateway` | ✅ |
| 登録成功レスポンス | `recordId` / `revision` を返却 | ✅ |

## ファイル構成

```text
n8n/
├─ compose.yml
└─ workflows/
   └─ sales-inquiry-to-kintone.json
```

## 次のPhase

n8nによる受付・入力検証・kintone登録までをPhase 2として完了し、Phase 3ではDifyによる問い合わせ分析とWorkflow API実行まで確認しました。

次はPhase 4として、n8nからDify APIを呼び出し、AI分析結果をkintoneへ登録します。

```text
Web問い合わせ
↓
n8n
↓
Dify API
↓
n8n
↓
kintone
```

Dify側の詳細は [Dify連携ドキュメント](dify.md) を参照してください。
