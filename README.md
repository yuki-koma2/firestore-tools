# firestore-tools

## サンプルコードでの動かし方

```bash
npm run generate -- --input ./sample/schema.yaml --output ./output
```


## github action テストの実行

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