# KUSUDAMA

**自分では割れない、誰かに贈るためのくす玉。**

物ではなく、祝福する瞬間を贈るアプリです。白い空間に浮かぶ金色のくす玉に言葉を込めて、URLを相手へ送ります。

### [KUSUDAMAを開く / Open the app](https://kusudama.sunny-seed-0354.chatgpt.site)

インストール不要。iPhone・Android・PCのブラウザで使えます。ホーム画面への追加にも対応しています。

| 開く前 | 開いた後 |
| --- | --- |
| ![閉じた金色のくす玉](docs/closed.png) | ![開いたくす玉と祝福の垂れ幕](docs/opened.png) |

画像は実際のアプリの描画処理から書き出した表示例です。端末によって文字の書体は変わります。

## 使い方

1. 垂れ幕に出すメッセージを入力します。
2. 「くす玉を贈る」を押し、「贈るURL」を相手へ送ります。
3. 「あなた専用の確認URL」は、送り主の手元に残します。
4. 受け取った人が赤い紐を下へ引くと、くす玉が開きます。
5. 紙吹雪と紙テープが舞い、メッセージの垂れ幕が下ります。
6. 開いた状態を画像として保存できます。

送り主の通常画面に開封操作はありません。確認画面には「まだ割られていません」「割られました 🎊」という開封状況だけが表示されます。

## メッセージと改行

**改行を除いて36文字・最大3列**です。入力欄で改行すると、垂れ幕では左隣の縦列に続きます。

```text
お誕生日
おめでとうございます
```

この場合、右の縦列が「お誕生日」、左の縦列が「おめでとうございます」です。改行なしなら自動で折り返します。指定した列が長いときは文字を小さくして収めます。

## 一度きりの体験

- URLを開くだけでは使用済みになりません。
- 紐を引いて開封がサーバーで確定した時点で使用済みになります。
- 複数端末から同時に開いても、成功するのは一端末だけです。
- 開封したブラウザでは、再読み込みしても開いた状態に戻り、画像保存を続けられます。
- 別の端末では「すでに割られています」と表示されます。

開いた瞬間に赤い引き紐は下へ抜け落ちて消え、垂れ幕を吊るす二本の紐が残ります。

## 画像の保存

PCでは「画像を保存する」からPNGを保存します。スマートフォンでは保存用画像を表示するので、画像を長押ししてください。対応端末では共有シートも使えます。

LINE内で保存できない場合は「標準ブラウザで開いて保存する」を使います。開封済み状態を引き継ぎ、ChromeやSafariで保存できます。端末やアプリのバージョンによって操作は異なります。

開封した端末のブラウザデータを消すと、開封済み画像に戻れなくなる場合があります。贈るURL・確認URL・保存用引き継ぎURLは、それぞれ渡す相手に注意してください。

## 技術構成

React / Vinext、Cloudflare Workers、Cloudflare D1を使用しています。

| ファイル | 役割 |
| --- | --- |
| `app/page.tsx` | 作成・共有・受取・確認・画像保存の画面 |
| `app/scene.tsx` | Canvasで描くくす玉・紐・紙吹雪・垂れ幕 |
| `lib/gifts.js` | 作成・一度だけの開封・開封状況のAPI |
| `lib/message-layout.js` | 文字数・改行・縦列の処理 |
| `db/schema.ts`, `drizzle/` | D1のスキーマと移行SQL |
| `public/` | 写真風素材とPWAファイル |

D1の条件付きUPDATEで同時開封を制御し、端末の受取証によって中断後の再試行を冪等にしています。受取用・確認用の秘密鍵を分け、データベースにはそのSHA-256を保存します。作成・開封にはインターネット接続が必要です。

ログインを要求しないため、送り主の判定は作成したブラウザのCookieを使います。同じ人物が別端末を使うことまで本人判定する仕組みではありません。

## 開発・公開

Node.js 24以上とpnpm 11を使用します。

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npm run dev
```

別のCloudflareアカウントへ公開する場合は、D1データベースを作成して `DB` bindingを設定し、`drizzle/` のSQLを適用してからWorkerをデプロイします。`.openai/hosting.json` は再利用用にSite固有のIDを除いてあります。静的なGitHub Pagesだけではサーバー管理による一度限りの開封は動作しません。

現在の公開アプリは上記の **Open the app** から利用できます。このリポジトリに実際のメッセージや開封データは含まれません。

## 検証

```sh
node node_modules/typescript/bin/tsc --noEmit
node tests/message-layout.test.mjs
node tests/gifts.test.mjs
npm run build
node tests/built.test.mjs
```

実際のMiniflare/D1で、未消費GET・送り主制限・秘密鍵の分離・並列開封・冪等な再試行・受取証による復帰を検証しています。文字数と改行、ビルド済みWorkerの画面・API・素材・PWAファイルも検証対象です。iPhone/Android/LINEの実機操作を全ての環境で検証済みという意味ではありません。

写真風素材は画像生成で制作しました。使用プロンプトは [ASSET-PROMPT.md](ASSET-PROMPT.md) に記録しています。

## English

**A kusudama you cannot open yourself, made to give to someone else.**

Write a message and send a dedicated URL. The recipient pulls the red cord downward to open the golden ball. Confetti and paper ribbons spill out, revealing a hanging message banner. The opened scene can be saved as an image.

Opening the URL does not consume the gift. The server records it as opened only when the recipient pulls the cord. An atomic database update prevents duplicate openings across devices. The sender has a separate status URL.

Messages support up to **36 visible characters, excluding line breaks, across three vertical columns**. A line break starts the next column to the left. The app runs in a browser without installation and can be added to the home screen.

[Open KUSUDAMA](https://kusudama.sunny-seed-0354.chatgpt.site)

---

Created by **Masato Nasu / 那須雅人** · [MASATO LAB](https://masato-lab.pages.dev/)


## 開封確認へ何度でも戻る

トップ画面の「贈ったくす玉の開封確認」から、作成したくす玉を一覧で確認できます。相手の名前・自分用メモ、メッセージ、作成日時、開封状況で区別できます。名前・メモは後から変更でき、受け取る相手には表示されません。

以前のくす玉も、作成したときのブラウザのCookieが残っていれば表示されます。別の端末やブラウザでは、作成時の確認URLを使ってください。同じメッセージ・名前でも、くす玉は毎回別IDなので上書きされません。

保存するPNGの名前にも日時と識別子を付けるようにしました。題名を変えずに繰り返し保存できます。
