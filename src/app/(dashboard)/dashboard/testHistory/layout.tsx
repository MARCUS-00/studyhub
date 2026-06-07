"use client";
import { useAppDispatch } from "@/utils/hooks";
import { useAppSelector } from "@/store/index";
import { TestsSelector, getTestsWithQuestions } from "@/store/tests.slice";
import { useEffect } from "react";

interface props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: props) {
  const dispatch = useAppDispatch();
  const testIds = useAppSelector(TestsSelector.selectIds);

  useEffect(() => {
    if (testIds.length === 0) dispatch(getTestsWithQuestions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{children}</div>;
}
