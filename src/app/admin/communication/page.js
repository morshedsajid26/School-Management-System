"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Megaphone, Mail, Bell, Plus, Send, CheckCircle2 } from "lucide-react";

export default function AdminCommunicationPage() {
  const [notices, setNotices] = useState([
    {
      id: "NTC-01",
      title: "Parent-Teacher Academic Consultation Day",
      audience: "All Faculty & Students",
      date: "March 18, 2026",
      priority: "High",
      author: "Principal's Office",
      summary: "Scheduled for next Friday. Homeroom teachers will host individual academic reviews in 15-minute slots.",
    },
    {
      id: "NTC-02",
      title: "Science & Robotics Fair Submissions Open",
      audience: "Grades 8 through 10",
      date: "March 16, 2026",
      priority: "Normal",
      author: "Science Department",
      summary: "Project proposals must be signed off by respective science advisors by next Wednesday.",
    },
    {
      id: "NTC-03",
      title: "Campus Security & ID Badge Policy Reminder",
      audience: "All Campus Staff",
      date: "March 10, 2026",
      priority: "Normal",
      author: "Administration",
      summary: "Please ensure official RFID access credentials are worn on campus perimeter checkpoints.",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Communication"
        subtitle="Broadcast campus notices, emergency bulletins, SMS reminders, and administrative announcements."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert("Simulating Compose Notice Modal...")}
          >
            Create Notice
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Bulletins"
          value="3 Notices"
          description="Live on Student & Teacher Portals"
          icon={Megaphone}
          variant="indigo"
        />
        <StatsCard
          title="SMS Deliveries This Month"
          value="2,410 Sent"
          description="Fee alerts & emergency advisories"
          icon={Mail}
          variant="emerald"
        />
        <StatsCard
          title="Open Rates"
          value="98.4%"
          description="Via SMS and Portal Inbox"
          icon={Bell}
          variant="amber"
        />
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} hover>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div>
                    <CardTitle className="text-sm">{notice.title}</CardTitle>
                    <p className="text-[11px] text-slate-400">
                      Posted by {notice.author} • {notice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={notice.priority === "High" ? "rose" : "slate"} size="sm">
                    {notice.priority} Priority
                  </Badge>
                  <Badge variant="blue" size="sm">
                    {notice.audience}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 leading-relaxed">
                {notice.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
