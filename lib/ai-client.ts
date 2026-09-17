import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY tanımlı değil. .env.local dosyasına ekleyin (bkz. .env.local.example)."
      );
    }
    client = new Anthropic();
  }
  return client;
}

const MODEL = "claude-opus-5";

/**
 * Standart ve uyarlanabilir koşulların ortak AI çağrısı: kısa, çözüm
 * önermeyen bir geri bildirim üretir. Hangi sistem promptunun (dolayısıyla
 * hangi yapılandırma düzeyinin) kullanılacağına çağıran taraf karar verir
 * (lib/ai-feedback.ts). MSTAT puanı, süreç değerlendirmeleri ve demografik
 * bilgiler bu fonksiyona hiçbir zaman parametre olarak geçirilmemelidir.
 */
export async function generateFeedback(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("AI isteği güvenlik sınıflandırıcıları tarafından reddedildi.");
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text" || !textBlock.text.trim()) {
    throw new Error("AI yanıtında kullanılabilir metin bulunamadı.");
  }

  return textBlock.text.trim();
}

export const AI_MODEL_ID = MODEL;
