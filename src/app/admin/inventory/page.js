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
import useInventory from "@/hooks/useInventory";
import { formatCurrency } from "@/utils/formatters";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Package,
  Layers,
  MapPin,
  Barcode,
  Edit2,
  Trash2,
  Eye,
  RotateCcw,
  TrendingDown,
  Building2,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function InventoryManagementPage() {
  const {
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
  } = useInventory();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const addModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const restockModal = useModal();
  const deleteModal = useModal();

  // Item Form State
  const initialItemForm = {
    name: "",
    sku: "",
    category: "Science & Laboratory",
    quantity: 10,
    minThreshold: 5,
    location: "Science Lab 1 & Prep Room",
    condition: "Good",
    unitCost: 120,
    supplier: "Academic Supplies Co.",
    notes: "",
  };
  const [itemFormData, setItemFormData] = useState(initialItemForm);

  // Restock Form State
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockNotes, setRestockNotes] = useState("Term procurement restock");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        selectedCategory === "all" || it.category === selectedCategory;

      const matchStatus =
        selectedStatus === "all" || it.status === selectedStatus;

      const matchCondition =
        selectedCondition === "all" || it.condition === selectedCondition;

      const matchLocation =
        selectedLocation === "all" || it.location === selectedLocation;

      return matchSearch && matchCat && matchStatus && matchCondition && matchLocation;
    });
  }, [
    items,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedCondition,
    selectedLocation,
  ]);

  // Handlers
  const handleOpenAdd = () => {
    setItemFormData(initialItemForm);
    addModal.open();
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!itemFormData.name) {
      alert("Please provide the Item Name.");
      return;
    }
    const created = addItem(itemFormData);
    addModal.close();
    showToast(`Asset "${created.name}" registered in inventory.`);
  };

  const handleOpenEdit = (it) => {
    setItemFormData({
      name: it.name,
      sku: it.sku,
      category: it.category,
      quantity: it.quantity,
      minThreshold: it.minThreshold,
      location: it.location,
      condition: it.condition,
      unitCost: it.unitCost,
      supplier: it.supplier,
      notes: it.notes || "",
    });
    editModal.open(it);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.modalData) return;
    updateItem(editModal.modalData.id, itemFormData);
    editModal.close();
    showToast(`Asset "${itemFormData.name}" updated successfully.`);
  };

  const handleOpenRestock = (it) => {
    setRestockAmount(Math.max(5, it.minThreshold * 2 - it.quantity));
    setRestockNotes("Standard replenishment order");
    restockModal.open(it);
  };

  const handleConfirmRestock = (e) => {
    e.preventDefault();
    if (!restockModal.modalData) return;
    const added = parseInt(restockAmount, 10) || 0;
    if (added <= 0) {
      alert("Please enter a valid positive quantity to restock.");
      return;
    }

    restockItem(restockModal.modalData.id, added, restockNotes);
    restockModal.close();
    showToast(
      `Restocked +${added} units of "${restockModal.modalData.name}".`
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deleteItem(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Item "${deleteModal.modalData.name}" removed from inventory.`);
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

      {/* Header */}
      <PageHeader
        title="Inventory Management"
        description="Campus supplies catalog, laboratory instruments, classroom furniture, storage locations, and automated low-stock replenishment"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetInventoryData}
            title="Reset to default mock inventory items"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Asset / Item
          </Button>
        </div>
      </PageHeader>

      {/* LOW-STOCK ALERTS BANNER */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-rose-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Low Stock Replenishment Alert</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {lowStockItems.length} items below safety threshold
                  </span>
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  The following items require immediate procurement:{" "}
                  {lowStockItems.map((item, idx) => (
                    <span key={item.id} className="font-semibold">
                      {item.name} ({item.quantity} left)
                      {idx < lowStockItems.length - 1 ? ", " : "."}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenRestock(lowStockItems[0])}
                className="bg-amber-600 hover:bg-amber-700 text-white border-transparent text-xs font-bold"
              >
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Quick Restock ({lowStockItems[0]?.sku})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus("Low Stock")}
                className="text-xs font-semibold border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                View Depleted
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Catalog Items"
          value={stats.totalItems}
          icon={Boxes}
          description={`${stats.totalUnitsCount} physical units stocked`}
        />
        <StatsCard
          title="In-Stock Assets"
          value={stats.inStockCount}
          icon={CheckCircle2}
          description="Ready for institutional usage"
        />
        <StatsCard
          title="Low & Depleted Stock"
          value={stats.lowStockCount + stats.outOfStockCount}
          icon={AlertTriangle}
          description={`${stats.outOfStockCount} out-of-stock items`}
        />
        <StatsCard
          title="Total Asset Valuation"
          value={formatCurrency(stats.totalAssetValue)}
          icon={Building2}
          description="Depreciated book valuation"
        />
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search items by name, SKU barcode, supplier, or location..."
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

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Stock Statuses</option>
                <option value="In Stock">In Stock (&gt; Min)</option>
                <option value="Low Stock">Low Stock (&le; Min)</option>
                <option value="Out of Stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="w-full md:w-40">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800">
              School Asset & Stock Ledger
            </CardTitle>
            <CardDescription className="text-xs">
              Displaying {filteredItems.length} of {items.length} institutional inventory items
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Item Name & SKU</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Quantity & Safety Min</TableHead>
                <TableHead className="text-xs">Storage Location</TableHead>
                <TableHead className="text-xs">Physical Condition</TableHead>
                <TableHead className="text-xs">Stock Status</TableHead>
                <TableHead className="text-xs">Unit Cost</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                    No inventory assets found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((it, idx) => {
                  const isOutOfStock = it.quantity === 0;
                  const isLowStock = it.quantity > 0 && it.quantity <= it.minThreshold;

                  return (
                    <TableRow key={it.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <button
                            type="button"
                            onClick={() => viewModal.open(it)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                          >
                            {it.name}
                          </button>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 mt-0.5">
                            <Barcode className="h-3 w-3 text-slate-400" />
                            <span>{it.sku}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {it.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-bold ${
                                isOutOfStock
                                  ? "text-rose-600"
                                  : isLowStock
                                  ? "text-amber-600"
                                  : "text-slate-800"
                              }`}
                            >
                              {it.quantity} units
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Min: {it.minThreshold}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOutOfStock
                                  ? "bg-rose-500"
                                  : isLowStock
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((it.quantity / (it.minThreshold * 2 || 1)) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{it.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {it.condition === "New" ? (
                          <Badge variant="info" className="text-[10px] font-bold">
                            New
                          </Badge>
                        ) : it.condition === "Good" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Good
                          </Badge>
                        ) : it.condition === "Fair" ? (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Fair
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Needs Repair
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] font-bold">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-mono font-bold text-slate-800">
                            {formatCurrency(it.unitCost)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Total: {formatCurrency(it.unitCost * it.quantity)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenRestock(it)}
                            title="Restock units"
                            className="text-xs px-2 py-1 font-semibold"
                          >
                            <Package className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                            Restock
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewModal.open(it)}
                            title="View Asset Details"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(it)}
                            title="Edit Item"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModal.open(it)}
                            title="Delete Item"
                            className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: ADD ASSET / ITEM */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Add Institutional Asset"
        description="Register new equipment, furniture, or stationery item into school inventory."
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Binocular Compound Microscope (1000x)"
                value={itemFormData.name}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                SKU / Asset Barcode
              </label>
              <input
                type="text"
                placeholder="e.g. SCI-MIC-08"
                value={itemFormData.sku}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    sku: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={itemFormData.category}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Current Quantity in Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={itemFormData.quantity}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    quantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Minimum Alert Threshold *
              </label>
              <input
                type="number"
                min="1"
                required
                value={itemFormData.minThreshold}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    minThreshold: parseInt(e.target.value, 10) || 5,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Storage Location *
              </label>
              <select
                value={itemFormData.location}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, location: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physical Condition
              </label>
              <select
                value={itemFormData.condition}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, condition: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="New">New (Factory Sealed)</option>
                <option value="Good">Good (Operational standard)</option>
                <option value="Fair">Fair (Noticeable cosmetic wear)</option>
                <option value="Needs Repair">Needs Repair (Defective)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Unit Replacement Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={itemFormData.unitCost}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    unitCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Primary Supplier / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Fisher Scientific, Dell"
                value={itemFormData.supplier}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, supplier: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Technical Specs & Asset Notes
              </label>
              <textarea
                rows="3"
                placeholder="Model numbers, calibration requirements, storage guidelines..."
                value={itemFormData.notes}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, notes: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={addModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Asset to Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT ASSET */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Inventory Asset"
        description={`Modify stock attributes for ${editModal.modalData?.name}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={itemFormData.name}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                SKU Barcode
              </label>
              <input
                type="text"
                value={itemFormData.sku}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    sku: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={itemFormData.category}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Current Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={itemFormData.quantity}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    quantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Minimum Alert Threshold *
              </label>
              <input
                type="number"
                min="1"
                required
                value={itemFormData.minThreshold}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    minThreshold: parseInt(e.target.value, 10) || 5,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Storage Location *
              </label>
              <select
                value={itemFormData.location}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, location: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Physical Condition
              </label>
              <select
                value={itemFormData.condition}
                onChange={(e) =>
                  setItemFormData({ ...itemFormData, condition: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={itemFormData.unitCost}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    unitCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
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

      {/* MODAL: QUICK RESTOCK */}
      <Modal
        isOpen={restockModal.isOpen}
        onClose={restockModal.close}
        title="Restock Inventory Quantity"
        description={`Record incoming shipment units for "${restockModal.modalData?.name}"`}
        size="md"
      >
        {restockModal.modalData && (
          <form onSubmit={handleConfirmRestock} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <p className="font-bold text-slate-900">
                {restockModal.modalData.name}
              </p>
              <p className="text-slate-600 mt-0.5">
                SKU: <span className="font-mono">{restockModal.modalData.sku}</span> &bull; Current Stock:{" "}
                <span className="font-bold text-indigo-700">{restockModal.modalData.quantity} units</span> (Min:{" "}
                {restockModal.modalData.minThreshold})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Units to Restock *
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-indigo-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                New resulting inventory will be:{" "}
                <span className="font-bold text-slate-700">
                  {restockModal.modalData.quantity + (parseInt(restockAmount, 10) || 0)} units
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Restock Shipment / PO Notes
              </label>
              <input
                type="text"
                value={restockNotes}
                onChange={(e) => setRestockNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={restockModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm Inbound Delivery
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: VIEW ASSET DETAILS */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title="Asset Specification & Storage Dossier"
        description="Comprehensive inventory record, safety stock thresholds, and location mapping"
        size="md"
      >
        {viewModal.modalData && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
              <div className="h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <Boxes className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {viewModal.modalData.sku}
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">
                  {viewModal.modalData.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {viewModal.modalData.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Storage Location</span>
                <span className="font-bold text-slate-800 line-clamp-1">
                  {viewModal.modalData.location}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Physical Condition</span>
                <span className="font-bold text-indigo-700">
                  {viewModal.modalData.condition}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Current Stock</span>
                <span className="font-bold text-slate-800">
                  {viewModal.modalData.quantity} units (Min: {viewModal.modalData.minThreshold})
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Stock Status</span>
                <span className="font-bold text-emerald-600">
                  {viewModal.modalData.status}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Unit Replacement Cost</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(viewModal.modalData.unitCost)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Total Asset Valuation</span>
                <span className="font-mono font-bold text-indigo-700">
                  {formatCurrency(viewModal.modalData.unitCost * viewModal.modalData.quantity)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Asset Specifications & Notes
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {viewModal.modalData.notes || "Standard institutional property."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const it = viewModal.modalData;
                  viewModal.close();
                  handleOpenEdit(it);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit Asset
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={viewModal.close}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const it = viewModal.modalData;
                    viewModal.close();
                    handleOpenRestock(it);
                  }}
                >
                  <Package className="h-4 w-4 mr-1.5" />
                  Restock
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Remove Asset from Inventory"
        description="Are you certain you wish to purge this item from the school stock register?"
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete &quot;{deleteModal.modalData.name}&quot;?
                </p>
                <p className="mt-0.5">
                  SKU: {deleteModal.modalData.sku} &bull; Quantity: {deleteModal.modalData.quantity} units
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
