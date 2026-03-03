# Bunlog2

文鳥の健康管理アプリ。毎日の体重・ご飯の量・うんちの数を記録し、グラフで可視化。Gemini APIで健康アドバイスを取得できます。

## 機能

- 文鳥の登録・管理（2〜5羽）
- 毎日の記録（体重、ご飯の量、うんちの数、メモ）
- ダッシュボード（グラフ表示、期間選択）
- 健康アドバイス（Gemini API）
- ダークモード対応
- レスポンシブデザイン

## 技術スタック

- Next.js 14 (Static Export)
- shadcn/ui + Tailwind CSS
- Recharts
- Supabase (Auth, Database, Storage)
- Gemini API
- GitHub Pages

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` を作成:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Supabase のセットアップ

1. Supabase プロジェクトを作成
2. `supabase/migrations/001_initial_schema.sql` を実行
3. Authentication でユーザーを作成

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ビルド

```bash
npm run build
```

## デプロイ

GitHub に push すると自動で GitHub Pages にデプロイされます。

GitHub Secrets に以下を設定:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
