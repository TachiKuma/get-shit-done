# GSD ドキュメント

Get Shit Done（GSD）フレームワークの包括的なドキュメントです。GSD は、AI コーディングエージェント向けのメタプロンプティング、コンテキストエンジニアリング、仕様駆動開発システムです。

言語版: [English](../README.md) · [Português (pt-BR)](../pt-BR/README.md) · **日本語** · [简体中文](../zh-CN/README.md) · [한국어](../ko-KR/README.md)

英語の [`../README.md`](../README.md) が canonical docs index です。このページは日本語 mirror として同じ目次責務を保ち、未翻訳ページは英語 fallback として明示します。

## ドキュメント一覧

| ドキュメント | 対象読者 | 説明 |
|------------|---------|------|
| [アーキテクチャ](ARCHITECTURE.md) | コントリビューター、上級ユーザー | システムアーキテクチャ、エージェントモデル、データフロー、内部設計 |
| [機能リファレンス](FEATURES.md) | 全ユーザー | 全機能の詳細ドキュメントと要件 |
| [コマンドリファレンス](COMMANDS.md) | 全ユーザー | 全コマンドの構文、フラグ、オプション、使用例 |
| [設定リファレンス](CONFIGURATION.md) | 全ユーザー | 設定スキーマ、ワークフロートグル、モデルプロファイル、Git ブランチ |
| [CLI ツールリファレンス](CLI-TOOLS.md) | コントリビューター、エージェント作成者 | `gsd-tools.cjs` のプログラマティック API（ワークフローおよびエージェント向け） |
| [エージェントリファレンス](AGENTS.md) | コントリビューター、上級ユーザー | 全18種の専門エージェント — 役割、ツール、スポーンパターン |
| [ユーザーガイド](USER-GUIDE.md) | 全ユーザー | ワークフローのウォークスルー、トラブルシューティング、リカバリー |
| [コンテキストモニター](context-monitor.md) | 全ユーザー | コンテキストウィンドウ監視フックのアーキテクチャ |
| [ディスカスモード](workflow-discuss-mode.md) | 全ユーザー | discuss フェーズにおける assumptions モードと interview モード |

## クイックリンク

- **最新のリリース情報:** [CHANGELOG](../CHANGELOG.md) と canonical の [English README](../README.md#v1360-highlights) を参照してください
- **はじめに:** [README](../README.md) → インストール → `/gsd-new-project`
- **ワークフロー完全ガイド:** [ユーザーガイド](USER-GUIDE.md)
- **コマンド一覧:** [コマンドリファレンス](COMMANDS.md)
- **GSD の設定:** [設定リファレンス](CONFIGURATION.md)
- **システム内部の仕組み:** [アーキテクチャ](ARCHITECTURE.md)
- **コントリビュートや拡張:** [CLI ツールリファレンス](CLI-TOOLS.md) + [エージェントリファレンス](AGENTS.md)
- **手動更新:** [manual-update.md](../manual-update.md) は現在英語 canonical のままです。必要に応じて英語へ fallback してください。
