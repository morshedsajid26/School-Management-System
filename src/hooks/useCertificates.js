"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockCertificatesList,
  mockCertificateTypes,
} from "@/data/mock/certificates";

let certificateStore = {
  certificates: [...mockCertificatesList],
  types: [...mockCertificateTypes],
};

const listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return certificateStore;
}

function getServerSnapshot() {
  return certificateStore;
}

export function useCertificates() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { certificates, types } = store;

  // Issue Certificate
  const issueCertificate = useCallback((newCert) => {
    const id = `CERT-2026-${String(certificateStore.certificates.length + 1).padStart(3, "0")}`;
    const certNumber =
      newCert.certificateNumber ||
      `OAK-${newCert.certificateType ? newCert.certificateType.substring(0, 4).toUpperCase() : "DOC"}-2026-${String(
        certificateStore.certificates.length + 1
      ).padStart(3, "0")}`;

    const created = {
      id,
      certificateNumber: certNumber,
      certificateType: newCert.certificateType || "Bonafide Student Certificate",
      studentId: newCert.studentId || "STU-GEN",
      studentName: newCert.studentName,
      rollNumber: newCert.rollNumber || "N/A",
      grade: newCert.grade || "Grade 10",
      section: newCert.section || "A",
      admissionNumber: newCert.admissionNumber || "ADM-2021-001",
      issueDate: newCert.issueDate || "2026-03-24",
      academicYear: "2025-2026",
      titleCitation: newCert.titleCitation || "Formal Recognition Certificate",
      bodyText:
        newCert.bodyText ||
        `This is to certify that ${newCert.studentName} has successfully satisfied all academic and conduct criteria at Oakridge Academy.`,
      signatoryName: newCert.signatoryName || "Dr. Evelyn Reed",
      signatoryTitle: newCert.signatoryTitle || "Principal & Head of School",
      sealText: "Official Academic Seal of Oakridge Academy",
      status: "Issued",
    };

    certificateStore = {
      ...certificateStore,
      certificates: [created, ...certificateStore.certificates],
    };
    emitChange();
    return created;
  }, []);

  // Update Certificate
  const updateCertificate = useCallback((certId, updatedFields) => {
    certificateStore = {
      ...certificateStore,
      certificates: certificateStore.certificates.map((c) =>
        c.id === certId ? { ...c, ...updatedFields } : c
      ),
    };
    emitChange();
  }, []);

  // Delete / Revoke Certificate
  const deleteCertificate = useCallback((certId) => {
    certificateStore = {
      ...certificateStore,
      certificates: certificateStore.certificates.filter((c) => c.id !== certId),
    };
    emitChange();
  }, []);

  // Reset to default
  const resetCertificatesData = useCallback(() => {
    certificateStore = {
      certificates: [...mockCertificatesList],
      types: [...mockCertificateTypes],
    };
    emitChange();
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const totalIssued = certificates.length;
    const academicExcellenceCount = certificates.filter(
      (c) => c.certificateType === "Certificate of Academic Excellence"
    ).length;
    const transferCount = certificates.filter(
      (c) => c.certificateType === "Transfer & Migration Certificate"
    ).length;
    const characterCount = certificates.filter(
      (c) => c.certificateType === "Character & Conduct Certificate"
    ).length;

    return {
      totalIssued,
      academicExcellenceCount,
      transferCount,
      characterCount,
    };
  }, [certificates]);

  return {
    certificates,
    types,
    stats,
    issueCertificate,
    updateCertificate,
    deleteCertificate,
    resetCertificatesData,
  };
}

export default useCertificates;
