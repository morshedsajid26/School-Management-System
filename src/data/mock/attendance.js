export const mockAttendanceStats = {
  overallPercentage: 95.4,
  presentCount: 1354,
  absentCount: 48,
  lateCount: 18,
  totalStudents: 1420,
  date: "2026-03-18",
  byGrade: [
    { grade: "Grade 10", present: 96.2, absent: 3.8 },
    { grade: "Grade 9", present: 94.8, absent: 5.2 },
    { grade: "Grade 8", present: 95.5, absent: 4.5 },
    { grade: "Grade 7", present: 93.9, absent: 6.1 },
    { grade: "Grade 6", present: 97.1, absent: 2.9 },
  ],
};

export const mockRecentAbsences = [
  {
    id: "ABS-101",
    studentName: "Noah William Davies",
    grade: "Grade 9-A",
    reason: "Medical - Flu",
    reportedBy: "Gareth Davies (Guardian)",
    status: "Excused",
    date: "Today",
  },
  {
    id: "ABS-102",
    studentName: "Chloe Martin",
    grade: "Grade 7-B",
    reason: "Family Emergency",
    reportedBy: "Unnotified",
    status: "Unexcused",
    date: "Today",
  },
  {
    id: "ABS-103",
    studentName: "Jayden Thorne",
    grade: "Grade 10-B",
    reason: "Sports Tournament",
    reportedBy: "Coach Miller",
    status: "Excused",
    date: "Today",
  },
];
