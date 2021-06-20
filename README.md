
[![Continuous Integration](https://github.com/koolii/github-actions-practice/actions/workflows/ci.yml/badge.svg)](https://github.com/koolii/github-actions-practice/actions/workflows/ci.yml)
# github-actions-practice


Reference: https://booth.pm/ja/items/1865906

## 2021/06/19現在との挙動の違い

- npm-scriptsには自前で設定をする
  - `npm test` : `mocha`
  - `npm run lint` : `eslint .`

- CIで利用するnodeコマンドのアクションは `v2` 以降を利用する(基本的にlatestで良い)

## action/cache

- キャッシュの保存は該当ジョブが成功したときのみ保存される
- キャッシュの無効化はできないので、新しいキーでキャッシュを作成しなおすことになる
  - プレフィックスでバージョン情報を付与すると管理がしやすい
- キャッシュ情報の閲覧が可能なため秘密情報はキャッシュしない
- TTLは7日間、サイズ上限は5GBで、超過時は古いものから削除される

### キャッシュ探索について

ワークフローによってもキャッシュ探索は異なるが、基本は keyで完全一致キャッシュを探し、なければ restore-keysで前方一致検索となる

- push: 現在のブランチ => デフォルトブランチ
- pull_request: 現在のブランチ => ベースブランチ => デフォルトブランチ

### npmパッケージとして利用する

ref: https://github.com/actions/cache/blob/master/examples.md

- パラメータ
  - path: キャッシュを保存・復元するパス情報
  - key: 複合キー
  - restore-keys: keyに完全一致するキャッシュが存在しなかった時に使われるキー一覧
- アウトプット
  - cache-hit: keyに完全一致するキャッシュが存在したかどうか
    - restore-keysでマッチングしてもfalse

## アーティファクト

ビルド後のバイナリやアーカイブ・カバレッジ情報等を保存したい時に利用する機能
90日後にリセットされる

## actions/upload-artifact

- パラメータ
  - name: アーティファクト名
  - path: アーティファクトとしてアップロードするファイル(ディレクトリ)

## actions/download-artifact

アーティファクトをダウンロードする
ワークフローで複数ジョブ間でアーティファクト経由でファイルの受け渡しが可能

- パラメータ
  - name: アーティファクト名(省略時は全てのアーティファクトがダウンロード対象)
  - path: ダウンロードして展開先のパス(省略時はworkspace下に展開)

## キャッシュ vs アーティファクト

キャッシュは、ジョブやワークフローの複数の実行の間でファイルを再利用することが目的
基本的には、依存パッケージのような、たまにしか変更されないようなファイルに対して使用する

アーティファクトは、ワークフローの一回の実行内でファイルを複数のジョブ間で受け渡したり、
ワークフロー完了後に利用するファイルを保存するために使用する

## pull_requestイベントの注意

次のアクティビティ以外だと typesを追記し、反応するアクティビティを追加する

```yml
# e.g.
on:
  pull_request:
    types: [labeled, unlabeled]
```

- opened: PR作成時
- synchronize: 既存PRがpush更新時
- reopened: リオープン時

## GITHUB_SHA

- push時: pushされたコミットのSHA
- issue_comment: デフォルトブランチの最新コミット
...

## respository_dispatch イベント

外部からGithubActions(ワークフロー)を実行させる時のイベント

## ログ(echo等)でコマンド実行

ワークフロー内部で文字列を出力することでコマンドを実行出来る

### 種類

- `set-env`: 環境変数の設定
- `set-output`: アウトプットの設定
- `add-path`: PATH の追加
- `debug|warning|error`: メッセージの出力
  - デバッグメッセージは `ACTIONS_STEP_DEBUG` をtrueに設定しないと表示されない
- `add-mask`: ログのマスク (※秘密情報で扱うべき)
- `stop-commands`: コマンド実行の停止・再開

### フォーマット

```bash
$ echo "::<COMMAND> <PARAM1>=<VALUE1>,<PARAM2>=<VALUE2>::<COMMAND VALUE>"

# TZ環境変数に Asia/Tokyo の値を設定
$ echo "::set-env name=TZ::Asia/Tokyo"
# steps.<step_id>.outputs.result に true を設定
$ echo "::set-output name=result::true"
# PATHの先頭に追加される、add-pathを実行したstepでは反映されていない
$ echo "::add-path:${{ github.workspace }}"
# メッセージ出力
$ echo "::debug::Debug Message"
$ echo "::warning::Warning Message"
# プルリクエストのファイル差分上に警告メッセージを表示
$ echo "::warning file=README.md,line=1,col=1::Warning Message"
# 特定の文字列(password)をマスクしてログに出ないようにする
$ echo "::add-mask::password"
# このコマンド実行後はコマンドが処理されなくなる
$ echo "::stop-commands:stop"
# 処理されなくなっていたものを再度有効化
$ echo "::stop::"
```

## セルフホストランナー

飛ばす。
自分で用意したVM上等でワークフローを実行させる

## REST API

ref: https://developer.github.com/v3/actions/

- アーティファクトの情報取得、ダウンロード、削除
- 秘密情報の設定、削除
- セルフホストランナーのステータスの取得
- ワークフローの実行情報の取得、再実行、キャンセル

# アクション

JavaScript/Dockerと種別がある
※ JavaScriptのほうが直接実行できる関係で速いが、Dockerはコンテナとして同一の環境を構築可能
## アクションの保存場所

public: 別repoとして作成する
private: `.github/actions/action-a` などのようにリポジトリ内でディレクトリを掘って管理することを推奨

## アクションの利用(バージョン指定)

外部公開されているpublicなアクションは `uses:` を使って定義する

`actions/setup-node@v1.4.0`

バージョンは、commit SHA/タグ/ブランチから設定可能

# サンプル(ユースケース)

- slackに通知: `rtCamp/action-slack-notify`
- ssh接続: `mxschmitt/action-tmate`
- DockerイメージをGithub Packages公開: `docker/build-push-action`
- reviewdogでLint結果をWEB内に表示: `reviewdog/action-eslint`
- TerraformでAWSにデプロイ: `hashicorp/terraform-github-actions`