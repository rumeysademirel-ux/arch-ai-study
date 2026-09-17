// Etik kurul onaylı Bilgilendirilmiş Onam Formu Eki'nden (Bölüm 2 ve Bölüm 3,
// "Tasarım Senaryosu" bölümleri) birebir alınmıştır. Bu artık taslak değil —
// onaylanmış son metindir; değiştirilmesi etik kurul başvurusuyla uyumsuzluk
// yaratır. `taskKey` değerleri veritabanı kayıtlarında ve fuzzy/AI
// çağrılarında değişmez tanımlayıcı olarak kullanılır.

export interface TaskBrief {
  taskKey: "task-a" | "task-b";
  title: string;
  problem: string;
  targetUser: string;
  keyNeeds: string[];
  constraints: string[];
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
  title: "Görev 2 — Gençler İçin Ortak Çalışma ve Etkileşim İç Mekânı",
  problem:
    "Bir kent merkezinde yer alan mevcut bir yapının yaklaşık 150 m² büyüklüğündeki iç " +
    "mekânının, genç yetişkinlerin bireysel çalışma, küçük gruplar hâlinde bir araya gelme, " +
    "kısa süreli dinlenme ve sosyal etkileşim ihtiyaçlarını karşılayacak şekilde yeniden " +
    "düzenlenmesi istenmektedir.",
  targetUser: "Kent merkezindeki genç yetişkinler.",
  keyNeeds: [
    "Bireysel çalışma alanları",
    "Küçük grup çalışma ve tartışma alanları",
    "Kısa süreli dinlenme ve bekleme alanları",
    "Gündelik sosyal etkileşimi destekleyen ortak kullanım alanları",
  ],
  constraints: ["Yaklaşık 150 m² büyüklüğünde, mevcut bir yapının iç mekânı"],
  expectedOutput:
    "Tasarımdan, farklı kullanım biçimleri arasında anlamlı mekânsal ilişkiler kurması; " +
    "bireysel ve ortak kullanım, odaklanma ve sosyalleşme, hareket ve durma gibi farklı " +
    "ihtiyaçları aynı iç mekân içerisinde birlikte ele alması beklenmektedir. Ayrıntılı " +
    "uygulama çizimleri, teknik detaylar veya tamamlanmış bir iç mekân projesi geliştirmeniz " +
    "beklenmemektedir — verilen program doğrultusunda tek bir kavramsal mekânsal yaklaşım " +
    "geliştirmeniz yeterlidir.",
  durationMinutes: 15,
};

const TASKS_BY_KEY: Record<TaskBrief["taskKey"], TaskBrief> = {
  "task-a": taskA,
  "task-b": taskB,
};

export function getTaskByKey(taskKey: TaskBrief["taskKey"]): TaskBrief {
  return TASKS_BY_KEY[taskKey];
}
