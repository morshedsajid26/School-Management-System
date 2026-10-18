import React, { Suspense } from "react";
import StudentProfileClient from "./StudentProfileClient";
import { mockStudents } from "@/data/mock/students";

export function generateStaticParams() {
  return mockStudents.map((student) => ({
    id: student.id,
  }));
}

export default async function StudentProfilePage({ params }) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading student record...
        </div>
      }
    >
      <StudentProfileClient studentId={resolvedParams?.id} />
    </Suspense>
  );
}
