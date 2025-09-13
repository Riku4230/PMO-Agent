import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const jobRequirements = {
  'マーケコンサル': {
    must: [
      'マーケティング戦略立案・実行など何かしらの経験（SEO、広告運用、販促企画、EC構築・運用など分野は問わない）',
      '顧客接触力（社内の案件だけだと厳しい）'
    ],
    want: [
      'BtoBマーケ経験',
      'PM経験',
      'PLを引いたことがある経験'
    ],
    description: '大手企業を中心に、デジタル分野における課題解決のため、クライアントとの対話から理想的なマーケティングプランを練り、かつ実行までを支援します。'
  },
  'コンサルタント': {
    must: [
      'コンサルタント経験5年以上（分野は問わない）'
    ],
    want: [
      'エンタープライズクライアント向けのコンサル経験',
      'マーケティングコンサルタント/戦略コンサルタント/組織開発コンサルタントのいずれかの経験'
    ],
    description: 'エンタープライズクライアントのコンサルティングをお任せします。あらゆるリソースを活用し、クライアントのニーズや課題に対して最適なソリューションを提案します。'
  },
  'デザイナー': {
    must: [
      'Webデザインの実務経験（2年以上）',
      'クライアントワークの経験（10社以上／クライアント折衝含む）',
      'Figma、Illustrator、Photoshopの操作スキル'
    ],
    want: [
      'Web案件におけるアートディレクション・要件定義経験',
      'html / cssでのコーディングスキル',
      'Wordpressでのサイト構築経験',
      'STUDIOを使用したノーコード実装スキル',
      'Lottieアニメーション制作スキル',
      'デザインシステム制作経験',
      'グラフィック・映像制作スキル'
    ],
    description: '業種・業界問わず企業課題を解決するためのクリエイティブワークを行います。'
  }
};

export const jobPositionAnalyzerTool = createTool({
  id: 'analyze-job-position',
  description: 'ユーザーのスキル、経験、興味に基づいて最適な職種を判断し、その募集要項と詳細を提供します。',
  inputSchema: z.object({
    userInput: z.string().describe('ユーザーのスキル、経験、興味に関する入力'),
  }),
  outputSchema: z.object({
    position: z.string(),
    must_requirements: z.array(z.string()),
    want_requirements: z.array(z.string()),
    position_description: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
    job_posting_details: z.string(), // 募集要項の詳細を追加
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは採用担当者です。以下のユーザーの入力内容と職種の要件・募集要項を参考に、最も適切な職種を判断してください。

## ユーザー入力
${context.userInput}

## 職種と条件・募集要項
${Object.entries(jobRequirements).map(([position, details]) => {
  let output = `### ${position}
`;
  output += `業務内容: ${details.description}
`;
  output += `【MUST】\n- ${details.must.join('\n- ')}\n`;
  if (details.want && details.want.length > 0) {
    output += `【WANT】\n- ${details.want.join('\n- ')}\n`;
  }
  return output;
}).join('\n')}

以下の形式でJSONを返してください:
{
  "position": "判断した最適な職種名",
  "confidence": 0.0〜1.0の確信度,
  "reasoning": "なぜその職種と判断したかの理由と、ユーザーのスキルや経験がその職種のMUST/WANT要件にどれだけ合致しているか",
  "job_posting_details": "判断した職種の募集要項の全文を、Markdown形式で出力してください。具体的には、「# 業務内容」から「ピネアルの"推し！”ポイント」までを含めてください。" 
}

注意事項:
- 職種名は上記の「職種と条件・募集要項」のリストから必ず選択してください
- ユーザーの経験、スキル、興味を総合的に判断してください
- 確信度は0〜1の範囲で、どれくらい確実かを示してください
- job_posting_detailsには、Markdown形式で整形された募集要項の全文を正確に含めてください。Markdownのヘッダーやリスト形式なども維持してください。
`;

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error("OPENAI_API_KEYが設定されていません。");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI APIからの応答エラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices[0].message.content;
      
      // Markdownコードブロックを除去してJSONを抽出
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const result = JSON.parse(jsonText);
      
      const selectedPosition = result.position;
      const jobInfo = jobRequirements[selectedPosition as keyof typeof jobRequirements];
      
      if (!jobInfo) {
        throw new Error(`Invalid position: ${selectedPosition}`);
      }

      const fullJobPostingDetails = getFullJobPostingDetails(selectedPosition); // 新しいヘルパー関数を呼び出す

      return {
        position: selectedPosition,
        must_requirements: jobInfo.must,
        want_requirements: jobInfo.want || [],
        position_description: jobInfo.description,
        confidence: result.confidence,
        reasoning: result.reasoning,
        job_posting_details: fullJobPostingDetails,
      };
    } catch (error) {
      console.error('Error analyzing job position:', error);
      throw new Error('Failed to analyze job position');
    }
  },
});

// 募集要項の全文を取得するヘルパー関数
function getFullJobPostingDetails(position: string): string {
  switch (position) {
    case 'マーケコンサル':
      return `
### マーケコンサル
# 業務内容

大手企業を中心に、デジタル分野における課題解決のため、クライアントとの対話から理想的なマーケティングプランを練り、かつ実行までを支援します。

双方がワクワクできるような施策を追求し、実行する。

そんな私たちの考えに共感し、共に思考していただける仲間を募集します。

<aside>
💡

### 具体的には

- プロジェクトの実施において、クライアントとの会議やインタビューを通し、問題解決のための提言
- プロジェクトの進捗管理や報告書の作成等、プロジェクトマネジメント業務全般を担当
- クライアントとの信頼関係構築や課題解決に向けたアドバイス提供など、クライアント対応業務
など
</aside>

# 求める経験・スキル

## **MUST**

- マーケティング戦略立案・実行経験3年以上（SEO、広告運用、販促企画、EC構築・運用etc）
- 顧客折衝能力
- プレゼンテーション能力

## WANT

- BtoBマーケティング経験
- 生成AI活用経験
- TableauなどBIツールを用いた指標モニタリングの構築、運用経験

# 求める人物像

- 課題解決能力が高く、クライアントのビジネス成長にコミットできる方
- 新しい技術やトレンドへの学習意欲が高い方
- 職位の高い方とのコミュニケーションが得意な方

# ピネアルの"推し！”ポイント

<aside>
💡

### ◎大手企業との直取引

直接取引だからこそできるクライアントの本質的な課題へのアプローチが可能です。

</aside>

<aside>
💡

### ◎自由度の高い戦力立案

特定のソリューションに依存せず、幅広い選択肢の中からソリューションを選択するコンサルティングが可能です。
クライアントの本質的な課題を解決できるという実感を持ちながら、課題解決に向けた伴走ができます。

</aside>
`;
    case 'コンサルタント':
      return `
### コンサルタント
# 業務内容

**エンタープライズクライアントのコンサルティングをお任せします。**
あらゆるリソースを活用し、クライアントのニーズや課題に対して最適なソリューションを提案します。
ピネアルが掲げる"没入"体験を顧客と共有し、大手クライアントをリードするコンサルティングを行っていただきます。

<aside>
💡

### 具体的には

- クライアントのビジネスを深く理解し、クロスセルやアップセル機会を創出
- クライアントのニーズ・課題をヒアリング
- ピネアルのリソースをフル活用した（場合によってはリソースにとらわれない）ソリューションを提案
- 必要に応じた外部リソース調達と人員計画
</aside>

# 求める経験・スキル

## **MUST**

- **クライアント向けのコンサルタント経験**
    - 顧客課題を引き出し、RFPを自ら設計した経験
    - チームを束ね、顧客と合意形成してプロジェクトを進めた経験

## WANT

- 外部リソースを含むチームビルディング力
- クライアントとの独自のつながり
- AI領域における知見

# 求める人物像

- 顧客のニーズを的確に捉え、最適なソリューションを提案できる方
- 新しい技術やサービスへの学習意欲が高い方
- チームワークを大切に、目標達成に向けて主体的に行動できる方

# ピネアルの"推し！”ポイント

<aside>
💡

### ◎エンタープライズクライアントとの直接取引

大手クライアントと直接取引を行うため、本質的な課題解決につながる提案が可能です。
代表のつながりやリファラルを中心に、ピネアルが掲げる"没入"ブランドに共感する顧客との直接取引が中心です。
信頼関係があるからこそ、難易度が高い相談をいただくことも多々。常に新しい課題と出会えるチャレンジングな環境です。
最先端のAIソリューションを取り入れながら、自由度の高い提案ができる点も魅力です。

</aside>

<aside>
💡

### ◎新たなコンサルティングのかたちを提供

いわゆる「人月ビジネス」ではなく、顧客共感型のプロジェクト制をとっていることもあり、自由度が高く裁量が大きなプロジェクトをリードできます。

</aside>
`;
    case 'デザイナー':
      return `
### デザイナー／アートディレクター
# 業務内容

**業種・業界問わず企業課題を解決するためのクリエイティブワークを行います。**

大手企業様中心に、Web・グラフィック・映像とさまざまな媒体での案件に対して成果の最大化および課題解決のためのクリエイティブを追求します。

業務はWeb案件が7割、その他グラフィック、映像等の案件が3割です。

企画段階からPMとチームでプロジェクトを進行し、案件全体に携わることができます。

<aside>
💡

### 具体的には

- 企業の販促、ブランディング、プロモーションを行う際の効果的なデザインを企画・制作する
- 自社サービスのブランドデザインからプレゼンテーション等コンサル領域へのクリエイティブアプローチを企画・制作する
- デザイナー目線でのマーケティング、アイデアレーションを行う
</aside>

# 求める経験・スキル

## **MUST**

- Webデザインの実務経験（3年以上）
- クライアントワークの経験（10社以上／クライアント折衝含む）
- Figma、Illustrator、Photoshopの操作スキル
- インタラクティブなWebサイト制作経験
- コーディング、システムベンダーへの実装ディレクション経験

## WANT

- Web案件におけるアートディレクション・要件定義経験
- html / cssでのコーディングスキル
- Wordpressでのサイト構築経験
- STUDIOを使用したノーコード実装スキル
- Lottieアニメーション制作スキル
- デザインシステム制作経験
- グラフィック・映像制作スキル

# 求める人物像

- トレンドをキャッチアップし、常に新しい表現に挑戦する意欲のある方
- 課題の本質を捉え、デザインを通じて価値を創造できる方
- マーケティングの視点を取り入れることで自身のデザインスキルを高めていきたい方
- チームワークを大切に、コミュニケーションを取れる方
- クリエイティブワークに没頭・没入できる方

# ピネアルの"推し！”ポイント

<aside>
✨

### ブランド価値創造

大手クライアントの商品・サービスのブランディング戦略立案からデザインまで、一貫して携われます

</aside>

<aside>
🔥

### 多様な仲間との協業

コンサルティングを祖業とする弊社ならではの、データサイエンティストやマーケコンサルタントと協業し、新しいデザインのあり方を模索しましょう！

</aside>

<aside>
🚀

### 自由な発想

既存の枠にとらわれない、斬新なデザインおよびアイデアを歓迎します！

</aside>

<aside>
🌟

### クリエイティブとビジネスの両面で成長を目指す方に最適です

デザインにマーケティングの視点を取り入れることにより、顧客の戦略にも深くタッチすることができます

</aside>

<aside>
📣

### やりたいことを応援する文化

各自がやりたいことを実現すること・応援し合うことを大切にする文化です。チャレンジングな人が集う刺激の多い環境です！

</aside>
`;
    default:
      return '';
  }
}
