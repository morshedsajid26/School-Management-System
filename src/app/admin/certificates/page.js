"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import useCertificates from "@/hooks/useCertificates";
import { mockStudents } from "@/data/mock/students";
import {
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Calendar,
  User,
  Barcode,
  School,
  Edit2,
  Trash2,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

export default function CertificatesManagementPage() {
  const {
    certificates,
    types,
    stats,
    issueCertificate,
    updateCertificate,
    deleteCertificate,
    resetCertificatesData,
  } = useCertificates();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const issueModal = useModal();
  const editModal = useModal();
  const previewModal = useModal();
  const deleteModal = useModal();

  // Form State
  const initialCertForm = {
    studentName: mockStudents[0]?.name || "Liam Alexander Chen",
    studentId: mockStudents[0]?.id || "STU-001",
    rollNumber: mockStudents[0]?.rollNumber || "10-A-01",
    grade: mockStudents[0]?.grade || "Grade 10",
    section: mockStudents[0]?.section || "A",
    admissionNumber: mockStudents[0]?.admissionNumber || "ADM-2021-001",
    certificateType: "Certificate of Academic Excellence",
    issueDate: "2026-03-24",
    titleCitation: "Highest Academic Distinction & Scholastic Merit",
    bodyText:
      "This is to certify that Liam Alexander Chen has demonstrated stellar intellectual diligence, consistent scholarly engagement, and achieved top honors for the 2025-2026 academic term.",
    signatoryName: "Dr. Evelyn Reed",
    signatoryTitle: "Principal & Head of School",
  };
  const [formData, setFormData] = useState(initialCertForm);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Certificates
  const filteredCerts = useMemo(() => {
    return certificates.filter((c) => {
      const matchSearch =
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.certificateType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType =
        selectedType === "all" || c.certificateType === selectedType;

      return matchSearch && matchType;
    });
  }, [certificates, searchTerm, selectedType]);

  // Handlers
  const handleOpenIssue = () => {
    setFormData(initialCertForm);
    issueModal.open();
  };

  const handleStudentSelect = (stuId) => {
    const student = mockStudents.find((s) => s.id === stuId);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        grade: student.grade,
        section: student.section,
        admissionNumber: student.admissionNumber,
        bodyText: `This is to certify that ${student.name} (${student.grade} - Section ${student.section}, Roll: ${student.rollNumber}) has successfully satisfied all academic and conduct criteria at Oakridge Academy.`,
      });
    }
  };

  const handleSaveIssue = (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.certificateType) {
      alert("Please select student and certificate type.");
      return;
    }
    const created = issueCertificate(formData);
    issueModal.close();
    showToast(`Certificate "${created.certificateNumber}" issued for ${created.studentName}.`);
  };

  const handleOpenEdit = (cert) => {
    setFormData({
      studentName: cert.studentName,
      studentId: cert.studentId,
      rollNumber: cert.rollNumber,
      grade: cert.grade,
      section: cert.section,
      admissionNumber: cert.admissionNumber,
      certificateType: cert.certificateType,
      issueDate: cert.issueDate,
      titleCitation: cert.titleCitation,
      bodyText: cert.bodyText,
      signatoryName: cert.signatoryName,
      signatoryTitle: cert.signatoryTitle,
    });
    editModal.open(cert);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.modalData) return;
    updateCertificate(editModal.modalData.id, formData);
    editModal.close();
    showToast(`Certificate ${editModal.modalData.certificateNumber} updated.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deleteCertificate(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Certificate revoked.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Student Certificates"
        description="Formal certificates issuance, transfer credentials, academic honor rolls, bonafide verification, and print preview"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCertificatesData}
            title="Reset to default mock certificates"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenIssue}>
            <Plus className="h-4 w-4 mr-1.5" />
            Issue Certificate
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Issued Certificates"
          value={stats.totalIssued}
          icon={Award}
          description="Institutional verified credentials"
        />
        <StatsCard
          title="Academic Excellence"
          value={stats.academicExcellenceCount}
          icon={Sparkles}
          description="Scholastic merit & honor roll"
        />
        <StatsCard
          title="Transfer Certificates"
          value={stats.transferCount}
          icon={FileCheck}
          description="Clearance & migration records"
        />
        <StatsCard
          title="Character & Conduct"
          value={stats.characterCount}
          icon={ShieldCheck}
          description="Exemplary citizenship awards"
        />
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search certificates by student name, roll no, cert number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Certificate Type Filter */}
            <div className="w-full sm:w-64">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Certificate Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800">
              Institutional Certificate Register
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredCerts.length} of {certificates.length} generated credentials
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Certificate Number</TableHead>
                <TableHead className="text-xs">Student Name & Roll</TableHead>
                <TableHead className="text-xs">Grade & Section</TableHead>
                <TableHead className="text-xs">Certificate Category</TableHead>
                <TableHead className="text-xs">Issue Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Preview & Print</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                    No certificates found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCerts.map((cert, idx) => (
                  <TableRow key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100">
                        {cert.certificateNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <button
                          type="button"
                          onClick={() => previewModal.open(cert)}
                          className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                        >
                          {cert.studentName}
                        </button>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Roll: {cert.rollNumber} &bull; Adm: {cert.admissionNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {cert.grade} ({cert.section})
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {cert.certificateType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{cert.issueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px] font-bold">
                        Issued
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => previewModal.open(cert)}
                          title="Preview & Print Certificate"
                          className="text-xs px-2.5 py-1 font-semibold"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cert)}
                          title="Edit Certificate"
                          className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModal.open(cert)}
                          title="Revoke Certificate"
                          className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: ISSUE NEW CERTIFICATE */}
      <Modal
        isOpen={issueModal.isOpen}
        onClose={issueModal.close}
        title="Issue Student Certificate"
        description="Generate official institutional certificate, citation honor, or transfer slip."
        size="lg"
      >
        <form onSubmit={handleSaveIssue} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Student *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {mockStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade} - {s.section}, Roll: {s.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Certificate Type *
              </label>
              <select
                value={formData.certificateType}
                onChange={(e) =>
                  setFormData({ ...formData, certificateType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Honors Title / Citation Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Highest Academic Distinction"
                value={formData.titleCitation}
                onChange={(e) =>
                  setFormData({ ...formData, titleCitation: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Certificate Body Citation *
              </label>
              <textarea
                rows="4"
                required
                value={formData.bodyText}
                onChange={(e) =>
                  setFormData({ ...formData, bodyText: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Authorized Signatory
              </label>
              <input
                type="text"
                value={formData.signatoryName}
                onChange={(e) =>
                  setFormData({ ...formData, signatoryName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Signatory Official Title
              </label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) =>
                  setFormData({ ...formData, signatoryTitle: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={issueModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate Certificate
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT CERTIFICATE */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Certificate"
        description={`Modify credential details for ${editModal.modalData?.studentName}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Certificate Type *
              </label>
              <select
                value={formData.certificateType}
                onChange={(e) =>
                  setFormData({ ...formData, certificateType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Honors Title / Citation Headline *
              </label>
              <input
                type="text"
                required
                value={formData.titleCitation}
                onChange={(e) =>
                  setFormData({ ...formData, titleCitation: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Certificate Body Citation *
              </label>
              <textarea
                rows="4"
                required
                value={formData.bodyText}
                onChange={(e) =>
                  setFormData({ ...formData, bodyText: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-serif"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PREVIEW & PRINT CERTIFICATE */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.close}
        title="Official Certificate Preview & Print"
        description="Formal parchment preview with verification barcode and embossed seal styling"
        size="lg"
      >
        {previewModal.modalData && (
          <div className="space-y-4">
            {/* The Certificate UI */}
            <div className="relative border-8 border-double border-indigo-950 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-amber-50/30 text-center shadow-lg overflow-hidden">
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-indigo-950/40 text-xs font-serif">
                &#9670;&#9670;&#9670;
              </div>
              <div className="absolute top-3 right-3 text-indigo-950/40 text-xs font-serif">
                &#9670;&#9670;&#9670;
              </div>
              <div className="absolute bottom-3 left-3 text-indigo-950/40 text-xs font-serif">
                &#9670;&#9670;&#9670;
              </div>
              <div className="absolute bottom-3 right-3 text-indigo-950/40 text-xs font-serif">
                &#9670;&#9670;&#9670;
              </div>

              {/* Header Crest & School Title */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-900 to-indigo-700 text-amber-300 flex items-center justify-center shadow-md mb-2">
                  <School className="h-9 w-9" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black tracking-widest text-indigo-950 uppercase">
                  Oakridge Academy
                </h3>
                <p className="text-xs font-serif tracking-wider text-amber-900/80 uppercase font-semibold mt-0.5">
                  Excellence in Academics & Leadership &bull; Founded 1984
                </p>
                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mt-2" />
              </div>

              {/* Certificate Type Banner */}
              <div className="my-5">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">
                  This Certifies That
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-wide underline decoration-amber-400 decoration-2 underline-offset-8">
                  {previewModal.modalData.studentName}
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-3">
                  Admission No: <span className="font-bold text-slate-700">{previewModal.modalData.admissionNumber}</span> &bull; Roll:{" "}
                  <span className="font-bold text-slate-700">{previewModal.modalData.rollNumber}</span> &bull; Grade:{" "}
                  <span className="font-bold text-slate-700">{previewModal.modalData.grade} ({previewModal.modalData.section})</span>
                </p>
              </div>

              {/* Title Citation Headline */}
              <div className="my-4">
                <span className="inline-block px-4 py-1 rounded-full text-xs font-serif font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {previewModal.modalData.certificateType}
                </span>
                <h4 className="text-base font-serif font-bold text-indigo-950 mt-2 italic">
                  &ldquo;{previewModal.modalData.titleCitation}&rdquo;
                </h4>
              </div>

              {/* Body Citation */}
              <p className="text-sm font-serif text-slate-700 max-w-xl mx-auto leading-relaxed my-6 px-4">
                {previewModal.modalData.bodyText}
              </p>

              {/* Signatures & Seal Footer */}
              <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-200/80 mt-8 gap-4 text-xs font-serif">
                {/* Left: Issue Date */}
                <div className="text-left">
                  <p className="text-[11px] text-slate-400">Date of Issuance</p>
                  <p className="font-bold text-slate-800 font-mono text-xs">
                    {previewModal.modalData.issueDate}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Academic Year {previewModal.modalData.academicYear}
                  </p>
                </div>

                {/* Center: Gold Embossed Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-amber-600 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner">
                    <Award className="h-8 w-8 text-amber-600" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-amber-900 font-bold mt-1">
                    Official Institutional Seal
                  </span>
                </div>

                {/* Right: Signature */}
                <div className="text-right">
                  <div className="w-32 ml-auto border-b border-slate-400 pb-1 font-serif italic text-sm text-indigo-950">
                    {previewModal.modalData.signatoryName}
                  </div>
                  <p className="font-bold text-slate-800 text-[11px] mt-0.5">
                    {previewModal.modalData.signatoryTitle}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">
                    Ref: {previewModal.modalData.certificateNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Certificate (Browser)
              </Button>
              <Button variant="primary" size="sm" onClick={previewModal.close}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: REVOKE / DELETE CERTIFICATE */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Revoke Certificate"
        description="Are you certain you wish to revoke and delete this credential record?"
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Revoke Certificate {deleteModal.modalData.certificateNumber}?
                </p>
                <p className="mt-0.5">
                  Student: {deleteModal.modalData.studentName} ({deleteModal.modalData.certificateType})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Revocation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
