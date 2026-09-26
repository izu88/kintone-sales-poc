# kintone-sales-poc

BtoB営業部門の商談管理を題材にした、kintone業務改善PoCです。

## 目的

Excel・メール・個人管理に分散した営業情報をkintoneへ集約し、
商談進捗、担当者、次回対応、商談確度、金額などを一元管理します。

## 想定課題

- 商談情報が複数ツールに分散している
- Excelへの転記が発生している
- 次回対応日の見落としが起きる
- 商談ステータスを一覧で把握しづらい
- 担当者ごとに記録粒度が異なる

## 進捗

- [x] kintone開発者環境
- [x] 営業商談管理アプリ設計
- [x] フォーム / フィールドコード
- [x] プロセス管理
- [x] 一覧
- [x] ダミーデータ
- [x] 期限超過警告
- [x] 受注・失注時の業務ルール制御
- [ ] REST API実機検証
- [ ] APIテスト結果反映
- [ ] kintone編のポートフォリオ仕上げ
- [ ] n8n連携
- [ ] Dify連携
- [ ] n8n + Dify + kintone統合PoC

## PoC範囲

1. kintoneアプリ設計
2. 一覧・プロセス管理
3. ダミーデータ投入
4. JavaScriptカスタマイズ
5. REST API連携
6. テスト
7. As-Is / To-Be整理

## JavaScriptカスタマイズ

- 次回対応期限を過ぎた未完了案件に警告を表示
- 「受注」へ進む場合は金額を必須化
- 「失注」へ進む場合は失注理由を必須化

## REST API

Node.js 20+ の標準 `fetch` を利用し、外部から次の操作を検証します。

- 商談一覧取得（GET）
- 新規商談登録（POST）
- 商談更新（PUT）
- プロセス管理のアクション実行（PUT）

セットアップと実行方法は `docs/rest-api.md` を参照してください。

## アプリの主なフィールド

| 項目 | フィールドコード |
| --- | --- |
| 会社名 | `company_name` |
| 担当者名 | `contact_name` |
| 商談名 | `deal_name` |
| 流入経路 | `lead_source` |
| 顧客課題 | `customer_issue` |
| 商談メモ | `deal_memo` |
| 担当営業 | `sales_rep` |
| 商談確度 | `probability` |
| 次回アクション | `next_action` |
| 次回対応日 | `next_action_date` |
| 金額 | `amount` |
| 失注理由 | `lost_reason` |

## プロセス

`新規 → 初回対応 → ヒアリング → 提案 → 商談中 → 受注 / 失注`

## ディレクトリ

```text
.
├─ README.md
├─ package.json
├─ .env.example
├─ .gitignore
├─ data/
│  └─ dummy-sales.csv
├─ docs/
│  ├─ as-is.md
│  ├─ to-be.md
│  ├─ app-design.md
│  ├─ rest-api.md
│  └─ test-plan.md
└─ src/
   ├─ customization/
   │  └─ sales-poc.js
   └─ api/
      ├─ kintone-client.js
      ├─ list-records.js
      ├─ create-record.js
      ├─ update-record.js
      └─ update-status.js
```

## 今後の拡張

- n8nによる問い合わせ自動登録
- Difyによる要約・分類・次回アクション生成
- Teams等への通知

## 注意

このリポジトリには実在顧客の情報、APIトークン、認証情報を保存しません。
掲載データはすべて架空データです。
