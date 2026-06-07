"use client";
import { useAppDispatch } from "@/utils/hooks";
import { useAppSelector } from "@/store/index";
import {
  TestsSelector,
  getTestsWithQuestions,
  getTestsWithQuestionsAnswers,
} from "@/store/tests.slice";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: props) {
  const dispatch = useAppDispatch();
  const tid = useParams().tid;
  const session = useSession();

  useEffect(() => {
    if (session.data?.user?.id) {
      dispatch(
        getTestsWithQuestionsAnswers({
          testId: tid,
          userId: session.data.user.id,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user?.id, tid]);

  return <div>{children}</div>;
}
