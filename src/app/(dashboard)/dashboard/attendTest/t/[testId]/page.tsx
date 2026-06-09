"use client";
import { useAppSelector } from "@/store/index";
import { TestsSelector } from "@/store/tests.slice";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft, AiOutlineClockCircle } from "react-icons/ai";
import { useSession } from "next-auth/react";

export default function TestViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.testId as string;
  const feed = useAppSelector((state) => TestsSelector.selectById(state, id));
  const [state, setState] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setSubmit] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const session = useSession();

  // Countdown timer (seconds). Initialised once feed loads.
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for an existing submission so students cannot submit twice.
  useEffect(() => {
    const userId = session.data?.user?.id;
    if (!userId || !id) return;
    fetch(`/api/tests/submit?testId=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.submitted) setAlreadySubmitted(true); })
      .catch(() => {});
  }, [session.data?.user?.id, id]);

  // Seed the timer once feed is available and has a duration.
  useEffect(() => {
    if (feed?.duration_minutes && !alreadySubmitted && timeLeft === null) {
      setTimeLeft(feed.duration_minutes * 60);
    }
  }, [feed?.duration_minutes, alreadySubmitted, timeLeft]);

  const onSubmit = useCallback(async () => {
    if (alreadySubmitted) {
      toast.error("You have already submitted this test.");
      return;
    }
    if (!feed) return;
    setSubmit(true);
    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: id,
          answers: feed.questions.map((q) => ({
            questionId: q.id,
            answer: state[q.id] ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (data.alreadySubmitted) {
        setAlreadySubmitted(true);
        router.replace(`/dashboard/attendTest/t/${id}/r/${id}`);
        return;
      }
      if (!res.ok) { toast.error(data.error ?? "Submission failed."); return; }
      setAlreadySubmitted(true);
      router.replace(`/dashboard/attendTest/t/${id}/r/${id}`);
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setSubmit(false);
    }
  }, [alreadySubmitted, feed, id, router, state]);

  // Tick the timer; auto-submit on expiry.
  useEffect(() => {
    if (timeLeft === null || alreadySubmitted) return;
    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      toast("Time's up! Submitting your answers…", { icon: "⏰" });
      onSubmit();
      return;
    }
    timerRef.current = setInterval(() => setTimeLeft((t) => (t ?? 1) - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, alreadySubmitted, onSubmit]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!feed) {
    return (
      <div className="flex p-10 justify-center">
        <p className="text-muted">Loading test...</p>
      </div>
    );
  }

  const total = feed.questions.length;
  const answered = Object.keys(state).length;

  if (alreadySubmitted) {
    return (
      <div className="flex p-10 justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-ink mb-2">You have already submitted this test.</p>
          <button
            onClick={() => router.replace(`/dashboard/attendTest/t/${feed.id}/r/${feed.id}`)}
            className="mt-4 px-6 py-2 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-mid transition-colors"
          >
            View Result
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white border border-forest/10 flex items-center justify-center hover:bg-forest/5 transition-colors"
        >
          <AiOutlineArrowLeft className="text-ink" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-semibold text-ink">{feed.test_title}</h1>
          <p className="text-xs text-muted mt-0.5">{answered} of {total} answered</p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold tabular-nums ${
            timeLeft <= 60 ? "bg-red-50 text-red-500 border border-red-200" : "bg-emerald/10 text-emerald"
          }`}>
            <AiOutlineClockCircle className="flex-shrink-0" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Duration + instructions banner */}
      {(feed.duration_minutes || feed.instructions) && (
        <div className="bg-white rounded-2xl border border-forest/8 shadow-card p-4 mb-6 space-y-1.5">
          {feed.duration_minutes && (
            <div className="flex items-center gap-2 text-sm text-ink">
              <AiOutlineClockCircle className="text-emerald flex-shrink-0" />
              <span><span className="font-semibold">{feed.duration_minutes} minutes</span> time limit</span>
            </div>
          )}
          {feed.instructions && (
            <p className="text-sm text-muted pl-6">{feed.instructions}</p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-cream-dk rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-emerald rounded-full transition-all duration-300"
          style={{ width: total > 0 ? `${(answered / total) * 100}%` : "0%" }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {feed.questions.map((question, index) => {
          const isAnswered = !!state[question.id];
          return (
            <div
              key={question.id}
              className={`bg-white rounded-2xl border p-6 transition-colors ${
                isAnswered ? "border-emerald/30" : "border-forest/8"
              }`}
            >
              <h2 className="font-medium text-ink mb-4">
                <span className="text-muted font-normal mr-2">{index + 1}.</span>
                {question.question}
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {question.choices?.map((choice) => {
                  const selected = state[question.id] === choice;
                  return (
                    <label
                      key={choice}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                        selected
                          ? "border-emerald bg-emerald/8 text-emerald-700"
                          : "border-forest/10 hover:border-emerald/30 hover:bg-emerald/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${question.id}`}
                        value={choice}
                        checked={selected}
                        onChange={() =>
                          setState((prev) => ({ ...prev, [question.id]: choice }))
                        }
                        className="accent-emerald"
                      />
                      <span className="text-sm">{choice}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isSubmitting || answered === 0}
          className="bg-emerald text-white font-semibold px-8 py-3 rounded-xl hover:bg-emerald/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Submitting…"
            : `Submit (${answered}/${total} answered)`}
        </button>
      </div>
    </div>
  );
}
