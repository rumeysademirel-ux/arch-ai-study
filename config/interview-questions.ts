// Etik kurul onaylı Onam Formu Eki'ndeki "ÇALIŞMA SONRASI GÖRÜŞME PROTOKOLÜ
// (İki Geri Bildirim Deneyiminin Karşılaştırılması)" soruları (49-53).
// Numaralar onaylı belgedeki numaralarla aynı tutulur (veri dışa aktarımında
// interview_q49 ... interview_q53 olarak görünür). Belgedeki parantez içi analiz
// başlıkları katılımcıya gösterilmediği için bilerek eklenmemiştir.

export interface InterviewQuestion {
  number: number;
  text: string;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    number: 49,
    text:
      "İki görevde aldığınız yapay zekâ geri bildirimleri arasında fark ettiğiniz en belirgin fark " +
      "neydi? Bu fark düşünme biçiminizi nasıl etkiledi?",
  },
  {
    number: 50,
    text:
      "Aldığınız geri bildirimlerden birinin tasarım sürecinizde özellikle işinize yaradığı veya " +
      "yaramadığı bir anı anlatabilir misiniz? Sizce bunun nedeni neydi?",
  },
  {
    number: 51,
    text:
      "Geri bildirimlerin sizi belirli bir tasarım yönüne ittiğini ya da tam tersine farklı " +
      "seçenekleri düşünmeniz için alan açtığını hissettiğiniz durumlar oldu mu? Olduysa nasıl?",
  },
  {
    number: 52,
    text:
      "İlk fikrinizden revize fikrinize geçerken düşüncenizde en önemli değişiklik neydi? Yapay zekâ " +
      "geri bildiriminin bu değişimde nasıl bir rolü oldu?",
  },
  {
    number: 53,
    text:
      "Tasarım sırasında nasıl ilerleyeceğinizden emin olmadığınız bir an olduysa, o anda ne " +
      "düşündüğünüzü ve yapay zekâ geri bildiriminden sonra nasıl ilerlediğinizi anlatabilir misiniz?",
  },
];

export const INTERVIEW_ANSWER_MAX_CHARS = 5000;
