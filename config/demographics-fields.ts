// Etik kurul onaylı Bilgilendirilmiş Onam Formu Eki'nden (Bölüm 1, madde 1-8)
// birebir alınmıştır. Soru metinleri ve seçenekler değiştirilmemelidir —
// değişiklik onaylanmış etik kurul başvurusuyla uyumsuzluk yaratır.

export type DemographicFieldType = "select" | "text";

export interface DemographicField {
  key: string;
  label: string;
  type: DemographicFieldType;
  options?: string[];
  required: boolean;
}

export const demographicFields: DemographicField[] = [
  {
    key: "ageRange",
    label: "Yaş aralığınız nedir?",
    type: "select",
    options: ["18–20", "21–23", "24–26", "27+", "Belirtmek istemiyorum"],
    required: true,
  },
  {
    key: "gender",
    label: "Cinsiyetiniz",
    type: "select",
    options: ["Kadın", "Erkek", "Belirtmek istemiyorum", "Diğer"],
    required: true,
  },
  {
    key: "university",
    label: "Şu an eğitim gördüğünüz üniversitenin adı",
    type: "text",
    required: true,
  },
  {
    key: "classLevel",
    label: "Mevcut sınıf düzeyi",
    type: "select",
    options: ["1. sınıf", "2. sınıf", "3. sınıf", "4. sınıf", "Mezun", "Yüksek Lisans", "Doktora"],
    required: true,
  },
  {
    key: "studioCount",
    label: "Tamamlanan mimari tasarım stüdyosu sayısı",
    type: "select",
    options: ["1", "2", "3", "4", "5+"],
    required: true,
  },
  {
    key: "aiUsageFrequency",
    label: "Üretken yapay zekâ kullanım sıklığınız",
    type: "select",
    options: ["Hiç kullanmıyorum", "Nadiren", "Ara sıra", "Sık sık", "Hergün"],
    required: true,
  },
  {
    key: "aiDesignExperience",
    label: "Mimari tasarım sürecinde yapay zekâ kullanım deneyiminiz",
    type: "select",
    options: ["Yok", "Sınırlı", "Orta düzey", "İleri düzey"],
    required: true,
  },
  {
    key: "aiToolsUsed",
    label: "Kullandığınız yapay zekâ araçları (varsa) yazınız",
    type: "text",
    required: false,
  },
];
