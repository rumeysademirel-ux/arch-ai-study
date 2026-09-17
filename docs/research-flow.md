# Araştırma Akışı ve Ekran Mimarisi

Bu doküman, etik kurul onaylı Bilgilendirilmiş Onam Formu Eki ile birebir uyumlu tam deney
tasarımının (~30 mimarlık öğrencisi, karşı dengelenmiş denek-içi desen, toplam 53 katılımcı
sorusu + 5 soruluk bağımsız uzman değerlendirmesi, ~50-60 dakika) uçtan uca ekran akışını
tanımlar. **Şu an kod olarak uygulanan kapsam** (aşağıdaki "Uygulanan akış" bölümü), 2 görevi
ve karşı dengelemeyi kapsıyor; görev sonu karşılaştırma, görüşme ekranı ve bağımsız uzman
değerlendirme aracı henüz eklenmedi.

## Tam akış (hedef sistem)

Onam, uygulama dışında **yazılı belge (ıslak imza)** ile alınır — katılımcı, bilgisayar
başına oturmadan önce yazılı Bilgilendirilmiş Onam Formu'nu imzalar. Bu nedenle akışta ayrı
bir dijital "onam" ekranı/aşaması **yoktur**; katılımcı kodunu girdikten hemen sonra doğrudan
demografik forma yönlendirilir.

```
LOGIN (katılımcı kodu — yazılı onam formu önceden imzalanmış olmalıdır)
  → DEMOGRAPHICS (8 madde, ~2-3 dk)
  → MSTAT_II (8 madde, 5'li Likert, Koç/Bir/Özekenci 2021 Türkçe uyarlaması; puan gizli
    hesaplanır, ~4-5 dk)
  → [Görev sırası assigned_group'a göre: Grup 1-4]
    TASK_BRIEF (Görev 1 veya Görev 2 — ~15 dk)
      → INITIAL_IDEA (immutable)
      → PRE_FEEDBACK_ASSESSMENT (yön netliği, karar güçlüğü, yönlendirme ihtiyacı — 5'li)
      → AI_FEEDBACK (Standart veya Uyarlanabilir — katılımcıya belirtilmez)
      → REVISED_IDEA (ilk fikir salt-okunur + ayrı revizyon alanı)
      → POST_FEEDBACK_ASSESSMENT (7 madde — 5'li)
    BREAK_SCREEN (kısa mola)
    TASK_BRIEF (diğer görev, diğer koşul) → … (yukarıdaki alt akış tekrar)
  → END_OF_STUDY_COMPARISON (iki geri bildirim deneyimini karşılaştırma) — henüz yok
  → RESEARCHER_HANDOFF ("Araştırmacıya haber veriniz" + 5 soruluk görüşme rehberi, ~10 dk) — henüz yok
  → COMPLETE (teşekkür ekranı)
```

Kurallar (tüm aşama):
- Katılımcı önceki aşamalara dönüp cevap değiştiremez.
- Her aşama tamamlandığında veri kaydedilir ve `current_stage` bir sonrakine ilerletilir (asla geri alınmaz).
- Sayfa yenilendiğinde katılımcı `current_stage`'den devam eder.
- Standart ve uyarlanabilir koşulların ekran düzeni ve işlem sırası birebir aynı görünür; katılımcıya
  hangi koşulda olduğu hiçbir şekilde gösterilmez.

## Uygulanan akış (bu repo'da şu an kod olarak var olan)

```
LOGIN → DEMOGRAPHICS → MSTAT
  → TASK1_BRIEF → TASK1_INITIAL_IDEA → TASK1_PRE_ASSESSMENT → TASK1_AI_FEEDBACK
    → TASK1_REVISED_IDEA → TASK1_POST_ASSESSMENT
  → BREAK (kısa mola ekranı)
  → TASK2_BRIEF → TASK2_INITIAL_IDEA → TASK2_PRE_ASSESSMENT → TASK2_AI_FEEDBACK
    → TASK2_REVISED_IDEA → TASK2_POST_ASSESSMENT
  → COMPLETE
```

Görev ve koşul sırası, `config/counterbalancing.ts` içindeki `GROUP_SEQUENCES` tablosundan
katılımcının `assigned_group` değerine (1-4) göre çözülür — orijinal tasarımdaki 4 grup
tablosunu birebir uygular. Grup ataması katılımcı kodunu ilk kez girdiğinde **sırayla döndürme
(round-robin)** ile yapılır (`lib/stage.ts` → `createParticipant()`): kayıt olan 1. katılımcı
Grup 1'e, 2. katılımcı Grup 2'ye … 5. katılımcı tekrar Grup 1'e atanır. ~30 katılımcıda hücre
sayılarını otomatik dengeler.

Kapsam dışı (henüz eklenmedi): görev sonu karşılaştırma ekranı, görüşmeye geçiş ekranı, admin
paneli.

## Stage-machine uygulaması

`lib/stage.ts` içinde tanımlı sabit sıralı `Stage` enum'u ve `participants.current_stage` alanı
bu akışı yönetir. Görev ekranları (`app/task/[n]/**`, `app/api/**/[n]/**`) `n` route parametresini
(`"1"` veya `"2"`) okuyup `stageForTaskPosition(position, suffix)` ile tam `Stage` değerini
(`"TASK1_BRIEF"`, `"TASK2_PRE_ASSESSMENT"` vb.) hesaplar. Her sayfa, render öncesi sunucu
tarafında mevcut aşamayı kontrol eder; uyuşmuyorsa katılımcıyı doğru aşamaya yönlendirir (hem
geri hem ileri atlama engellenir). `lib/task-assignment.ts` → `resolveTaskAssignment()`, o
konumdaki (1. veya 2.) gerçek görev (`task-a`/`task-b`) ve koşulu (`standard`/`adaptive`)
katılımcının grubuna göre döndürür.
