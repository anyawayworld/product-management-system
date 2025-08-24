# Vercelデプロイメントガイド

## 🚀 Vercelへのデプロイ手順

### 1. 前提条件
- Vercelアカウントの作成
- GitHubリポジトリの準備
- バックエンドサーバーの別途ホスティング

### 2. フロントエンドのデプロイ

#### Step 1: GitHubリポジトリの準備
\`\`\`bash
# プロジェクトをGitHubにプッシュ
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin https://github.com/your-username/product-management-system.git
git push -u origin main
\`\`\`

#### Step 2: Vercelでプロジェクトをインポート
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. "New Project"をクリック
3. GitHubリポジトリを選択
4. 以下の設定を行う：

**Build Settings:**
- Framework Preset: `Vite`
- Root Directory: `app/MYSQLを用いてデータベース管理/frontend`
- Build Command: `npm run vercel-build`
- Output Directory: `dist`

**Environment Variables:**
\`\`\`
VITE_API_URL=https://your-backend-url.herokuapp.com
NODE_ENV=production
\`\`\`

#### Step 3: デプロイ実行
- "Deploy"ボタンをクリック
- ビルドが完了するまで待機

### 3. バックエンドのデプロイ（推奨オプション）

#### Option A: Heroku
\`\`\`bash
# Herokuアプリの作成
heroku create your-app-name-backend

# 環境変数の設定
heroku config:set DB_HOST=your-mysql-host
heroku config:set DB_USER=your-mysql-user
heroku config:set DB_PASSWORD=your-mysql-password
heroku config:set DB_NAME=product_management
heroku config:set PORT=5000

# デプロイ
git subtree push --prefix=app/MYSQLを用いてデータベース管理/backend heroku main
\`\`\`

#### Option B: Railway
1. [Railway](https://railway.app)にアクセス
2. "New Project" → "Deploy from GitHub repo"
3. バックエンドディレクトリを選択
4. 環境変数を設定

#### Option C: Render
1. [Render](https://render.com)にアクセス
2. "New Web Service"を選択
3. GitHubリポジトリを接続
4. 設定を行う

### 4. データベースのホスティング

#### Option A: PlanetScale (推奨)
\`\`\`bash
# PlanetScale CLIのインストール
npm install -g @planetscale/cli

# データベースの作成
pscale database create product-management

# 接続文字列の取得
pscale connect product-management main
\`\`\`

#### Option B: AWS RDS
1. AWS RDSでMySQLインスタンスを作成
2. セキュリティグループの設定
3. 接続文字列の取得

#### Option C: Google Cloud SQL
1. Cloud SQLでMySQLインスタンスを作成
2. 認証設定
3. 接続文字列の取得

### 5. 環境変数の設定

#### Vercel (フロントエンド)
\`\`\`
VITE_API_URL=https://your-backend-url.herokuapp.com
NODE_ENV=production
\`\`\`

#### バックエンド
\`\`\`
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=product_management
PORT=5000
NODE_ENV=production
\`\`\`

### 6. デプロイ後の確認

#### フロントエンド確認項目
- [ ] サイトが正常に表示される
- [ ] APIとの通信が正常
- [ ] 全ページが動作する
- [ ] レスポンシブデザインが機能する

#### バックエンド確認項目
- [ ] ヘルスチェックエンドポイントが応答
- [ ] データベース接続が正常
- [ ] 全APIエンドポイントが動作
- [ ] CORS設定が正しい

### 7. カスタムドメインの設定（オプション）

#### Vercelでカスタムドメイン設定
1. Vercel Dashboardでプロジェクトを選択
2. "Settings" → "Domains"
3. カスタムドメインを追加
4. DNS設定を更新

### 8. 継続的デプロイメント

#### 自動デプロイの設定
- GitHubにプッシュすると自動的にデプロイされる
- プレビューデプロイメントが利用可能
- 本番ブランチの保護

### 9. モニタリングとログ

#### Vercel Analytics
- パフォーマンス監視
- エラートラッキング
- ユーザー分析

#### バックエンドモニタリング
- ログ監視
- エラートラッキング
- パフォーマンス監視

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
\`\`\`bash
# 依存関係の確認
npm install

# TypeScriptエラーの確認
npm run build
\`\`\`

#### 2. API接続エラー
- 環境変数の確認
- CORS設定の確認
- ネットワーク設定の確認

#### 3. データベース接続エラー
- 接続文字列の確認
- ファイアウォール設定の確認
- 認証情報の確認

## 📞 サポート

問題が発生した場合：
1. ログを確認
2. 環境変数を確認
3. ネットワーク設定を確認
4. Vercelサポートに問い合わせ
