"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Library, Laptop, Server, Plus, BookOpen } from "lucide-react";

export default function AdminResourcesPage() {
  const [resources] = useState([
    {
      id: "RES-101",
      name: "Library Main Stack Collection",
      category: "Books & Literature",
      totalUnits: 14200,
      available: 13150,
      location: "Central Library Wing",
      status: "Available",
    },
    {
      id: "RES-102",
      name: "Robotics Laboratory Kits (Arduino/EV3)",
      category: "Science Lab",
      totalUnits: 45,
      available: 42,
      location: "Innovation Hub Room 302",
      status: "Available",
    },
    {
      id: "RES-103",
      name: "Smart Interactive Digital Projectors",
      category: "Classroom Hardware",
      totalUnits: 36,
      available: 34,
      location: "All Classrooms",
      status: "Under Maintenance (2 units)",
    },
    {
      id: "RES-104",
      name: "Computer Science Laboratory Terminals",
      category: "IT Equipment",
      totalUnits: 60,
      available: 60,
      location: "Tech Lab Alpha",
      status: "Available",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Resources & Assets"
        subtitle="Manage library inventories, scientific lab kits, classroom technology, and physical infrastructure."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert("Simulating Resource Asset Entry...")}
          >
            Add Campus Asset
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Cataloged Library Books"
          value="14,200 Titles"
          description="92.6% in-stack availability"
          icon={Library}
          variant="indigo"
        />
        <StatsCard
          title="Classroom Hardware"
          value="36 Smart Suites"
          description="Interactive smart-boards installed"
          icon={Laptop}
          variant="emerald"
        />
        <StatsCard
          title="Specialized Labs"
          value="6 Facilities"
          description="Physics, Chem, Bio, Robotics, 2 Computer Labs"
          icon={Server}
          variant="blue"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation & Inventory Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Asset ID</TableHead>
                <TableHead>Resource Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Campus Location</TableHead>
                <TableHead>Inventory Available</TableHead>
                <TableHead className="text-right">Operational Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">
                    {res.id}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {res.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {res.category}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {res.location}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">
                    {res.available} / {res.totalUnits} Units
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={res.status.includes("Maintenance") ? "amber" : "emerald"} size="sm">
                      {res.status}
                    </Badge>
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
