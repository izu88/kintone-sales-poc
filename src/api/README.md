# REST API

Node.jsからkintone REST APIを呼び出す検証コードです。

## ファイル

- `kintone-client.js` - 認証・HTTPリクエスト共通処理
- `list-records.js` - 商談一覧取得
- `create-record.js` - 新規商談登録
- `update-record.js` - 商談更新
- `update-status.js` - プロセス管理のアクション実行

実行方法は `../../docs/rest-api.md` を参照してください。

認証情報は `.env` に保存し、Gitにはコミットしません。
