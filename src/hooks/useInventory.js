"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockInventoryItems,
  mockInventoryCategories,
  mockInventoryLocations,
} from "@/data/mock/inventory";

let inventoryStore = {
  items: [...mockInventoryItems],
  categories: [...mockInventoryCategories],
  locations: [...mockInventoryLocations],
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
  return inventoryStore;
}

function getServerSnapshot() {
  return inventoryStore;
}

export function useInventory() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { items, categories, locations } = store;

  // Add Item
  const addItem = useCallback((newItem) => {
    const id = `INV-${1000 + inventoryStore.items.length + 1}`;
    const qty = parseInt(newItem.quantity, 10) || 0;
    const minThresh = parseInt(newItem.minThreshold, 10) || 5;

    let computedStatus = "In Stock";
    if (qty === 0) {
      computedStatus = "Out of Stock";
    } else if (qty <= minThresh) {
      computedStatus = "Low Stock";
    }

    const item = {
      id,
      sku: newItem.sku || `SKU-${1000 + inventoryStore.items.length + 1}`,
      name: newItem.name,
      category: newItem.category || "Science & Laboratory",
      quantity: qty,
      minThreshold: minThresh,
      location: newItem.location || "Main Warehouse - Block C",
      condition: newItem.condition || "Good",
      status: computedStatus,
      unitCost: parseFloat(newItem.unitCost) || 0,
      supplier: newItem.supplier || "Oakridge Logistics Supplier",
      lastRestocked: "2026-03-24",
      notes: newItem.notes || "Standard inventory asset registration.",
    };

    inventoryStore = {
      ...inventoryStore,
      items: [item, ...inventoryStore.items],
    };
    emitChange();
    return item;
  }, []);

  // Update Item
  const updateItem = useCallback((itemId, updatedFields) => {
    inventoryStore = {
      ...inventoryStore,
      items: inventoryStore.items.map((it) => {
        if (it.id !== itemId) return it;
        const qty =
          parseInt(updatedFields.quantity, 10) ?? it.quantity;
        const minThresh =
          parseInt(updatedFields.minThreshold, 10) ?? it.minThreshold;

        let computedStatus = "In Stock";
        if (qty === 0) {
          computedStatus = "Out of Stock";
        } else if (qty <= minThresh) {
          computedStatus = "Low Stock";
        }

        return {
          ...it,
          ...updatedFields,
          quantity: qty,
          minThreshold: minThresh,
          status: computedStatus,
          unitCost:
            parseFloat(updatedFields.unitCost) ?? it.unitCost,
        };
      }),
    };
    emitChange();
  }, []);

  // Delete Item
  const deleteItem = useCallback((itemId) => {
    inventoryStore = {
      ...inventoryStore,
      items: inventoryStore.items.filter((it) => it.id !== itemId),
    };
    emitChange();
  }, []);

  // Restock action
  const restockItem = useCallback((itemId, addedUnits, notes = "") => {
    const addCount = parseInt(addedUnits, 10) || 0;
    inventoryStore = {
      ...inventoryStore,
      items: inventoryStore.items.map((it) => {
        if (it.id !== itemId) return it;
        const newQty = it.quantity + addCount;
        let computedStatus = "In Stock";
        if (newQty === 0) {
          computedStatus = "Out of Stock";
        } else if (newQty <= it.minThreshold) {
          computedStatus = "Low Stock";
        }

        return {
          ...it,
          quantity: newQty,
          status: computedStatus,
          lastRestocked: "2026-03-24",
          notes: notes
            ? `${it.notes ? it.notes + " | " : ""}+${addCount} units restocked: ${notes}`
            : it.notes,
        };
      }),
    };
    emitChange();
    return { success: true };
  }, []);

  // Reset to default
  const resetInventoryData = useCallback(() => {
    inventoryStore = {
      items: [...mockInventoryItems],
      categories: [...mockInventoryCategories],
      locations: [...mockInventoryLocations],
    };
    emitChange();
  }, []);

  // Derived low stock items
  const lowStockItems = useMemo(
    () => items.filter((it) => it.quantity <= it.minThreshold),
    [items]
  );

  // Statistics
  const stats = useMemo(() => {
    const totalItems = items.length;
    const inStockCount = items.filter((it) => it.status === "In Stock").length;
    const lowStockCount = items.filter((it) => it.status === "Low Stock").length;
    const outOfStockCount = items.filter(
      (it) => it.status === "Out of Stock"
    ).length;
    const totalAssetValue = items.reduce(
      (acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0),
      0
    );
    const totalUnitsCount = items.reduce(
      (acc, it) => acc + (it.quantity || 0),
      0
    );

    return {
      totalItems,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalAssetValue,
      totalUnitsCount,
    };
  }, [items]);

  return {
    items,
    categories,
    locations,
    lowStockItems,
    stats,
    addItem,
    updateItem,
    deleteItem,
    restockItem,
    resetInventoryData,
  };
}

export default useInventory;
