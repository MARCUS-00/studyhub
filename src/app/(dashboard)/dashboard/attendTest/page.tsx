"use client";
import Test from "@/components/Test";
import { useAppSelector } from "@/store/index";
import { TestsSelector } from "@/store/tests.slice";
import Link from "next/link";

export default function AttendTestsPage() {
  const Tests = useAppSelector(TestsSelector.selectAll);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-ink">Available Tests</h2>
        <p className="text-sm text-muted mt-1">{Tests.length} tests available</p>
      </div>
      {Tests.length === 0 ? (
        <p className="text-muted text-sm">No tests available yet.</p>
      ) : (
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
          {Tests.map((feed) => (
            <Link key={feed.id} href={`/dashboard/attendTest/t/${feed.id}`}>
              <Test feed={feed} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
