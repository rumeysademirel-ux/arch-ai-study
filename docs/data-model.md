# Veri Modeli

## Durum

- ✅ = Postgres tablosu olarak var (Neon, `lib/db.ts`)
- ⏳ = Kullanıcının tam gereksinim listesinde var, sonraki aşamada eklenecek
- ➖ = Bilinçli olarak uygulama dışında tutuluyor (veritabanında karşılığı yok)

| Varlık (kullanıcı listesi) | Durum | Karşılığı |
|---|---|---|
| Participant | ✅ | `participants` |
| Consent | ➖ (uygulama dışı) | Yazılı belge (ıslak imza) ile alınır; uygulamada dijital onam ekranı/tablosu yoktur |
| Demographics | ✅ | `demographics` |
| MSTATResponses | ✅ | `mstat_responses` |
| MSTATScore | ✅ | `mstat_scores` (katılımcıya gösterilmez) |
| AssignedSequence | ✅ | `participants.assigned_group` (1-4) + `config/counterbalancing.ts` → `GROUP_SEQUENCES` |
| Task | ✅ (2 görev) | `task_sessions` + `config/tasks.ts` (taskA/taskB, statik) |
| InitialIdea | ✅ | `initial_ideas` (her görev için ayrı satır, `task_key` ile ayrışır) |
| InitialSketch | ✅ | `initial_ideas.sketch_data` (bytea) + `sketch_filename`/`sketch_mime` |
| PreFeedbackState | ✅ | `pre_assessments` |
| FuzzyInputs | ✅ | `ai_feedback_events.fuzzy_inputs` (yalnızca `condition='adaptive'`) |
| MembershipValues | ✅ | `ai_feedback_events.fuzzy_membership` |
| ActivatedRules | ✅ | `ai_feedback_events.fuzzy_rules` |
| FuzzyOutput | ✅ | `ai_feedback_events.fuzzy_output` |
| FeedbackCondition | ✅ (`standard`/`adaptive`) | `ai_feedback_events.condition`; her görev için `assigned_group` + görev pozisyonundan (`config/counterbalancing.ts`) türetilir |
| PromptSentToAI | ✅ | `ai_feedback_events.prompt_sent` |
| AIResponse | ✅ (gerçek AI çağrısı) | `ai_feedback_events.feedback_text` + `ai_feedback_events.model` |
| RevisedIdea | ✅ | `revised_ideas` |
| RevisedSketch | ✅ | `revised_ideas.sketch_data` (bytea) + `sketch_filename`/`sketch_mime` |
| PostFeedbackState | ✅ | `post_assessments` |
| FeedbackEvaluation | ✅ (post_assessments içinde) | `post_assessments` |
| Timestamps | ✅ | her tabloda `created_at`/`submitted_at`/`shown_at` vb. |
| TaskDuration | ✅ | `task_sessions.started_at/ended_at` |
| InterviewCompleted | ⏳ | Görüşme ekranı henüz eklenmedi |

## ER özeti

```
participants (code PK, assigned_group 1-4)
  1—1 demographics
  1—N mstat_responses (8 satır)
  1—1 mstat_scores
  1—N task_sessions (2 satır: task_key='task-a' ve 'task-b')
      1—1 initial_ideas       (participant_code, task_key)
      1—1 pre_assessments     (participant_code, task_key)
      1—1 ai_feedback_events  (participant_code, task_key)
      1—1 revised_ideas       (participant_code, task_key)
      1—1 post_assessments    (participant_code, task_key)
```

Her katılımcı iki görevi de tamamladığından, `task_key` ile ayrışan tablolarda (initial_ideas,
pre_assessments, ai_feedback_events, revised_ideas, post_assessments) her katılımcı için 2 satır
oluşur — biri `task-a`, biri `task-b` için. Hangi görevin 1. veya 2. sırada, hangi koşulla
(`standard`/`adaptive`) yapıldığı `participants.assigned_group` + `config/counterbalancing.ts`
üzerinden hesaplanır; ayrıca DB'de saklanmaz (tekrar hesaplanabilir, kaynak tek yerde).

Tüm yabancı anahtarlar `participant_code` (ve gerektiğinde `task_key`) üzerinden kurulur;
doğrudan kimlik bilgisi (ad, öğrenci no, e-posta) hiçbir tabloda tutulmaz.

Tam SQL şeması için bkz. [`lib/db.ts`](../lib/db.ts).
