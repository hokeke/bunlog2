# Bunlog2 設計ドキュメント

文鳥の健康管理アプリ。毎日の体重・ご飯の量・うんちの数を記録し、ダッシュボードで可視化する。Gemini APIで健康アドバイスを取得できる。

## 要件

- 毎日の記録: 体重、ご飯の量、うんちの数、メモ
- ダッシュボード: グラフで各数値を可視化（期間プリセット: 1週間/1ヶ月/3ヶ月）
- 文鳥管理: 2〜5羽を登録・切り替え可能
- 文鳥プロフィール: 名前、生年月日、性別、品種、お迎え日、かかりつけ医情報、写真
- 健康アドバイス: Gemini APIで手動リクエスト時に分析
- 認証: 管理者1ユーザーのみ（Supabase Auth）

## 技術スタック

| 項目 | 選択 |
|------|------|
| フレームワーク | Next.js (Static Export) |
| UIライブラリ | shadcn/ui (Tailwind CSS) |
| グラフ | Recharts |
| 状態管理 | Zustand |
| データフェッチ | TanStack Query |
| フォーム | React Hook Form + Zod |
| データベース | Supabase (PostgreSQL) |
| ストレージ | Supabase Storage |
| 認証 | Supabase Auth |
| AI | Gemini API |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Pages                         │
│                    (Static HTML/JS/CSS)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js (Static Export)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │     Hooks/Store     │  │
│  │  /login     │  │  Dashboard  │  │  Zustand (auth)     │  │
│  │  /          │  │  BirdCard   │  │  TanStack Query     │  │
│  │  /birds     │  │  RecordForm │  │  (server state)     │  │
│  │  /records   │  │  Chart      │  │                     │  │
│  │  /advice    │  │  ...        │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
┌─────────────────────────┐        ┌─────────────────────────┐
│       Supabase          │        │      Gemini API         │
│  - Auth (1 user)        │        │  健康アドバイス生成      │
│  - Database (birds,     │        │  (クライアントから直接)  │
│    records)             │        └─────────────────────────┘
│  - Storage (photos)     │
└─────────────────────────┘
```

## データベース設計

### birds テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | 名前 |
| birth_date | date | 生年月日 |
| gender | text | オス/メス/不明 |
| species | text | 品種 |
| adopted_date | date | お迎え日 |
| vet_name | text | かかりつけ医の名前 |
| vet_address | text | かかりつけ医の住所 |
| vet_phone | text | かかりつけ医の電話番号 |
| photo_url | text | 写真URL |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### records テーブル

| カラム | 型 | 説明 |
|--------|------|------|
| id | uuid | PK |
| bird_id | uuid | FK → birds |
| date | date | 記録日 |
| weight | decimal | 体重 (g) |
| food_amount | decimal | ご飯の量 (g) |
| droppings_count | integer | うんちの数 |
| memo | text | メモ |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

複合ユニーク制約: `bird_id + date`

### Row Level Security

```sql
-- birdsテーブル
CREATE POLICY "Users can manage own birds"
ON birds FOR ALL
USING (auth.uid() = user_id);

-- recordsテーブル
CREATE POLICY "Users can manage own records"
ON records FOR ALL
USING (bird_id IN (SELECT id FROM birds WHERE user_id = auth.uid()));
```

### Storage

- バケット: `bird-photos`
- パス: `{user_id}/{bird_id}.{ext}`

## ページ構成

```
src/
├── app/
│   ├── layout.tsx          # 共通レイアウト
│   ├── page.tsx            # ダッシュボード
│   ├── login/page.tsx      # ログイン
│   ├── birds/
│   │   ├── page.tsx        # 文鳥一覧
│   │   ├── new/page.tsx    # 新規登録
│   │   └── [id]/
│   │       ├── page.tsx    # 詳細・編集
│   │       └── records/page.tsx
│   ├── records/
│   │   ├── page.tsx        # 今日の記録
│   │   └── new/page.tsx    # 記録入力
│   └── advice/page.tsx     # 健康アドバイス
│
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # Header, Sidebar, MobileNav
│   ├── dashboard/          # Charts, StatsCard
│   ├── birds/              # BirdCard, BirdForm
│   ├── records/            # RecordForm, RecordList
│   └── advice/             # AdvicePanel
│
├── hooks/
│   ├── useBirds.ts
│   ├── useRecords.ts
│   └── useAdvice.ts
│
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts
│   └── utils.ts
│
└── store/
    └── authStore.ts
```

## バリデーション

```typescript
const recordSchema = z.object({
  date: z.date(),
  weight: z.number().min(5).max(50),
  food_amount: z.number().min(0).max(20),
  droppings_count: z.number().int().min(0).max(100),
  memo: z.string().max(500).optional(),
});
```

## エラーハンドリング

- 認証エラー: /login へリダイレクト
- データ操作エラー: TanStack Query リトライ + トースト通知
- Gemini API エラー: トースト通知 + 再試行ボタン
- オフライン: バナー表示、復帰時に自動再取得

## CI/CD

GitHub Actions で main ブランチへの push 時に自動デプロイ。

環境変数 (GitHub Secrets):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## UI/UX

- モダン・ダッシュボード風
- ダークモード対応
- レスポンシブ（モバイルファースト）
- カード型レイアウト

## テスト

- Vitest + React Testing Library
- 初期段階: フォームとバリデーションのみ
