"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockBookCategories,
  mockBooksList,
  mockBorrowRecords,
} from "@/data/mock/library";

let libraryStore = {
  books: [...mockBooksList],
  categories: [...mockBookCategories],
  borrowRecords: [...mockBorrowRecords],
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
  return libraryStore;
}

function getServerSnapshot() {
  return libraryStore;
}

export function useLibrary() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { books, categories, borrowRecords } = store;

  // Book CRUD actions
  const addBook = useCallback((newBook) => {
    const id = `BK-${1000 + libraryStore.books.length + 1}`;
    const total = parseInt(newBook.totalCopies, 10) || 1;
    const created = {
      id,
      title: newBook.title,
      isbn: newBook.isbn,
      author: newBook.author,
      category: newBook.category || "General",
      publisher: newBook.publisher || "Academic Press",
      edition: newBook.edition || "1st Edition",
      shelfLocation: newBook.shelfLocation || "Stack A, Shelf 01",
      description: newBook.description || "",
      totalCopies: total,
      availableCopies: total,
      status: "Available",
    };

    libraryStore = {
      ...libraryStore,
      books: [created, ...libraryStore.books],
    };
    emitChange();
    return created;
  }, []);

  const updateBook = useCallback((bookId, updatedFields) => {
    libraryStore = {
      ...libraryStore,
      books: libraryStore.books.map((b) => {
        if (b.id !== bookId) return b;
        const total = parseInt(updatedFields.totalCopies, 10) ?? b.totalCopies;
        const available = Math.min(b.availableCopies, total);
        return {
          ...b,
          ...updatedFields,
          totalCopies: total,
          availableCopies: available,
          status: available > 0 ? "Available" : "All Copies Issued",
        };
      }),
    };
    emitChange();
  }, []);

  const deleteBook = useCallback((bookId) => {
    libraryStore = {
      ...libraryStore,
      books: libraryStore.books.filter((b) => b.id !== bookId),
    };
    emitChange();
  }, []);

  // Category CRUD actions
  const addCategory = useCallback((newCat) => {
    const id = `CAT-LIB-0${libraryStore.categories.length + 1}`;
    const created = {
      id,
      name: newCat.name,
      code: newCat.code || newCat.name.substring(0, 3).toUpperCase(),
      description: newCat.description || "",
      totalTitles: parseInt(newCat.totalTitles, 10) || 0,
      totalCopies: parseInt(newCat.totalCopies, 10) || 0,
      color: newCat.color || "indigo",
    };

    libraryStore = {
      ...libraryStore,
      categories: [...libraryStore.categories, created],
    };
    emitChange();
    return created;
  }, []);

  const updateCategory = useCallback((catId, updatedFields) => {
    libraryStore = {
      ...libraryStore,
      categories: libraryStore.categories.map((c) =>
        c.id === catId ? { ...c, ...updatedFields } : c
      ),
    };
    emitChange();
  }, []);

  const deleteCategory = useCallback((catId) => {
    libraryStore = {
      ...libraryStore,
      categories: libraryStore.categories.filter((c) => c.id !== catId),
    };
    emitChange();
  }, []);

  // Issue Book action
  const issueBook = useCallback(
    ({
      bookId,
      borrowerId,
      borrowerName,
      borrowerType,
      rollNumber,
      className,
      issueDate,
      dueDate,
      notes,
    }) => {
      const targetBook = libraryStore.books.find((b) => b.id === bookId);
      if (!targetBook || targetBook.availableCopies <= 0) {
        return { success: false, message: "No available copies for this book." };
      }

      const newRecord = {
        id: `BOR-2026-${String(libraryStore.borrowRecords.length + 1).padStart(3, "0")}`,
        bookId: targetBook.id,
        bookTitle: targetBook.title,
        isbn: targetBook.isbn,
        borrowerId: borrowerId || "STU-GEN",
        borrowerName,
        borrowerType: borrowerType || "Student",
        rollNumber: rollNumber || "N/A",
        className: className || "Unassigned",
        issueDate: issueDate || "2026-03-24",
        dueDate: dueDate || "2026-04-07",
        returnDate: null,
        status: "Issued",
        fineAmount: 0,
        notes: notes || "General checkout",
      };

      // Decrement copies
      const updatedBooks = libraryStore.books.map((b) => {
        if (b.id === bookId) {
          const newAvailable = Math.max(0, b.availableCopies - 1);
          return {
            ...b,
            availableCopies: newAvailable,
            status: newAvailable > 0 ? "Available" : "All Copies Issued",
          };
        }
        return b;
      });

      libraryStore = {
        ...libraryStore,
        books: updatedBooks,
        borrowRecords: [newRecord, ...libraryStore.borrowRecords],
      };
      emitChange();
      return { success: true, record: newRecord };
    },
    []
  );

  // Return Book action
  const returnBook = useCallback(
    (recordId, returnCondition = "Good", returnNotes = "Standard check-in") => {
      const targetRecord = libraryStore.borrowRecords.find((r) => r.id === recordId);
      if (!targetRecord) return { success: false, message: "Record not found." };

      const updatedBorrows = libraryStore.borrowRecords.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: "Returned",
            returnDate: "2026-03-24",
            returnCondition,
            notes: returnNotes ? `${r.notes ? r.notes + " — " : ""}${returnNotes}` : r.notes,
            finePaid: r.status === "Overdue" ? r.fineAmount : 0,
          };
        }
        return r;
      });

      const updatedBooks = libraryStore.books.map((b) => {
        if (b.id === targetRecord.bookId) {
          const newAvailable = Math.min(b.totalCopies, b.availableCopies + 1);
          return {
            ...b,
            availableCopies: newAvailable,
            status: "Available",
          };
        }
        return b;
      });

      libraryStore = {
        ...libraryStore,
        books: updatedBooks,
        borrowRecords: updatedBorrows,
      };
      emitChange();
      return { success: true };
    },
    []
  );

  // Renew Loan action
  const renewLoan = useCallback((recordId, newDueDate) => {
    libraryStore = {
      ...libraryStore,
      borrowRecords: libraryStore.borrowRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              dueDate: newDueDate,
              notes: `${r.notes ? r.notes + " — " : ""}Renewed until ${newDueDate}`,
            }
          : r
      ),
    };
    emitChange();
    return { success: true };
  }, []);

  // Collect Fine & Return (for overdue records)
  const collectFineAndReturn = useCallback(
    (recordId, collectedAmount, condition = "Good", notes = "Fine cleared at desk") => {
      const targetRecord = libraryStore.borrowRecords.find((r) => r.id === recordId);
      if (!targetRecord) return { success: false, message: "Record not found." };

      const updatedBorrows = libraryStore.borrowRecords.map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            status: "Returned",
            returnDate: "2026-03-24",
            returnCondition: condition,
            finePaid: collectedAmount !== undefined ? collectedAmount : r.fineAmount,
            fineAmount: 0,
            notes: `${r.notes ? r.notes + " | " : ""}${notes}`,
          };
        }
        return r;
      });

      const updatedBooks = libraryStore.books.map((b) => {
        if (b.id === targetRecord.bookId) {
          const newAvailable = Math.min(b.totalCopies, b.availableCopies + 1);
          return {
            ...b,
            availableCopies: newAvailable,
            status: "Available",
          };
        }
        return b;
      });

      libraryStore = {
        ...libraryStore,
        books: updatedBooks,
        borrowRecords: updatedBorrows,
      };
      emitChange();
      return { success: true };
    },
    []
  );

  // Reset to default mock data
  const resetLibraryData = useCallback(() => {
    libraryStore = {
      books: [...mockBooksList],
      categories: [...mockBookCategories],
      borrowRecords: [...mockBorrowRecords],
    };
    emitChange();
  }, []);

  // Derived filtered collections
  const issuedRecords = useMemo(
    () => borrowRecords.filter((r) => r.status === "Issued"),
    [borrowRecords]
  );

  const overdueRecords = useMemo(
    () => borrowRecords.filter((r) => r.status === "Overdue"),
    [borrowRecords]
  );

  const returnedRecords = useMemo(
    () => borrowRecords.filter((r) => r.status === "Returned"),
    [borrowRecords]
  );

  // Computed summary statistics
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const totalVolumes = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    const availableVolumes = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
    const inCirculation = issuedRecords.length + overdueRecords.length;
    const overdueCount = overdueRecords.length;
    const totalFines = overdueRecords.reduce((acc, r) => acc + (r.fineAmount || 0), 0);
    const returnedCount = returnedRecords.length;

    return {
      totalTitles,
      totalVolumes,
      availableVolumes,
      inCirculation,
      overdueCount,
      totalFines,
      returnedCount,
    };
  }, [books, issuedRecords, overdueRecords, returnedRecords]);

  return {
    books,
    categories,
    borrowRecords,
    issuedRecords,
    overdueRecords,
    returnedRecords,
    stats,
    addBook,
    updateBook,
    deleteBook,
    addCategory,
    updateCategory,
    deleteCategory,
    issueBook,
    returnBook,
    renewLoan,
    collectFineAndReturn,
    resetLibraryData,
  };
}

export default useLibrary;
