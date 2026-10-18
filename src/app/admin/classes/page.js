"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { mockClasses } from "@/data/mock/classes";
import { Plus, Users, DoorOpen, UserCheck, BookOpen } from "lucide-react";

export default function AdminClassesPage() {
  const [classes] = useState(mockClasses);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Academic Sections"
        subtitle="Manage student classroom assignments, class teachers, and room capacities."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert("Create class section modal simulated.")}
          >
            Create New Section
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map((cls) => {
          const occupancyRate = Math.round((cls.enrolled / cls.capacity) * 100);

          return (
            <Card key={cls.id} hover>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-lg">
                      {cls.name} • Section {cls.section}
                    </CardTitle>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Stream: {cls.stream}
                    </p>
                  </div>
                  <Badge variant={occupancyRate > 90 ? "amber" : "emerald"}>
                    {cls.enrolled} / {cls.capacity} Seats
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Classroom Occupancy</span>
                    <span className="font-semibold">{occupancyRate}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occupancyRate > 90 ? "bg-amber-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>
                      Class Teacher:{" "}
                      <strong className="text-slate-900 font-semibold">
                        {cls.classTeacher}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DoorOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Room:{" "}
                      <span className="font-mono text-slate-800 font-semibold">
                        {cls.room}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
