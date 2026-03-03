// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function getHealthAdvice(
  birdName: string,
  species: string | null,
  records: Array<{
    date: string;
    weight: number;
    food_amount: number;
    droppings_count: number;
    memo: string | null;
  }>
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const recordsText = records
    .map(
      (r) =>
        `${r.date}: 体重${r.weight}g, ご飯${r.food_amount}g, うんち${r.droppings_count}回${r.memo ? `, メモ: ${r.memo}` : ""}`
    )
    .join("\n");

  const prompt = `あなたは文鳥の健康管理に詳しい獣医師です。
以下は${species ? `${species}の` : ""}「${birdName}」の健康記録です。

${recordsText}

この記録を分析して、以下の観点からアドバイスをください：
- 体重の推移（増減傾向、適正範囲か）
- 食事量の変化
- 排泄状況
- 注意すべき点や推奨事項

文鳥の飼い主にわかりやすく、簡潔に説明してください。`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
