import { Tests } from "@/store/tests.slice";
import Image from "next/image";
import React from "react";
import { AiOutlineUser } from "react-icons/ai";

const IMAGES = [
  "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781440583810/math-geek-9781440583810_hr.jpg",
  "https://m.media-amazon.com/images/I/91JLJ+dZOUL._AC_UF1000,1000_QL80_.jpg",
  "https://i.pinimg.com/originals/17/23/89/1723894e4cd15ef0f972838e307b7830.jpg",
  "https://m.media-amazon.com/images/I/911IjI1tl2L._AC_UF1000,1000_QL80_.jpg",
];

const stableImg = (id: string) =>
  IMAGES[id.split("").reduce((a, c) => a + c.codePointAt(0)!, 0) % IMAGES.length];

function getPctBadgeCls(pct: number): string {
  if (pct >= 60) return "bg-emerald text-white";
  if (pct >= 40) return "bg-amber-400 text-white";
  return "bg-red-400 text-white";
}

export default function Test({
  feed,
  isViewTest,
  score,
  totalQuestions,
}: Readonly<{
  feed: Tests;
  isViewTest?: boolean;
  score?: number;
  totalQuestions?: number;
}>) {
  const showScore = isViewTest && score !== undefined && totalQuestions !== undefined && totalQuestions > 0;
  const pct = showScore ? Math.round((score / totalQuestions) * 100) : null;
  const scoreBadgeCls = pct === null ? "" : getPctBadgeCls(pct);

  return (
    <div className="group bg-white rounded-2xl border border-forest/8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={stableImg(feed.id)}
          fill
          alt="test cover"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {feed.questions?.length > 0 && (
          <span className="absolute top-2 left-2 text-xs font-semibold bg-forest text-white px-2 py-0.5 rounded-full">
            {feed.questions.length} Qs
          </span>
        )}
        {showScore && pct !== null && (
          <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${scoreBadgeCls}`}>
            {pct}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        {feed.subjectsSub_code && (
          <span className="text-[10px] bg-emerald/10 text-emerald-700 rounded-full px-2 py-0.5 w-fit font-semibold uppercase tracking-wide">
            {feed.subjectsSub_code}
          </span>
        )}
        <h1 className="font-display font-semibold text-sm text-ink line-clamp-1">
          {feed.test_title}
        </h1>

        {showScore && (
          <p className="text-xs text-muted">
            Score: <span className="font-semibold text-ink">{score} / {totalQuestions}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {feed.User.prof_image ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-forest/10">
                <Image src={feed.User.prof_image} fill alt="avatar" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-forest/10 flex items-center justify-center">
                <AiOutlineUser className="text-xs text-forest" />
              </div>
            )}
            <span className="text-xs text-muted">{feed.User.first_name}</span>
          </div>
        </div>

        <button
          className={`w-full mt-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isViewTest
              ? "bg-forest/8 text-forest hover:bg-forest/15"
              : "bg-emerald text-white hover:bg-emerald/90"
          }`}
        >
          {isViewTest ? "View Result" : "Attend"}
        </button>
      </div>
    </div>
  );
}
