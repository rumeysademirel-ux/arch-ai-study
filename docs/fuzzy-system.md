# Uyarlanabilir Geri Bildirim için Fuzzy Sistem

**Durum:** Fuzzy motor **AI prompt seçimine bağlı** ve koşul ataması artık gerçek 2 görev +
karşı dengeleme mantığından geliyor. Her görev pozisyonu için (`config/counterbalancing.ts` →
`GROUP_SEQUENCES`) katılımcının `assigned_group`'una göre `standard` veya `adaptive` koşulu
belirlenir; `adaptive` olduğunda fuzzy çıktısı üç yapılandırma düzeyinden birine
(`config/fuzzy-config.ts` → `strategyForOutput()`) eşlenir ve karşılık gelen sistem
promptu (`config/ai-prompt-adaptive.ts`) AI çağrısında kullanılır.

## Girdiler

1. **MSTAT-II puanı** (`mstat_scores.average_score`, 1–5) — belirsizlik toleransı
2. **Göreve özgü yön netliği** (`pre_assessments.clarity`, 1–5)
3. **Talep edilen destek düzeyi** (`pre_assessments.guidance_needed`, 1–5)

Ölçek aralığı, etik kurul onaylı MSTAT-II ve süreç değerlendirmesi maddeleriyle aynı 5'li
Likert'i kullanır (bkz. `config/mstat-items.ts`, `config/process-questions.ts`).

Her girdi için düşük/orta/yüksek olmak üzere 3 üyelik kümesi trapezoid (üçgen, iki orta
noktası çakışan bir trapezoiddir) üyelik fonksiyonlarıyla tanımlanır. Sınır değerleri
`config/fuzzy-config.ts` içinde tek bir yerde tutulur.

## Çıkarım

- **Fuzzification**: her girdi, `lib/fuzzy.ts` içindeki `trapezoidMembership` ile
  düşük/orta/yüksek üyelik derecelerine dönüştürülür.
- **Kural değerlendirme**: `config/fuzzy-config.ts` içindeki 27 kuralın her biri için
  ateşleme gücü = üç öncülün (mstat, clarity, guidance) üyelik derecelerinin minimumu.
- **Toplulaştırma**: her çıktı seviyesi (düşük/orta/yüksek) için, o sonuca sahip tüm
  kuralların ateşleme güçlerinin maksimumu alınır.
- **Durulaştırma (defuzzification)**: 0–100 çıktı alanı 1 birimlik adımlarla ayrıklaştırılır
  ve ağırlık merkezi (centroid) yöntemiyle tek bir sayıya indirgenir.
- Çıktı: **geri bildirimin yapılandırma düzeyi**, 0–100 aralığında tek bir sayı.

## Çıktının prompt seçimine bağlanması (uygulandı)

`lib/ai-feedback.ts` → `ensureAiFeedback(participantCode, position)`,
`lib/task-assignment.ts` → `resolveTaskAssignment()` ile o görev pozisyonunun (`task`,
`condition`) çiftini çözer. `condition === "adaptive"` ise:

1. `mstat_scores` ve `pre_assessments` (o görevin `task_key`'i için) tablolarından üç fuzzy
   girdisini okur.
2. `computeFuzzyOutput()` ile 0–100 sayısal çıktıyı hesaplar.
3. `strategyForOutput()` ile stratejiye çevirir (0–33 açık uçlu, 34–66 orta düzey,
   67–100 yüksek düzey — `config/fuzzy-config.ts`).
4. `config/ai-prompt-adaptive.ts` içindeki üç sistem promptundan (`adaptiveSystemPrompts`)
   stratejiye karşılık geleni seçer ve AI çağrısında kullanır.
5. Fuzzy girdilerini, üyelik derecelerini, etkinleşen kuralları ve sayısal çıktıyı
   `ai_feedback_events.fuzzy_inputs/fuzzy_membership/fuzzy_rules/fuzzy_output`
   alanlarına JSON olarak kaydeder — yalnızca araştırmacı paneli için, katılımcıya
   hiçbir zaman gösterilmez.

**Önemli güvenlik sınırı:** Fuzzy girdileri (MSTAT puanı, süreç değerlendirmeleri) AI'ya
hiçbir zaman gönderilmez. AI yalnızca hangi sistem promptunun (yapılandırma düzeyinin)
kullanılacağını görür — katılımcı hakkındaki ham psikolojik/davranışsal veriyi değil.
Bu, standart koşuldaki "AI'ya yalnızca görev brief'i ve fikir metni gider" kısıtını
korur (bkz. `docs/security-privacy.md`).

Uçtan uca doğrulama: `/api/dev/group` ile `adaptive` koşulun etkin olduğu bir gruba zorlanan
test katılımcısında düşük MSTAT + düşük netlik + yüksek destek isteği girdileri
`/api/dev/fuzzy` ile bağımsız olarak doğrulanan "highly-structured" stratejisini üretti;
gerçek akışta bu strateji doğru sistem promptunu seçip AI çağrısına kadar hatasız ilerledi.

## Ekran tasarımı eşitliği

Katılımcı arayüzü (`app/task/[n]/feedback/page.tsx`) koşuldan bağımsız olarak aynı
bileşenleri render eder; hangi koşulda olduğu hiçbir zaman gösterilmez. `FeedbackResult`
tipi yalnızca `{status, text}` taşır — `condition` veya fuzzy verisi UI katmanına hiç geçmez.

## Sınırlar

- Fuzzy sistem **tasarım çözümü üretmez**, yalnızca AI'ya gönderilecek prompt'un
  yapılandırma/detay seviyesini belirler.
- Katılımcı fuzzy girdileri, üyelik değerlerini, etkinleşen kuralları veya çıktıyı
  hiçbir zaman görmez.

## Geçici geliştirici araçları

- `app/api/dev/fuzzy/route.ts` — `GET /api/dev/fuzzy?mstat=&clarity=&guidance=` (1–5
  arası sayılar) — girdileri, üyelik derecelerini, ateşlenen kuralları ve sayısal çıktıyı
  JSON olarak döndürür.
- `app/api/dev/group/route.ts` — `POST /api/dev/group {code, group}` — bir test
  katılımcısının `assigned_group` alanını 1-4 olarak zorlar, böylece round-robin sırasını
  beklemeden her 4 karşı dengeleme dizisini gerçek arayüzden test etmek mümkün olur.

Her ikisi de üretimde (`NODE_ENV=production`) 404 döner, katılımcı ekranlarından
bağlantısı yoktur. Kimlik doğrulamalı araştırmacı paneli (`/admin`, Basic Auth ile
korumalı) artık mevcuttur ve fuzzy verilerini katılımcı bazında görüntüler
(bkz. `docs/security-privacy.md`); bu iki uç nokta yalnızca fuzzy motorunu tek başına
test etmek için geliştirici aracı olarak kalmaya devam eder.

## Sonraki adım (planlanan)

- Görev sonu karşılaştırma ekranı ve görüşmeye geçiş ekranı.
