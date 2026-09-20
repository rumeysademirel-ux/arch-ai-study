// Görev 1 metni, etik kurul onaylı Onam Formu Eki'nden birebir alınmıştır.
// Görev 2 metni araştırmacı tarafından revize edilmiştir (Görev 1'in
// programını yeniden adlandırmamak için "ortak üretim ve paylaşım" senaryosu);
// onaylı ekteki Görev 2 metninden farklıdır. `taskKey` değerleri veritabanı
// kayıtlarında ve fuzzy/AI çağrılarında değişmez tanımlayıcı olarak kullanılır.

export interface TaskBrief {
  taskKey: "task-a" | "task-b";
  title: string;
  problem: string;
  // Aşağıdaki üç alan, onaylı görev metninde ayrı başlıklar yoksa boş bırakılır
  // ve görev ekranında/AI mesajında hiç gösterilmez.
  targetUser?: string;
  keyNeeds?: string[];
  constraints?: string[];
  expectedOutput: string;
  durationMinutes: number;
}

export const taskA: TaskBrief = {
  taskKey: "task-a",
  title: "Görev 1 — Öğrenci Ortak Öğrenme ve Etkileşim Alanı",
  problem:
    "Bir üniversite kampüsünde öğrencilerin dersler ve stüdyo çalışmaları arasında " +
    "kullanabilecekleri yaklaşık 150 m² büyüklüğünde bir öğrenci ortak öğrenme ve etkileşim " +
    "alanının tasarlanması istenmektedir. Mekânın farklı kullanım biçimlerini aynı yapı " +
    "içerisinde desteklemesi beklenmektedir.",
  targetUser: "Üniversite kampüsündeki öğrenciler.",
  keyNeeds: [
    "Bireysel olarak çalışabilecekleri alanlar",
    "Küçük gruplar hâlinde bir araya gelebilecekleri çalışma ve tartışma alanları",
    "Kısa süreli dinlenme ve bekleme alanları",
    "Gündelik sosyal etkileşimi destekleyen ortak alanlar",
  ],
  constraints: ["Yaklaşık 150 m² alan büyüklüğü"],
  expectedOutput:
    "Tasarımdan, bu farklı kullanım biçimleri arasında mekânsal ilişkiler kurması; bireysel " +
    "ve ortak kullanım, odaklanma ve sosyalleşme, hareket ve durma gibi farklı ihtiyaçları " +
    "bir arada ele alması beklenmektedir. Ayrıntılı bir mimari proje, teknik çizim veya " +
    "uygulamaya yönelik tamamlanmış bir tasarım çözümü geliştirmeniz beklenmemektedir — " +
    "verilen program doğrultusunda temel mekânsal yaklaşımınızı ve kullanıcı deneyimine " +
    "ilişkin tek bir kavramsal mimari tasarım fikri geliştirmeniz yeterlidir.",
  durationMinutes: 15,
};

export const taskB: TaskBrief = {
  taskKey: "task-b",
  title: "Görev 2 — Ortak Üretim ve Paylaşım İç Mekânı",
  problem:
    "Yaklaşık 150 m² büyüklüğündeki mevcut bir iç mekânın, farklı üretim ve paylaşım biçimlerini " +
    "destekleyen bir ortak üretim ve paylaşım alanı olarak yeniden düzenlenmesi istenmektedir.\n\n" +
    "Mekânın, kullanıcıların tek başlarına veya birlikte bir şeyler üretebilecekleri, devam eden " +
    "üretimleri birbirleriyle paylaşabilecekleri ve ortaya çıkan çalışmaların geçici olarak " +
    "sergilenebileceği veya sunulabileceği farklı kullanım durumlarına olanak sağlaması " +
    "beklenmektedir. Mekân aynı zamanda kısa süreli buluşmalara ve gündelik etkileşimlere de imkân " +
    "vermelidir.",
  targetUser:
    "Mekânı tek başlarına veya birlikte üretim yapmak, üretimlerini paylaşmak ve sergilemek için " +
    "kullanacak kişiler.",
  keyNeeds: [
    "Tek başlarına veya birlikte bir şeyler üretebilecekleri alanlar",
    "Devam eden üretimleri birbirleriyle paylaşabilecekleri alanlar",
    "Ortaya çıkan çalışmaların geçici olarak sergilenebileceği veya sunulabileceği alanlar",
    "Kısa süreli buluşmalara ve gündelik etkileşimlere imkân veren alanlar",
  ],
  constraints: ["Yaklaşık 150 m² büyüklüğünde, mevcut bir iç mekân"],
  expectedOutput:
    "Tasarımdan, üretim süreci ile ortaya çıkan ürünlerin paylaşılması arasındaki ilişkiyi mekânsal " +
    "olarak ele alması; daha bireysel ve kontrollü kullanımlar ile ortak ve görünür kullanımlar " +
    "arasında ilişkiler kurması beklenmektedir. Mekânın farklı zamanlarda üretim, paylaşım, " +
    "sergileme veya kısa süreli buluşma gibi farklı kullanımlara nasıl cevap verebileceği de " +
    "tasarım yaklaşımının bir parçası olarak düşünülmelidir.\n\n" +
    "Bu görev kapsamında ayrıntılı uygulama çizimleri, teknik detaylar veya tamamlanmış bir iç " +
    "mekân projesi geliştirmeniz beklenmemektedir. Verilen program doğrultusunda temel mekânsal " +
    "yaklaşımınızı ve kullanıcı deneyimine ilişkin tek bir kavramsal tasarım fikri geliştirmeniz " +
    "yeterlidir.",
  durationMinutes: 15,
};

const TASKS_BY_KEY: Record<TaskBrief["taskKey"], TaskBrief> = {
  "task-a": taskA,
  "task-b": taskB,
};

export function getTaskByKey(taskKey: TaskBrief["taskKey"]): TaskBrief {
  return TASKS_BY_KEY[taskKey];
}
