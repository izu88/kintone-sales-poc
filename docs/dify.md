# Dify連携

## 概要

Web問い合わせ本文をDifyのWorkflowで分析し、営業担当者の初回対応に必要な情報を構造化して返すPoCです。

問い合わせ本文から次の4項目を生成します。

- 要約（`summary`）
- カテゴリ（`category`）
- 顧客課題（`customer_issue`）
- 次回アクション（`next_action`）

## Workflow

```text
ユーザー入力
  inquiry_text
      ↓
LLM
      ↓
コード実行
      ↓
出力
```

![Dify営業問い合わせ分析Workflow](images/07-dify-workflow.jpg)

## Nodeの役割

| Node | 役割 |
| --- | --- |
| ユーザー入力 | 問い合わせ本文を `inquiry_text` として受け取る |
| LLM | 問い合わせを要約・分類し、顧客課題と次回アクションを生成 |
| コード実行 | LLMのJSON文字列を解析し、4項目へ整形 |
| 出力 | 4項目をフラットなJSONとして返却 |

## LLM設定

OpenRouter Providerを利用し、モデルはPoC時点で `openrouter/auto` を設定しています。

システムプロンプトでは次をルール化しています。

- 入力に書かれていない事実を推測しない
- 問い合わせ内容を簡潔に要約する
- 顧客が解決したい課題を抽出する
- 問い合わせカテゴリを分類する
- 営業担当者が次に行うべき具体的なアクションを1つ提案する
- 日本語で出力する

カテゴリは次の5種類です。

- 営業業務改善
- AI導入
- Web制作
- システム開発
- その他

## Structured Outputのフォールバック

LLM NodeではStructured Outputを有効にしていますが、PoCで使用したモデルではDify上でネイティブ対応せず、プロンプトインジェクションへフォールバックしました。

公開APIからStructured Outputの子変数を直接出力した場合は `null` になったため、LLMの `text` をCode Nodeへ渡し、JSONとして解析する構成に変更しています。

Code Nodeでは次を実施します。

1. `<think>...</think>` が存在する場合は除去
2. Markdownの ```json` コードフェンスが存在する場合は除去
3. `json.loads()` で解析
4. 4項目をstringとして返却

これにより、公開APIでも次の形式で安定して返却できることを確認しました。

```json
{
  "summary": "問い合わせ内容の要約",
  "category": "営業業務改善",
  "customer_issue": "顧客が解決したい課題",
  "next_action": "営業担当者が次に行うアクション"
}
```

## API実行

WorkflowをPublish後、DifyのAPIキーを発行して実行します。

```bash
curl -X POST 'http://localhost/v1/workflows/run' \
  -H 'Authorization: Bearer YOUR_DIFY_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": {
      "inquiry_text": "現在Excelで営業案件を管理しています。担当者ごとに入力内容がバラバラで、対応漏れも発生しています。kintoneやAIを使って営業管理を効率化したいです。"
    },
    "response_mode": "blocking",
    "user": "poc-test-user"
  }'
```

APIキーはGit管理対象にしません。

## 動作確認

次のケースでWorkflowの出力を確認しています。

| ケース | category | 結果 |
| --- | --- | --- |
| Excel営業管理・対応漏れの改善相談 | 営業業務改善 | ✅ |
| 社内FAQへの生成AI導入相談 | AI導入 | ✅ |
| コーポレートサイト・採用ページのリニューアル相談 | Web制作 | ✅ |
| 公開Workflow APIから4項目を返却 | - | ✅ |

API実行では `status: succeeded` となり、`summary` / `category` / `customer_issue` / `next_action` の4項目が実値で返ることを確認しています。

## WorkflowのImport

Dify DSLは次に保存しています。

```text
dify/workflows/sales-inquiry-analyzer.yml
```

DifyのStudioからDSLをImportし、利用環境側でOpenRouter ProviderとAPIキーを設定します。

DSLにはAPIキーを保存しません。

## ファイル構成

```text
dify/
└─ workflows/
   └─ sales-inquiry-analyzer.yml
```

## 設計方針

この規模の処理はn8nからLLM APIを直接呼び出しても実装できます。

このPoCでは、問い合わせ受付・分岐・外部サービス連携をn8n、AIのプロンプト・モデル・出力設計をDifyへ分離する構成も検証しています。

AI処理の再利用、プロンプト管理、将来的なRAG追加などが必要になった場合にDify側を独立して変更できることを狙っています。

## 次のPhase

次はPhase 4として、既存のn8n WorkflowからDify APIを呼び出します。

```text
Web問い合わせ
↓
n8n
↓
Dify API
├─ summary
├─ category
├─ customer_issue
└─ next_action
↓
n8n
↓
kintone
```

Difyの出力をkintoneの `deal_memo` / `customer_issue` / `next_action` へマッピングし、問い合わせ受付からAI分析・商談登録までを一連のWorkflowにします。
