import React, { Suspense } from "react";
import HomeworkDetailClient from "./HomeworkDetailClient";
import { mockHomeworkList } from "@/data/mock/homework";

export function generateStaticParams() {
  return mockHomeworkList.map((hw) => ({
    id: hw.id,
  }));
}

export default async function HomeworkDetailPage({ params }) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading assignment details & submissions...
        </div>
      }
    >
      <HomeworkDetailClient homeworkId={resolvedParams?.id} />
    </Suspense>
  );
}
