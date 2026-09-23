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

## PoC範囲

1. kintoneアプリ設計
2. 一覧・プロセス管理
3. ダミーデータ投入
4. JavaScriptカスタマイズ
5. REST API連携
6. テスト
7. As-Is / To-Be整理

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
├─ .env.example
├─ .gitignore
├─ data/
│  └─ dummy-sales.csv
├─ docs/
│  ├─ as-is.md
│  ├─ to-be.md
│  ├─ app-design.md
│  └─ test-plan.md
└─ src/
   ├─ customization/
   │  └─ sales-poc.js
   └─ api/
      └─ README.md
```

## 今後の拡張

- 期限超過警告
- 受注時の金額必須チェック
- 失注時の失注理由必須チェック
- kintone REST API連携
- n8nによる問い合わせ自動登録
- Difyによる要約・分類・次回アクション生成
- Teams等への通知

## 注意

このリポジトリには実在顧客の情報、APIトークン、認証情報を保存しません。
掲載データはすべて架空データです。
