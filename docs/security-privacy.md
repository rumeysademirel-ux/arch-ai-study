# Güvenlik ve Veri Gizliliği

## Kimlik koruması

- Sistem hiçbir yerde ad, öğrenci numarası, e-posta veya başka bir doğrudan kimlik bilgisi toplamaz.
- Tüm veriler yalnızca katılımcının kendi seçtiği/kendisine verilen **anonim katılımcı kodu**
  (`participants.code`) ile ilişkilendirilir.
- Katılımcı kodu, tarayıcıda yalnızca `httpOnly` bir cookie'de tutulur (`lib/session.ts`);
  JavaScript'ten okunamaz, üçüncü taraf script'lere sızmaz.

## Geri gitme / veri değiştirme engeli

- `participants.current_stage` tek yönlü ilerler; hiçbir API route bu alanı geriye almaz.
- Sunucu tarafı her sayfa yüklemesinde mevcut aşamayı doğrular (`lib/stage.ts`); katılımcı
  URL'yi elle değiştirerek önceki/sonraki bir aşamaya geçemez.
- `initial_ideas` ve `revised_ideas` ayrı tablolardır — ilk fikir hiçbir zaman üzerine yazılmaz.

## AI entegrasyonu (Aşama 2'de uygulandı — standart koşul)

- AI API anahtarı yalnızca sunucu tarafında tutulur (`.env.local`, `.gitignore`'da; asla
  `NEXT_PUBLIC_*` değil) ve yalnızca sunucu bileşenlerinden/route'lardan çağrılır
  (`lib/ai-client.ts`) — istemciye asla gönderilmez.
- MSTAT-II puanı, süreç değerlendirmeleri ve demografik bilgiler hiçbir koşulda (standart
  veya uyarlanabilir) AI'ya **kesinlikle gönderilmez**. `lib/ai-feedback.ts` yalnızca görev
  brief'ini ve katılımcının ilk fikir metnini modele gönderir; fonksiyon imzası başka bir
  veri kabul etmez.
- Uyarlanabilir koşulda (Aşama 4) fuzzy motor MSTAT puanını, netlik ve destek isteği
  değerlerini kullanarak 0–100 bir yapılandırma düzeyi hesaplar ve bu düzeye göre üç hazır
  sistem promptundan birini seçer (`config/ai-prompt-adaptive.ts`). AI'ya gönderilen tek şey
  seçilmiş sistem promptu + görev brief'i + fikir metnidir — fuzzy girdileri, üyelik
  dereceleri veya ham puanlar hiçbir zaman modele gönderilmez.
- AI yanıtı alınamazsa: katılımcıya yargılayıcı olmayan, sade bir hata ekranı gösterilir
  (`app/task/[n]/feedback/page.tsx`) ve "Tekrar Dene" butonu AI çağrısını yeniden dener. Başarısız
  çağrılar `ai_feedback_events` tablosuna satır yazmaz, böylece yeniden deneme baştan başlar.
  Hata sunucu loguna yazılır (`console.error`); araştırmacıya ayrı, gerçek zamanlı bir bildirim
  kanalı (ör. e-posta/Slack) henüz eklenmedi — araştırmacı panelinden (Aşama 7) katılımcı
  ilerlemesini elle kontrol ederek eksik/başarısız geri bildirimleri fark edebilir.
- Anthropic SDK'nın kendi yeniden deneme mekanizması (429/5xx için varsayılan 2 deneme,
  üstel geri çekilme ile) API çağrısı düzeyinde ek bir dayanıklılık katmanı sağlar.

## Aşama 1'de somut önlemler

- Form doğrulama hem istemci hem sunucu tarafında yapılır (API route'ları geçersiz/eksik
  veriyi reddeder); hata mesajları açık ve yargılayıcı olmayan bir dille yazılır.
- `.env.local` (API anahtarları, veritabanı bağlantı dizesi, admin kimlik bilgileri)
  `.gitignore`'a eklendi — hiçbir gizli değer bir git deposuna gönderilmez.

## Eskiz/diyagram yükleme güvenliği (Aşama 6'da uygulandı)

- **Sunucu tarafı boyut sınırı** (`lib/save-upload.ts`, `MAX_UPLOAD_BYTES` = 10 MB): istemci
  tarafındaki `components/SketchUpload.tsx` kontrolü yalnızca kullanıcı deneyimi içindir ve
  `curl`/devtools ile kolayca atlanabilir — asıl uygulama sunucu tarafındadır.
- **Gerçek dosya türü doğrulaması (magic-byte sniffing)**: dosya uzantısına veya istemcinin
  bildirdiği `Content-Type`'a hiçbir zaman güvenilmez. İlk baytlar PNG/JPEG/WEBP/PDF imzalarıyla
  karşılaştırılır; eşleşmezse dosya reddedilir (ör. `.png` olarak yeniden adlandırılmış bir
  metin/çalıştırılabilir dosya kabul edilmez).
- **Sunucu tarafında üretilen dosya adı**: kaydedilen dosya adı `katılımcıKodu-etiket-rastgeleUUID.tespitEdilenUzantı`
  biçimindedir; istemcinin gönderdiği orijinal dosya adı diskte hiçbir zaman kullanılmaz —
  path traversal veya adlandırma tabanlı saldırılara yüzey bırakmaz.
- Reddedilen bir yükleme katılımcının aşamasını **ilerletmez**; katılımcı aynı ekranda geçerli
  bir dosyayla (veya dosya olmadan, eskiz isteğe bağlı olduğu için) tekrar deneyebilir.
- Dosya, doğrulamadan sonra diske değil doğrudan veritabanına kaydedilir (Aşama 10, bkz.
  aşağıdaki "Bulut barındırma ve veritabanı" bölümü) — statik olarak servis edilmez, yalnızca
  kimlik doğrulamalı `/api/admin/sketch/**` uç noktası üzerinden erişilebilir.

## Araştırmacı paneli ve veri dışa aktarma (Aşama 7'de uygulandı)

- `/admin` ve `/api/admin/**` (dolayısıyla CSV/JSON export dahil) `middleware.ts` içinde HTTP
  Basic Auth ile korunur; kimlik bilgileri yalnızca `.env.local`'deki `ADMIN_USERNAME` /
  `ADMIN_PASSWORD` ortam değişkenlerinden okunur, kod içinde hiçbir yerde sabitlenmemiştir.
  Bu değişkenler tanımlı değilse panel 500 döner (sessizce açık kalmaz).
- Basit bir küçük ölçekli araştırma aracı için bilinçli bir kapsam kararı: özel bir oturum
  tablosu veya giriş sayfası yok — tarayıcı kimlik bilgilerini standart Basic Auth akışıyla
  ister/önbelleğe alır. Daha büyük ölçekli veya çok kullanıcılı bir dağıtımda oturum
  zaman aşımı olan uygun bir kimlik doğrulama sistemi ile değiştirilmelidir.
- Panel yalnızca **görüntüleme ve dışa aktarma** sağlar; görev brief'leri, ölçek maddeleri,
  AI promptları ve fuzzy kuralları hâlâ doğrudan ilgili `config/*.ts` dosyaları düzenlenerek
  değiştirilir — panelden düzenleme arayüzü bilinçli olarak kapsam dışı bırakıldı.
- CSV dışa aktarma UTF-8 BOM ile başlar (Excel'de Türkçe karakterlerin doğru görünmesi için);
  JSON dışa aktarma ham veriyi tam olarak korur.

## Admin güvenliği sertleştirmeleri (Aşama 8'de uygulandı)

- **Sabit zamanlı (constant-time) kimlik bilgisi karşılaştırması** (`middleware.ts`): kullanıcı
  adı/parola artık doğrudan `===` ile değil, her iki tarafın SHA-256 özeti sabit uzunlukta
  bayt bayt karşılaştırılarak doğrulanır — yanıt süresinden parola uzunluğu veya doğru bir
  önek bulunduğu çıkarılamaz.
- **Başarısız deneme kilitleme**: aynı istemciden (IP) 5 dakika içinde 5 başarısız denemeden
  sonra 5 dakikalık kilitlenme uygulanır (429 + `Retry-After` header'ı), kilitli durumda
  **doğru** parola bile kabul edilmez — kaba kuvvet (brute-force) denemelerini önemli ölçüde
  yavaşlatır. Durum bellek içinde (module-level `Map`) tutulur; sunucu yeniden başladığında
  sıfırlanır ve tek sunuculu bu dağıtım ölçeği için yeterlidir — çoklu sunucu/serverless bir
  dağıtımda paylaşılan bir depoya (ör. Redis) taşınmalıdır.
- **Savunma amaçlı HTTP başlıkları**: `/admin` ve `/api/admin/**` yanıtlarının tümünde
  `X-Frame-Options: DENY` (clickjacking'e karşı), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer` ve `X-Robots-Tag: noindex, nofollow` (arama motoru/crawler
  indekslemesine karşı) bulunur.
- **CSV formül enjeksiyonu (formula injection) düzeltmesi** (`lib/csv.ts`): katılımcının
  yazdığı serbest metin alanları (fikir başlığı/açıklaması vb.) `=`, `+`, `-`, `@`, tab veya
  satır başı ile başlıyorsa, hücrenin başına tek tırnak eklenir — böylece araştırmacı dışa
  aktarılan dosyayı Excel/Sheets'te açtığında katılımcı tarafından yazılmış bir metin asla
  formül olarak çalıştırılmaz. (Test edildi: `=cmd|'/c calc'!A1` ve
  `+HYPERLINK("http://evil.example/...")` gibi girdiler metne dönüştürüldü.)
- **Kimlik bilgisi/gizli anahtar sızıntısı incelemesi**: kod tabanındaki tüm `console.error`
  çağrıları ve `process.env` kullanımları gözden geçirildi — `ANTHROPIC_API_KEY` hiçbir log
  satırına yazılmıyor (Anthropic SDK hata nesneleri yalnızca *yanıt* başlıklarını taşır,
  giden `x-api-key` başlığını asla içermez); `NEXT_PUBLIC_*` öneki hiçbir yerde kullanılmadığı
  için hiçbir gizli değer istemci paketine sızmıyor.
- **Kapsam notu — HTTPS gereksinimi**: HTTP Basic Auth kimlik bilgilerini yalnızca base64 ile
  kodlar, şifrelemez. Bu panel yerel geliştirme dışında **yalnızca HTTPS arkasında**
  çalıştırılmalıdır; düz HTTP üzerinden herkese açık bir sunucuya dağıtılırsa kimlik
  bilgileri ağ üzerinde açık metin olarak okunabilir.

## Bulut barındırma ve veritabanı (Aşama 10'da uygulandı — Vercel + Neon)

- Katılımcıların araştırmacının bilgisayarı sürekli açık olmadan, internetten herhangi bir
  yerden erişebilmesi için uygulama **Vercel**'de barındırılacak şekilde hazırlandı. Vercel'in
  serverless fonksiyonları kalıcı bir dosya sistemi sağlamadığından (yerel SQLite dosyası her
  istekte kaybolabilir), veri katmanı **Neon** üzerinde barındırılan bir **Postgres**
  veritabanına taşındı (`lib/db.ts`, `@neondatabase/serverless`).
- Bağlantı `DATABASE_URL` ortam değişkeninden okunur (`.env.local` yerelde, Vercel proje
  ayarlarında üretimde; asla `NEXT_PUBLIC_*` değil, asla kod içinde sabitlenmez). Tanımlı
  değilse uygulama başlamayı reddeder.
- Etik kurul onaylı Bilgilendirilmiş Onam Formu ve Onam Formu Eki, verilerin **"şifreli ve
  erişimi sınırlandırılmış"** bir depolama alanında saklanacağını taahhüt eder. Neon, veriyi
  kendi altyapısında sunucu tarafında (at-rest) şifreler ve bağlantılar yalnızca TLS
  (`sslmode=require`) üzerinden kurulur — bu taahhüt artık uygulama kodunun kendisi değil,
  barındırma sağlayıcısı tarafından karşılanıyor (önceki aşamadaki SQLCipher/yerel şifreleme
  yaklaşımının yerini aldı).
- **Eskiz/diyagram dosyaları artık yerel diske değil, veritabanına (Postgres `bytea` sütunu)
  kaydediliyor** (`initial_ideas.sketch_data`, `revised_ideas.sketch_data`) — aynı kalıcı
  disk kısıtı dosya yüklemeleri için de geçerli olduğundan. Dosya türü doğrulaması (magic-byte
  sniffing) ve sunucu tarafında üretilen dosya adı değişmeden korunuyor (`lib/save-upload.ts`).
- Araştırmacı panelinden eskizleri doğrudan görüntüleyip indirebilen yeni bir uç nokta eklendi:
  `/api/admin/sketch/[initial|revised]/[kod]/[görev]` — `middleware.ts`'deki aynı Basic Auth
  koruması altında, katılımcı ekranlarından hiçbir bağlantısı yok.

## Sonraki aşamalarda ele alınacak riskler

- Basic Auth kilitleme mekanizması tek sunuculu bellek içi durum kullanır — Vercel'in çoklu/
  serverless dağıtım modelinde her fonksiyon çağrısı kendi belleğiyle başlayabileceğinden bu
  kilitleme artık güvenilir değildir; paylaşılan bir depoya (ör. Redis/Upstash) taşınmalıdır.
- Vercel'in varsayılan istek gövdesi boyut sınırı (~4.5 MB, plana göre değişir)
  `MAX_UPLOAD_BYTES` (10 MB) sınırından düşük olabilir — bu durumda büyük bir eskiz dosyası,
  uygulamanın kendi hata mesajından önce platform düzeyinde bir 413 hatasıyla reddedilebilir.
- Ses kaydının uygulama dışında, ayrı güvenli bir araçla alınması (uygulama hiçbir zaman
  mikrofon erişimi istemez).
