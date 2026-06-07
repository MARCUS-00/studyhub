"use client";
import { Notes } from "@/store/notes.slice";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
  AiOutlineUser,
} from "react-icons/ai";
import moment from "moment";
import Link from "next/link";

const IMAGES = [
  "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781440583810/math-geek-9781440583810_hr.jpg",
  "https://m.media-amazon.com/images/I/91JLJ+dZOUL._AC_UF1000,1000_QL80_.jpg",
  "https://i.pinimg.com/originals/17/23/89/1723894e4cd15ef0f972838e307b7830.jpg",
  "https://m.media-amazon.com/images/I/911IjI1tl2L._AC_UF1000,1000_QL80_.jpg",
];
const stableImg = (id: string) =>
  IMAGES[id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % IMAGES.length];

export default function NotesCard({
  feed,
  isStaff,
}: {
  feed: Notes;
  isStaff?: boolean;
}) {
  if (!feed) return null;
  return (
    <Link
      href={`/${isStaff ? "staffDashboard" : "dashboard"}/notes/v/${feed.id}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl border border-forest/8 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={stableImg(feed.id)}
            fill
            alt="note cover"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {feed.sem_no && (
            <span className="absolute top-2.5 right-2.5 text-xs font-semibold bg-forest text-white px-2 py-0.5 rounded-full">
              Sem {feed.sem_no}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2">
          {feed.subjects?.sub_name && (
            <span className="text-[10px] bg-emerald/10 text-emerald-700 rounded-full px-2 py-0.5 w-fit font-semibold uppercase tracking-wide">
              {feed.subjects.sub_name}
            </span>
          )}
          <h1 className="font-display font-semibold text-sm text-ink line-clamp-1">
            {feed.title}
          </h1>

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
            <span className="text-xs text-muted">
              {moment(new Date(feed.uploaded_date!)).fromNow()}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-forest/5">
            <LikeButton noteId={feed.id} initialLikes={feed.likes ?? 0} />
            <DisLikeButton noteId={feed.id} initialDislikes={feed.dislikes ?? 0} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export const LikeButton = ({
  noteId,
  initialLikes,
}: {
  noteId: string;
  initialLikes: number;
}) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);

  const toggle = useCallback(async () => {
    if (!noteId) return;
    const next = !liked;
    setLiked(next);
    setCount(c => c + (next ? 1 : -1));
    await fetch("/api/notes/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, type: "like", action: next ? "add" : "remove" }),
    });
  }, [liked, noteId]);

  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={(e) => { e.preventDefault(); toggle(); }}
        className="flex justify-center items-center h-7 w-7 transition-all duration-300 hover:bg-emerald/10 rounded-full"
      >
        {liked ? (
          <AiFillLike className="text-lg text-emerald" />
        ) : (
          <AiOutlineLike className="text-lg text-muted" />
        )}
      </button>
      {count > 0 && <span className="text-xs font-medium text-emerald">{count}</span>}
    </div>
  );
};

export const DisLikeButton = ({
  noteId,
  initialDislikes,
}: {
  noteId: string;
  initialDislikes: number;
}) => {
  const [disliked, setDisliked] = useState(false);
  const [count, setCount] = useState(initialDislikes);

  const toggle = useCallback(async () => {
    if (!noteId) return;
    const next = !disliked;
    setDisliked(next);
    setCount(c => c + (next ? 1 : -1));
    await fetch("/api/notes/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, type: "dislike", action: next ? "add" : "remove" }),
    });
  }, [disliked, noteId]);

  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={(e) => { e.preventDefault(); toggle(); }}
        className="flex justify-center items-center h-7 w-7 transition-all duration-300 hover:bg-red-50 rounded-full"
      >
        {disliked ? (
          <AiFillDislike className="text-lg text-red-400" />
        ) : (
          <AiOutlineDislike className="text-lg text-muted" />
        )}
      </button>
      {count > 0 && <span className="text-xs font-medium text-red-400">{count}</span>}
    </div>
  );
};
