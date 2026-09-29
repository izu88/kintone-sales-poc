# n8n連携

## 概要

n8n Community EditionをDocker Composeでローカル起動し、Web問い合わせ受付からDifyによるAI分析、kintone商談登録までを自動化するPoCです。

Phase 2ではWebhook → kintone登録を実装し、Phase 4でDify Workflow APIを中間処理として追加しました。

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
  Dify問い合わせ分析
  ├─ Error Output → 502 AI解析エラー
  └─ Main
      ↓
    Dify結果判定
    ├─ false → 502 AI解析エラー
    └─ true
        ↓
      AI結果整形
        ↓
      kintone商談登録
        ↓
      kintone API結果判定
      ├─ false → 502 APIエラー
      └─ true
          ↓
        成功レスポンス整形
          ↓
        201 登録成功
```

![n8n + Dify + kintone統合Workflow](images/08-n8n-dify-kintone-workflow.png)

## Nodeの役割

| Node | 役割 |
| --- | --- |
| Webhook | Web問い合わせをPOSTで受信 |
| 問い合わせデータ整形 | 入力値を整形し、初期確度 `C` を付与 |
| 必須項目チェック | `company_name` / `deal_name` / `inquiry_text` を検証 |
| 400 入力エラー | 必須項目不足時に `400 Bad Request` |
| Dify問い合わせ分析 | Dify Workflow APIへ問い合わせ本文をPOST |
| Dify結果判定 | Difyの `data.status === succeeded` を確認 |
| 502 AI解析エラー | Dify失敗・接続不能時に `502 Bad Gateway` |
| AI結果整形 | 元問い合わせとAI分析4項目を統合 |
| kintone商談登録 | kintone REST APIへ商談をPOST |
| kintone API結果判定 | kintoneのHTTPステータスが200以上300未満か判定 |
| 成功レスポンス整形 | `recordId` / `revision` をレスポンス用に整形 |
| 201 登録成功 | 正常登録時に `201 Created` |
| 502 APIエラー | kintone API失敗時に `502 Bad Gateway` |

## 入力データ

```json
{
  "company_name": "株式会社サンプル",
  "contact_name": "山田太郎",
  "deal_name": "営業DX相談",
  "lead_source": "Web問い合わせ",
  "inquiry_text": "現在Excelで営業案件を管理しています。担当者ごとに入力内容がバラバラで、対応漏れも発生しています。"
}
```

必須項目:
- `company_name`
- `deal_name`
- `inquiry_text`

## AI分析結果

Difyから次の4項目を受け取ります。

| Dify出力 | kintone |
| --- | --- |
| `summary` | `deal_memo` |
| `category` | `inquiry_category` |
| `customer_issue` | `customer_issue` |
| `next_action` | `next_action` |

## レスポンス

| ケース | HTTP | メッセージ |
| --- | ---: | --- |
| 正常登録 | 201 | 商談を登録しました。 |
| 必須項目不足 | 400 | 必須項目が不足しています。 |
| Dify失敗 / 接続不能 | 502 | 問い合わせ内容のAI解析に失敗しました。 |
| kintone API失敗 | 502 | kintoneへの登録に失敗しました。 |

## ローカル起動

```bash
cd n8n
docker compose up -d
```

n8n:
```text
http://localhost:5678
```

テストWebhook:
```text
http://localhost:5678/webhook-test/sales-inquiry
```

Production Webhook:
```text
http://localhost:5678/webhook/sales-inquiry
```

Test URLはn8n側で `Execute workflow` を押して待受状態にしてから呼び出します。

## Credentials

認証値はWorkflow JSONへ直接保存しません。

- Dify: Header Auth / `Authorization: Bearer <DIFY_API_KEY>`
- kintone: Header Auth / `X-Cybozu-API-Token: <KINTONE_API_TOKEN>`

Import後に各HTTP Request NodeへCredentialsを再設定します。

## WorkflowのImport

統合版:
```text
n8n/workflows/sales-inquiry-to-dify-kintone.json
```

Phase 2版:
```text
n8n/workflows/sales-inquiry-to-kintone.json
```

統合版JSONは公開・共有用に、kintone実サブドメイン、Credential参照ID、Workflow固有IDなどの環境依存情報を除去しています。

## 動作確認

| ケース | 結果 |
| --- | --- |
| 正常問い合わせ → Dify分析 → kintone登録 → 201 | ✅ |
| `inquiry_text` 欠落 → 400 | ✅ |
| Dify停止 → 502 AI解析エラー | ✅ |
| kintone API失敗 → 502 APIエラー | ✅ |

詳細な統合設計とテスト内容は [integration.md](integration.md) を参照してください。
