"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineDelete } from "react-icons/ai";

const SUBJECTS = [
  { value: "20CS21P", name: "Operating Systems" },
  { value: "20CS23P", name: "Software Engineering" },
  { value: "20CS24P", name: "Hardware" },
];

interface Choice { text: string; }
interface Question {
  question: string;
  choices: Choice[];
  answerIdx: number;
  explanation: string;
}

const emptyQuestion = (): Question => ({
  question: "",
  choices: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
  answerIdx: 0,
  explanation: "",
});

const inputCls = "w-full rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald transition";

export default function NewTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0].value);
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const updateQuestion = (i: number, field: keyof Question, value: string | number) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  const updateChoice = (qi: number, ci: number, value: string) => {
    setQuestions(qs => qs.map((q, idx) => {
      if (idx !== qi) return q;
      const choices = q.choices.map((c, cidx) => cidx === ci ? { text: value } : c);
      return { ...q, choices };
    }));
  };

  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const removeQuestion = (i: number) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const onPublish = async () => {
    if (!title.trim()) { toast.error("Please enter a test title."); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { toast.error(`Question ${i + 1} is empty.`); return; }
      if (q.choices.some((c: Choice) => !c.text.trim())) { toast.error(`All choices in question ${i + 1} must be filled.`); return; }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subCode: subject,
          durationMinutes: durationMinutes ? Number(durationMinutes) : null,
          instructions: instructions || null,
          questions: questions.map((q) => ({
            question: q.question,
            choices: q.choices.map((c) => c.text),
            answerIdx: q.answerIdx,
            explanation: q.explanation || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to publish test."); return; }
      toast.success("Test published!");
      router.push("/staffDashboard");
    } catch {
      toast.error("Failed to publish test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-forest/10 flex items-center justify-center hover:bg-forest/5 transition-colors">
          <AiOutlineArrowLeft className="text-ink" />
        </button>
        <h1 className="font-display font-semibold text-ink">Create New Test</h1>
      </div>

      {/* Test meta */}
      <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-6 mb-6 space-y-4">
        <div>
          <label htmlFor="test-title" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Test Title *</label>
          <input id="test-title" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. OS Chapter 3 Mock Test" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="test-subject" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Subject *</label>
            <select id="test-subject" value={subject} onChange={e => setSubject(e.target.value)} className={inputCls}>
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="300"
              value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value)}
              placeholder="e.g. 30"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Instructions</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="Optional instructions for students…"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white rounded-2xl border border-forest/8 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)}
                  className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors">
                  <AiOutlineDelete />
                </button>
              )}
            </div>

            <textarea
              value={q.question}
              onChange={e => updateQuestion(qi, "question", e.target.value)}
              placeholder="Enter your question here…"
              rows={2}
              className={`${inputCls} resize-none mb-4`}
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              {q.choices.map((c, ci) => {
                const isCorrect = q.answerIdx === ci;
                return (
                  <div key={ci}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                      isCorrect ? "border-emerald/40 bg-emerald/5" : "border-forest/10"
                    }`}>
                    <button
                      type="button"
                      onClick={() => updateQuestion(qi, "answerIdx", ci)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        isCorrect ? "border-emerald bg-emerald" : "border-forest/20"
                      }`}
                    />
                    <input
                      value={c.text}
                      onChange={e => updateChoice(qi, ci, e.target.value)}
                      placeholder={`Choice ${ci + 1}`}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-ink placeholder:text-muted/50"
                    />
                    {isCorrect && (
                      <span className="text-[10px] font-bold text-emerald uppercase tracking-wide">Correct</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label htmlFor={`q-${qi}-explanation`} className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Explanation (optional)</label>
              <input
                id={`q-${qi}-explanation`}
                value={q.explanation}
                onChange={e => updateQuestion(qi, "explanation", e.target.value)}
                placeholder="Explain why the correct answer is right…"
                className={inputCls}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add question */}
      <button onClick={addQuestion}
        className="w-full mt-5 py-3 border-2 border-dashed border-forest/20 text-muted hover:border-emerald/40 hover:text-emerald rounded-2xl text-sm font-medium transition-colors">
        + Add Question
      </button>

      {/* Publish */}
      <button onClick={onPublish} disabled={loading}
        className="w-full mt-5 py-3.5 bg-forest text-white font-semibold rounded-xl hover:bg-forest-lt disabled:opacity-60 transition-colors shadow-sm hover:shadow-md text-sm">
        {loading ? "Publishing…" : `Publish Test (${questions.length} question${questions.length !== 1 ? "s" : ""})`}
      </button>
    </div>
  );
}
