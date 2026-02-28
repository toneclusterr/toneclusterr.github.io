# 変更ログ (Add YouTube and Niconico Embed to Works)

## 2026-02-28
- **変更内容**: `js/content-loader.js` の `buildWorksHTML` 関数を修正し、`youtube_url` のデータがある場合は `releases.html` と同じ形式の YouTube 埋め込みプレイヤーを表示するようにしました。
- **理由**: ユーザーが `works` のスプレッドシートに `youtube_url` 列を追加したため、そのデータを画面に反映させる必要があったためです。
- **追加の改善**: `description` のテキストで `|` を改行 (`<br>`) に変換する処理を追加し、`releases` と同様の表示になるようにしました。

- **変更内容**: 同様の `buildWorksHTML` 関数を修正し、`niconico_url` がある場合は ニコニコ動画 の埋め込みプレイヤーをYouTubeと同じ形式・サイズで表示するように追加しました。
- **理由**: ユーザーがYouTubeに加えて、ニコニコ動画の埋め込みも対応してほしいと要望があったためです。

- **変更内容**: `buildReleasesHTML` 関数の `youtube_id` 処理も修正し、直書きのIDだけでなくURL全体が入力された場合にも自動で動画IDを抽出して表示できるように改善しました。
- **理由**: `releases` 側でYouTubeのURL全体を貼り付けると動画が正しく表示されないというユーザーの問題を解消するためです。
