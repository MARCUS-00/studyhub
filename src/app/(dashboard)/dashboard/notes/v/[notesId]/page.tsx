"use client";
import { DisLikeButton, LikeButton } from "@/components/notesCard";
import { useAppSelector } from "@/store/index";
import { NotesSelector } from "@/store/notes.slice";
import { SupaClient } from "@/utils/supabase";
import moment from "moment";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AiOutlineArrowLeft, AiOutlineUser } from "react-icons/ai";

export default function ViewNotesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.notesId as string;
  const feed = useAppSelector((state) => NotesSelector.selectById(state, id));

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
        <div className="w-full px-10 flex border-b border-gray-300 py-4 items-center gap-3">
          <AiOutlineArrowLeft
            className="text-xl cursor-pointer"
            onClick={() => router.back()}
          />
          <span className="text-xl">Notes</span>
        </div>
        <div>
          <div className="relative w-full" style={{ height: "700px" }}>
            <iframe
              src={
                feed?.file_url?.startsWith("f/")
                  ? SupaClient.storage.from("notes").getPublicUrl(feed.file_url)
                      .data.publicUrl
                  : feed?.file_url ?? ""
              }
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <div className="p-3">
            <div className="flex gap-2 items-center">
              {feed?.User.prof_image ? (
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
                    {feed?.title}
                  </h1>{" "}
                  <span className="text-slate-600">·</span>{" "}
                  <span className="text-sm text-slate-500">
                    {moment(new Date(feed?.uploaded_date!)).fromNow()}
                  </span>
                </div>
                <span className="text-sm text-slate-500">
                  {feed?.User.first_name}
                </span>
              </div>
            </div>
            <div className="py-2 px-5 flex items-center gap-3 flex-wrap">
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Branch - {feed?.branch_name}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Sem - {feed?.sem_no}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Subject Code - {feed?.subjects.sub_code}
              </span>
              <span className="bg-green-200 text-green-500 rounded-full px-2 py-1">
                Subject - {feed?.subjects.sub_name}
              </span>
            </div>
            <div className="flex justify-end gap-5 py-3 px-2">
              <LikeButton noteId={feed.id} initialLikes={feed.likes ?? 0} />
              <DisLikeButton noteId={feed.id} initialDislikes={feed.dislikes ?? 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
