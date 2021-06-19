# github-actions-practice

Reference: https://booth.pm/ja/items/1865906

## 2021/06/19現在との挙動の違い

- npm-scriptsには自前で設定をする
  - `npm test` : `mocha`
  - `npm run lint` : `eslint .`

- CIで利用するnodeコマンドのアクションは `v2` 以降を利用する(基本的にlatestで良い)