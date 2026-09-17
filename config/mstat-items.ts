// Etik kurul onaylı Bilgilendirilmiş Onam Formu Eki'nden (Bölüm 1, madde 9-16)
// birebir alınmıştır. Orijinal ölçek McLain (2009) tarafından 13 madde olarak
// geliştirilmiştir; bu araştırmada Koç, Bir ve Özekenci (2021) tarafından
// Türkçeye uyarlanan ve geçerlik-güvenirlik analizleri sonucunda sekiz
// maddeden oluşan Türkçe formu kullanılmaktadır. Maddeler 5'li Likert tipi
// derecelendirme üzerinden yanıtlanır.
//
// Kaynaklar:
// McLain, D. L. (2009). Evidence of the properties of an ambiguity tolerance
// measure: The Multiple Stimulus Types Ambiguity Tolerance Scale–II
// (MSTAT–II). Psychological Reports, 105(3), 975–988.
// https://doi.org/10.2466/PR0.105.3.975-988
// Koç, M., Bir, Y., & Özekenci, E. K. (2021). VUCA bileşenlerinin
// ölçümlenmesi üzerine bir ölçek uyarlama çalışması. 20. Uluslararası
// İşletmecilik Kongresi Bildiriler Kitabı.

export interface MstatItem {
  itemNumber: number;
  text: string;
  reverseScored: boolean;
}

export const mstatItems: MstatItem[] = [
  {
    itemNumber: 1,
    text: "Birkaç farklı perspektiften bakılması gereken bir sorunu çözmekten kaçınmayı tercih ederim.",
    reverseScored: true,
  },
  {
    itemNumber: 2,
    text: "Muğlak durumlardan kaçınmaya çalışıyorum.",
    reverseScored: true,
  },
  {
    itemNumber: 3,
    text: "Aşina olduğum durumları yenilerine tercih ederim.",
    reverseScored: false,
  },
  {
    itemNumber: 4,
    text: "Tek bir bakış açısından düşünülemeyecek sorunlar biraz tehditkârdır.",
    reverseScored: true,
  },
  {
    itemNumber: 5,
    text: "Kolayca anlayamayacağım ve karmaşık olan durumlardan kaçınırım.",
    reverseScored: true,
  },
  {
    itemNumber: 6,
    text: "Tek bir en iyi çözüme sahip gibi görünmeyen sorunlardan kaçınmaya çalışıyorum.",
    reverseScored: true,
  },
  {
    itemNumber: 7,
    text: "Muğlak durumlardan hoşlanmıyorum.",
    reverseScored: true,
  },
  {
    itemNumber: 8,
    text: "Sonuç belirsiz olduğunda seçim yapmakta zorlanıyorum.",
    reverseScored: true,
  },
];

// 5'li Likert (yalnızca uç noktalar arayüzde etiketlenir; 2-4 arası sayıyla gösterilir).
export const mstatScaleLabels = [
  "Kesinlikle Katılmıyorum",
  "Katılmıyorum",
  "Kararsızım",
  "Katılıyorum",
  "Kesinlikle Katılıyorum",
];

export const mstatScaleMin = 1;
export const mstatScaleMax = 5;
