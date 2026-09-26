# REST API 検証

## 目的

Node.jsからkintone REST APIを呼び出し、外部システムから商談データを操作できることを確認します。

## 前提

- Node.js 20+
- kintone「営業商談管理」アプリ
- APIトークン
- アプリID

## 1. APIトークンを発行

kintoneのアプリ設定から「APIトークン」を開き、トークンを生成します。

PoCでは次の権限を有効にします。

- レコード閲覧
- レコード追加
- レコード編集

設定後は「保存」だけでなく「アプリを更新」まで実行してください。

> APIトークンはGitにコミットしません。

## 2. .envを作成

`.env.example` をコピーして `.env` を作ります。

```env
KINTONE_BASE_URL=https://YOUR_SUBDOMAIN.cybozu.com
KINTONE_APP_ID=1
KINTONE_API_TOKEN=YOUR_API_TOKEN
```

## 3. APIを実行

### GET: 商談一覧

```bash
npm run api:list
```

### POST: サンプル商談登録

```bash
npm run api:create
```

### PUT: 既存商談更新

レコードID 10を更新する例:

```bash
npm run api:update -- 10
```

### PUT: プロセス管理のアクション実行

レコードID 10で「初回対応へ」を実行する例:

```bash
npm run api:status -- 10 "初回対応へ"
```

ステータス名を直接上書きするのではなく、プロセス管理に登録した「アクション名」を指定します。

## 検証項目

| ID | 操作 | 期待結果 |
| --- | --- | --- |
| API01 | GET | 商談一覧をJSONから取得できる |
| API02 | POST | kintoneに新規商談が作成される |
| API03 | PUT | 商談確度・次回アクション・次回対応日が更新される |
| API04 | Status PUT | 指定したプロセスアクションが実行される |
| API05 | 認証情報未設定 | 実行前に環境変数エラーになる |

## セキュリティ

- APIトークンは `.env` のみに保存
- `.env` は `.gitignore` 対象
- READMEやスクリーンショットに実トークンを載せない
- 実案件では必要最小限のAPI権限を設定
