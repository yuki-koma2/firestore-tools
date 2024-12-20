# firestore-tools

## 使用方法

```bash
pnpm run generate --input {inputYamlFile} --output ./outputDir
```

generateコマンドは、指定されたYAMLファイルを読み込み、Firestoreのデータベースに対応するコードを生成します。

### 出力

- firestore.rules
- firestore.indexes.json (未対応)
- orm.ts
- schema.ts  (未対応)
- types.ts  (未対応)
- utils.ts (未対応)
- {collectionName}.ts (未対応)
- {collectionName}.test.ts (未対応)
- {collectionName}.spec.ts (未対応)
- {collectionName}.mock.ts (未対応)
- {collectionName}.mock.json (未対応)

## サンプルコードでの動かし方

```bash
pnpm run generate --input ./sample/schema.yaml --output ./output
```

## GitHub Actions テストの実行

```bash
brew install act
act --container-architecture linux/amd64 -W .github/workflows/ci.yml 
```

## ストレージ確認
```bash
# 不要なデータ削除
rm -rf ~/Library/Caches/*
brew cleanup -s
rm -rf ~/Library/Developer/Xcode/DerivedData/*
xcrun simctl delete unavailable
pnpm store prune
docker system prune -a -f --volumes
sudo rm -rf /private/var/log/*
rm -rf ~/.Trash/*

# Docker関連のキャッシュ削除
sudo rm -rf /System/Volumes/Data/var/lib/docker/tmp/*
sudo rm -rf /System/Volumes/Data/var/run/docker/*

# ストレージ確認
df -h
```

## IssueとPRのテンプレート

リポジトリに基本的なIssueとPRのテンプレートを追加しました。これらのテンプレートは、`.github`ディレクトリにあります。これらのテンプレートは、Issueの報告やプルリクエストの提出プロセスを効率化するのに役立ちます。

### Issueテンプレート

Issueテンプレートには、タイトル、説明、再現手順、期待される動作、実際の動作、スクリーンショット、追加のコンテキスト、環境、ラベル、チェックリストのセクションが含まれています。

### PRテンプレート

PRテンプレートには、タイトル、説明、関連するIssue、変更の種類、チェックリスト、追加のコンテキストのセクションが含まれています。
