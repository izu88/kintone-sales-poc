# n8n + Dify + kintone 統合

## 概要

Web問い合わせをn8nで受信し、Dify Workflow APIで問い合わせ本文をAI分析したうえで、分析結果をkintoneの商談レコードへ登録するPhase 4の統合PoCです。

![n8n + Dify + kintone統合Workflow](images/08-n8n-dify-kintone-workflow.svg)

## 全体フロー

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

## 入力

```json
{
  "company_name": "株式会社サンプル",
  "contact_name": "山田太郎",
  "deal_name": "営業DX相談",
  "lead_source": "Web問い合わせ",
  "inquiry_text": "現在Excelで営業案件を管理しています。担当者ごとに入力内容がバラバラで、対応漏れも発生しています。"
}
```

必須:
- `company_name`
- `deal_name`
- `inquiry_text`

## Dify連携

n8nコンテナからMacホスト上のDifyへ接続するため、ローカル検証では次のURLを使用します。

```text
http://host.docker.internal/v1/workflows/run
```

Body:

```json
{
  "inputs": {
    "inquiry_text": "<問い合わせ本文>"
  },
  "response_mode": "blocking",
  "user": "n8n-sales-poc"
}
```

DifyのHTTPレスポンスはFull Responseを有効化しているため、AI結果は `body.data.outputs` 配下から参照します。

## AI出力とkintoneマッピング

| Dify | n8n整形 | kintone |
| --- | --- | --- |
| `summary` | `summary` | `deal_memo` |
| `category` | `inquiry_category` | `inquiry_category` |
| `customer_issue` | `customer_issue` | `customer_issue` |
| `next_action` | `next_action` | `next_action` |

元問い合わせの `company_name` / `contact_name` / `deal_name` / `lead_source` も保持し、商談確度は初期値 `C` としています。

## エラーハンドリング

| 条件 | HTTP | 処理 |
| --- | ---: | --- |
| 必須項目不足 | 400 | Dify / kintoneへ進まず終了 |
| Difyが `succeeded` 以外 | 502 | AI解析エラー |
| Dify停止・接続不能 | 502 | HTTP RequestのError OutputからAI解析エラー |
| kintone API失敗 | 502 | APIエラー |
| 正常登録 | 201 | `recordId` / `revision` を返却 |

DifyのHTTP Request Nodeでは接続エラーでWorkflow全体が500終了しないよう、`On Error: Continue (using error output)` を使用しています。

## 実機テスト

2026-09-30に次を確認しました。

| ケース | 結果 |
| --- | --- |
| 正常入力 → Dify分析 → kintone登録 | ✅ |
| AI要約・カテゴリ・顧客課題・次回アクションがkintoneへ反映 | ✅ |
| `inquiry_text` 欠落 | ✅ 400 |
| Dify停止 | ✅ 502 |
| kintone App IDを一時的に不正値へ変更 | ✅ 502 |

正常系ではkintoneへ次のAI生成値が登録されることを確認しました。

- 問い合わせカテゴリ
- 顧客課題
- 商談メモ（要約）
- 次回アクション

## Credentials

認証値はWorkflow JSONへ埋め込みません。

### Dify

Header Auth:

```text
Authorization: Bearer <DIFY_API_KEY>
```

### kintone

Header Auth:

```text
X-Cybozu-API-Token: <KINTONE_API_TOKEN>
```

## Workflow JSON

```text
n8n/workflows/sales-inquiry-to-dify-kintone.json
```

共有用JSONでは次をサニタイズしています。

- kintone実サブドメイン → `YOUR_SUBDOMAIN`
- Credential参照情報を削除
- Workflow / instance固有IDを削除
- `active: false` にしてImport直後の誤作動を防止

Import後は、kintone App ID、接続先サブドメイン、Dify / kintone Credentialsを利用環境に合わせて設定します。

## ローカル実行時のリソース

16GB MacでDifyとn8nを同時起動する場合、Rancher Desktopの2 CPU / 約4GB割当ではDify応答が停滞するケースがありました。検証時は4 CPU / 約8GBへ増量して安定動作を確認しています。

常時同時起動する必要がない場合は、設定・編集時は片方のみを起動し、統合テスト時だけ両方を起動すると負荷を抑えられます。
