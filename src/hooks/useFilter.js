"use client";

import { useState, useMemo } from "react";

export function useFilter(items = [], filterFn = null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredItems = useMemo(() => {
    if (!items || !items.length) return [];

    return items.filter((item) => {
      // Custom filter function if provided
      if (filterFn) {
        return filterFn(item, searchQuery, selectedFilter);
      }

      // Default string match across all string values
      const matchesSearch = !searchQuery
        ? true
        : Object.values(item).some(
            (val) =>
              typeof val === "string" &&
              val.toLowerCase().includes(searchQuery.toLowerCase())
          );

      const matchesCategory =
        selectedFilter === "all" ||
        item.status === selectedFilter ||
        item.grade === selectedFilter ||
        item.role === selectedFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedFilter, filterFn]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    filteredItems,
    resetFilters,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}

export default useFilter;
