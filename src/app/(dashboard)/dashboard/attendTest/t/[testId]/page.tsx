"use client";
import { useAppSelector } from "@/store/index";
import { TestsSelector } from "@/store/tests.slice";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { SupaClient } from "@/utils/supabase";
import { useSession } from "next-auth/react";

export default function TestViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.testId;
  const feed = useAppSelector((state) => TestsSelector.selectById(state, id));
  const [state, setState] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setSubmit] = useState(false);
  const session = useSession();

  const onSubmit = async () => {
    setSubmit(true);
    try {
      if (feed) {
        let totalMarks = 0;
        await Promise.all(
          feed.questions.map(async (question) => {
            const response = await SupaClient.from("questions")
              .select("answer")
              .eq("id", question.id)
              .single();
            const isCorrect = state[question.id] === response.data?.answer;
            if (isCorrect) totalMarks++;
            await SupaClient.from("answers").insert({
              answer: state[question.id] ?? "",
              questionsId: question.id,
              userId: session.data?.user?.id,
              marks: isCorrect ? 1 : 0,
            });
          })
        );
        await SupaClient.from("marks").insert({
          marks: totalMarks,
          testsId: feed.id,
          userId: session.data?.user?.id,
        });
        router.replace(`/dashboard/attendTest/t/${feed.id}/r/${feed.id}`);
      }
    } catch (e) {
      toast.error("Something went wrong!");
    }
    setSubmit(false);
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
      </div>

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
