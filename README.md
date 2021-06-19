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