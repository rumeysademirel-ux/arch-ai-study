// Etik kurul onaylı Bilgilendirilmiş Onam Formu Eki'nden birebir alınmıştır
// (Bölüm 2/3, madde 20-22 = görev sırasındaki süreç değerlendirmesi;
// madde 26-32 = geri bildirim sonrası değerlendirme). Her madde ayrı
// kaydedilir, tek bir toplam puan oluşturulmaz. 5'li ölçek: 1-5.

export interface ScaleQuestion {
  key: string;
  text: string;
  lowLabel: string;
  highLabel: string;
}

export const preAssessmentQuestions: ScaleQuestion[] = [
  {
    key: "clarity",
    text: "Şu anda tasarım yönünüz konusunda ne kadar netsiniz?",
    lowLabel: "Hiç net değilim",
    highLabel: "Tamamen netim",
  },
  {
    key: "decisionDifficulty",
    text: "Şu anda tasarım kararları almak size ne kadar zor geliyor?",
    lowLabel: "Hiç zor gelmiyor",
    highLabel: "Çok zor geliyor",
  },
  {
    key: "guidanceNeeded",
    text: "Şu anda ne düzeyde bir yönlendirmeye ihtiyaç duyuyorsunuz?",
    lowLabel: "Hiç yönlendirmeye ihtiyaç duymuyorum",
    highLabel: "Çok fazla yönlendirmeye ihtiyaç duyuyorum",
  },
];

// Not: Geri bildirim sonrası formda "yön netliği", "karar verme güçlüğü" ve
// "yönlendirme ihtiyacı" maddeleri (26-28) süreç değerlendirmesiyle aynı
// soru metnini ve anahtarları kullanır — onam eki içinde de birebir
// tekrarlanmıştır (bkz. madde 20-22 ile 26-28).
export const postAssessmentQuestions: ScaleQuestion[] = [
  {
    key: "clarity",
    text: "Şu anda tasarım yönünüz konusunda ne kadar netsiniz?",
    lowLabel: "Hiç net değilim",
    highLabel: "Tamamen netim",
  },
  {
    key: "decisionDifficulty",
    text: "Şu anda tasarım kararları almak size ne kadar zor geliyor?",
    lowLabel: "Hiç zor gelmiyor",
    highLabel: "Çok zor geliyor",
  },
  {
    key: "guidanceNeeded",
    text: "Şu anda ne düzeyde bir yönlendirmeye ihtiyaç duyuyorsunuz?",
    lowLabel: "Hiç yönlendirmeye ihtiyaç duymuyorum",
    highLabel: "Çok fazla yönlendirmeye ihtiyaç duyuyorum",
  },
  {
    key: "structureLevel",
    text: "Aldığınız yapay zekâ geri bildirimi, nasıl ilerleyebileceğiniz konusunda size ne ölçüde belirgin bir çerçeve sundu?",
    lowLabel: "Tamamen açık uçlu",
    highLabel: "Çok yüksek düzeyde yapılandırılmış",
  },
  {
    key: "fitToNeed",
    text: "Aldığınız yapay zekâ geri bildiriminin yönlendirme düzeyi, o anda ihtiyaç duyduğunuz desteğe ne ölçüde uygundu?",
    lowLabel: "Hiç uygun değildi",
    highLabel: "Tamamen uygundu",
  },
  {
    key: "thinkingSpace",
    text: "Aldığınız yapay zekâ geri bildirimi, kendi tasarım kararlarınızı vermeniz için size ne ölçüde alan bıraktı?",
    lowLabel: "Hiç alan bırakmadı",
    highLabel: "Tamamen alan bıraktı",
  },
  {
    key: "usageLevel",
    text: "Revize tasarım fikrinizi oluştururken aldığınız yapay zekâ geri bildiriminden ne ölçüde yararlandınız?",
    lowLabel: "Hiç yararlanmadım",
    highLabel: "Çok büyük ölçüde yararlandım",
  },
];

export const scaleMin = 1;
export const scaleMax = 5;
