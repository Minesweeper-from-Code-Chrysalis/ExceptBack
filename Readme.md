
# ExceptBack
## これは何？
Exceptのバックエンド向けのProjectです。
## 疎通確認手順
・git cloneしたあと、以下の手順でローカルDBをセットアップしてください。
- [ ] yarn install
- [ ] 疎通確認(GET)
　- [ ] node index.js
　- [ ] GET　　http://localhost:3000/
- [ ] config/config.jsonを自分用のDB設定に書き換える
　- [ ] username, passwordを3か所書き換える
- [ ] DBを作成する
　yarn sequelize db:create
- [ ] Migrationする
　yarn sequelize db:migrate
- [ ] 疎通確認(POST)
　- [ ] node index.js
　- [ ] POST　　http://localhost:3000/create

★★★
-[ ] 下記のURLにInsomniaでアクセスする（データ作成）
http://localhost:3000/create

-[ ] 下記のURLにInsomniaでアクセスしてconsole.logに9が表示されることを確認する
http://localhost:3000/shops?areaCode=AREAS2464&keyword=焼肉&exceptWord=汚

Test　TBLを作成しています。マイグレーションを忘れずに！！
念のためpackage.jsonも反映してください。。


## 参考URL
　https://qiita.com/yusuke-ka/items/448843020c0406363ba5