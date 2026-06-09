"use client";
import { DisLikeButton, LikeButton } from "@/components/notesCard";
import { useAppSelector } from "@/store/index";
import { NotesSelector } from "@/store/notes.slice";
import { SupaClient } from "@/utils/supabase";
import moment from "moment";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineSend,
  AiOutlineUser,
  AiOutlineShareAlt,
  AiOutlineCopy,
  AiOutlineStar,
} from "react-icons/ai";
import { BsBellFill, BsBell } from "react-icons/bs";
import { toast } from "react-hot-toast";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
}
interface ReviewSummary {
  average: number | null;
  count: number;
  userRating: number | null;
}

export default function ViewNotesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.notesId as string;
  const feed = useAppSelector((state) => NotesSelector.selectById(state, id));

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [review, setReview] = useState<ReviewSummary>({
    average: null,
    count: 0,
    userRating: null,
  });
  const [pendingRating, setPendingRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // Load comments
  useEffect(() => {
    if (!id) return;
    fetch(`/api/notes/comments?noteId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {});
  }, [id]);

  // Load reviews
  useEffect(() => {
    if (!id) return;
    fetch(`/api/notes/reviews?noteId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        const userRating =
          typeof data.userRating === "number" ? data.userRating : null;
        setReview({
          average: data.average ?? null,
          count: data.count ?? 0,
          userRating,
        });
        if (userRating != null) setPendingRating(userRating);
      })
      .catch(() => {});
  }, [id]);

  // Load subscription status for this note's subject
  useEffect(() => {
    if (!feed?.sub_code) return;
    fetch("/api/notes/subscriptions")
      .then((r) => r.json())
      .then((codes: string[]) => {
        if (Array.isArray(codes)) setSubscribed(codes.includes(feed.sub_code));
      })
      .catch(() => {});
  }, [feed?.sub_code]);

  const postComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/notes/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id, text: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data]);
        setCommentText("");
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    } finally {
      setPosting(false);
    }
  };

  const submitRating = async (rating: number) => {
    setPendingRating(rating);
    setSubmittingReview(true);
    try {
      await fetch("/api/notes/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id, rating }),
      });
      setReview((p) => ({ ...p, userRating: rating }));
      toast.success("Rating saved!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleSubscription = async () => {
    if (!feed?.sub_code) return;
    setSubLoading(true);
    try {
      const res = await fetch("/api/notes/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subCode: feed.sub_code }),
      });
      const data = await res.json();
      setSubscribed(data.subscribed);
      toast.success(
        data.subscribed ? "Subscribed to subject!" : "Unsubscribed.",
      );
    } finally {
      setSubLoading(false);
    }
  };

  const shareNote = async () => {
    const url = `${window.location.origin}/dashboard/notes/v/${id}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: feed?.title, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (!feed) {
    return (
      <div className="flex p-10 justify-center">
        <div className="bg-white shadow-card flex flex-col w-2/3 p-10 items-center rounded-2xl">
          <p className="text-muted">Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-10 justify-center">
      <div className="bg-white shadow-md flex flex-col w-2/3">
        {/* Header */}
        <div className="w-full px-10 flex border-b border-gray-300 py-4 items-center gap-3">
          <AiOutlineArrowLeft
            className="text-xl cursor-pointer"
            onClick={() => router.back()}
          />
          <span className="text-xl flex-1">Notes</span>
          {/* Subscribe toggle */}
          <button
            onClick={toggleSubscription}
            disabled={subLoading}
            title={
              subscribed ? "Unsubscribe from subject" : "Subscribe to subject"
            }
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              subscribed
                ? "bg-emerald text-white border-emerald"
                : "border-forest/20 text-muted hover:border-emerald/40"
            }`}
          >
            {subscribed ? (
              <BsBellFill className="text-sm" />
            ) : (
              <BsBell className="text-sm" />
            )}
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
          {/* Share */}
          <button
            onClick={shareNote}
            title="Share this note"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-forest/20 text-muted hover:border-emerald/40 transition-colors"
          >
            <AiOutlineShareAlt />
            Share
          </button>
        </div>

        {/* PDF viewer */}
        <div>
          <div className="relative w-full" style={{ height: "700px" }}>
            <iframe
              src={
                feed.file_url?.startsWith("f/")
                  ? SupaClient.storage.from("notes").getPublicUrl(feed.file_url)
                      .data.publicUrl
                  : feed.file_url ?? ""
              }
              title={feed.title}
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          {/* Meta */}
          <div className="p-3">
            <div className="flex gap-2 items-center">
              {feed.User.prof_image ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image src={feed.User.prof_image} fill alt="avatar" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-300 p-2">
                  <AiOutlineUser className="h-full w-full text-slate-500" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-sm whitespace-nowrap text-slate-950 font-medium">
                    {feed.title}
                  </h1>
                  <span className="text-slate-600">·</span>
                  <span className="text-sm text-slate-500">
                    {moment(new Date(feed.uploaded_date!)).fromNow()}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {feed.User.first_name}
                </span>
              </div>
            </div>
            <div className="py-2 px-5 flex items-center gap-3 flex-wrap">
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Branch - {feed.branch_name}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Sem - {feed.sem_no}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Subject Code - {feed.subjects.sub_code}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Subject - {feed.subjects.sub_name}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-2">
              <div className="flex gap-5">
                <LikeButton noteId={feed.id} initialLikes={feed.likes ?? 0} />
                <DisLikeButton
                  noteId={feed.id}
                  initialDislikes={feed.dislikes ?? 0}
                />
              </div>
              {/* Copy link fallback */}
              <button
                onClick={shareNote}
                className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors"
              >
                <AiOutlineCopy /> Copy link
              </button>
            </div>
          </div>
        </div>

        {/* Star rating */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => submitRating(star)}
                  disabled={submittingReview}
                  className="text-xl transition-colors"
                >
                  <AiOutlineStar
                    className={
                      star <= (pendingRating || 0)
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted"
                    }
                    style={{
                      fill: star <= (pendingRating || 0) ? "#fbbf24" : "none",
                    }}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-muted">
              {review.average != null
                ? `${review.average} avg (${review.count} rating${
                    review.count !== 1 ? "s" : ""
                  })`
                : "No ratings yet"}
            </span>
          </div>
        </div>

        {/* Comments section */}
        <div className="border-t border-gray-200 px-6 py-5">
          <h3 className="font-display font-semibold text-ink mb-4">
            Comments ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <p className="text-muted text-sm mb-4">
              No comments yet — be the first!
            </p>
          ) : (
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                    <AiOutlineUser className="text-emerald text-sm" />
                  </div>
                  <div className="flex-1 bg-cream rounded-xl px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-ink">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-muted">
                        {moment(c.createdAt).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-ink mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Composer */}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && postComment()
              }
              placeholder="Write a comment…"
              className="flex-1 rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
            <button
              onClick={postComment}
              disabled={posting || !commentText.trim()}
              className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest-lt disabled:opacity-50 transition-colors"
            >
              <AiOutlineSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
