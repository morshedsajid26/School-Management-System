"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import { Search, Plus, Mail, Phone, Users } from "lucide-react";

export default function AdminStaffPage() {
  const [staff] = useState([
    {
      id: "STF-01",
      name: "Arthur Pendelton",
      role: "Head Librarian & Media Specialist",
      department: "Library & Archives",
      phone: "+1 (555) 321-4455",
      email: "arthur.pendelton@oakridgeacademy.edu",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "STF-02",
      name: "Clara Oswald, RN",
      role: "Campus Medical Officer & Nurse",
      department: "Health & Infirmary",
      phone: "+1 (555) 321-7788",
      email: "clara.nurse@oakridgeacademy.edu",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "STF-03",
      name: "Derrick Vance",
      role: "Senior Lab Technician",
      department: "Science Laboratories",
      phone: "+1 (555) 321-9922",
      email: "derrick.vance@oakridgeacademy.edu",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "STF-04",
      name: "Helena Rostova",
      role: "Administrative Office Coordinator",
      department: "Registrar Office",
      phone: "+1 (555) 321-6611",
      email: "helena.rostova@oakridgeacademy.edu",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredStaff = staff.filter((s) =>
    search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative & Support Staff"
        subtitle="Roster of laboratory assistants, campus health officers, librarians, and administrative coordinators."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert("Staff registration form simulated.")}
          >
            Add Staff Member
          </Button>
        }
      />

      <Card>
        <CardContent>
          <div className="mb-6 max-w-md">
            <Input
              placeholder="Search staff by name, title, or department..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Staff Member</TableHead>
                <TableHead>Designation & Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={person.avatar} name={person.name} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{person.name}</p>
                        <p className="text-[11px] text-slate-400">{person.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">
                    {person.role}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {person.department}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600">
                    {person.phone}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={person.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
