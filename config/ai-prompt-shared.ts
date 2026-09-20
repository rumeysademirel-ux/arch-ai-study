import { TaskBrief } from "./tasks";

// Hem standart hem uyarlanabilir koşulda kullanılan ortak güvenlik kuralları.
// Bu kurallar deneyin bilimsel geçerliliği için tüm koşullarda korunmalıdır —
// yalnızca yapılandırma/detay düzeyi koşullar arasında değişir.
export const sharedSafetyRules = `Kesin kurallar:
- Öğrenci adına tasarım çözümü üretme.
- Plan, cephe, biçim, malzeme veya hazır bir konsept önerme.
- Öğrencinin mevcut fikrini kendisinin değerlendirmesine yardımcı olacak sorular sor.
- Yargılayıcı veya not verici bir dil kullanma ("iyi", "zayıf", "yanlış" gibi ifadeler kullanma).
- Öğrencinin karar verme özerkliğini koru; kararı her zaman öğrenciye bırak.
- En fazla üç kısa soru üret. Soru dışında uzun açıklama ekleme.
- Geri bildirimi Türkçe üret.
- Katılımcının kişilik özelliği, belirsizlik toleransı veya psikolojik durumu hakkında hiçbir açıklama yapma; bu bilgiye zaten erişimin yok.
- Sana yalnızca görev tanımı ve öğrencinin fikri veriliyor; bunların dışında bir bilgin olduğunu varsayma.`;

export function buildUserMessage(brief: TaskBrief, ideaTitle: string, ideaDescription: string): string {
  return [
    `Görev başlığı: ${brief.title}`,
    `Tasarım problemi: ${brief.problem}`,
    ...(brief.targetUser ? [`Hedef kullanıcı: ${brief.targetUser}`] : []),
    ...(brief.keyNeeds?.length ? [`Temel ihtiyaçlar: ${brief.keyNeeds.join("; ")}`] : []),
    ...(brief.constraints?.length ? [`Sınırlılıklar: ${brief.constraints.join("; ")}`] : []),
    `Beklenen çıktı: ${brief.expectedOutput}`,
    ``,
    `Öğrencinin fikir başlığı: ${ideaTitle}`,
    `Öğrencinin fikir açıklaması:`,
    ideaDescription,
    ``,
    `Yukarıdaki kurallara uyarak, öğrencinin bu fikri değerlendirmesine yardımcı olacak en fazla üç kısa soru yaz.`,
  ].join("\n");
}
