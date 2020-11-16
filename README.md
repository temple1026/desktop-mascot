# Desktop Mascot (Live2D SDK for WebGL + Electron)

Live2D SDK for WebGL版(TypeScript) + Electronで実装したデスクトップマスコットです．

自作のモデルで動かしたデモ([youtube](https://www.youtube.com/watch?v=73adU-2Y5qw))
はこちら．

## 準備
1. [Cubism SDK for Web](https://www.live2d.com/download/cubism-sdk/download-web/) 使用許諾契約に同意した上でCubism SDK for WebとCubism Core for WebをDLする

1. DLしたフォルダを解凍し，SDKのFrameworkとCoreフォルダをtsconfig.jsonと同じフォルダに置く

1. [公式の手順](https://docs.live2d.com/cubism-sdk-tutorials/sample-build-web/?locale=ja)通りNodejsをインストールする

## 実行方法

※ 現時点(2020/11/17時点)では./assetsの中にモデルがないのでそのままでは動きません．後日公開予定．

※ モーションの切り替えには外部との通信を行うことを想定しているためデスクトップマスコット実行前にws_mascot.pyを実行する必要があります

1. モデルを準備する(後日公開)

1. package.jsonのbuildを実行し，elecを実行



## ライセンスについて

```
本ソースコードはLive2D Cubism SDKを使用しており、本ソースコードを使用してコンテンツを制作する場合はLive2D Proprietary Licenseへの同意が必要となります。https://www.live2d.jp/terms/live2d-proprietary-software-license-agreement/
※上記はCubism Core for Web をダウンロードする際に確認できます。

また、制作したコンテンツを公開する場合は SDKリリースライセンスへの同意が必要です。
https://www.live2d.com/download/cubism-sdk/release-license/
※2020年11月現在、 直近売上が1,000 万円未満の小規模事業者・個人・学生・サークル・その他の団体については無償で作品をリリースできます。
（拡張性アプリケーションに該当するコンテンツはその限りではありません。）
```

## 履歴

- 2020/11/17 公開