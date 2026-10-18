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
import useTransport from "@/hooks/useTransport";
import { formatCurrency } from "@/utils/formatters";
import {
  Bus,
  MapPin,
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Calendar,
  Fuel,
  Navigation,
  RotateCcw,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

export default function TransportManagementPage() {
  const {
    vehicles,
    routes,
    drivers,
    stats,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addRoute,
    updateRoute,
    deleteRoute,
    addDriver,
    updateDriver,
    deleteDriver,
    resetTransportData,
  } = useTransport();

  const [activeTab, setActiveTab] = useState("vehicles"); // 'vehicles' | 'routes' | 'drivers'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Modals for Vehicles
  const addVehicleModal = useModal();
  const editVehicleModal = useModal();
  const viewVehicleModal = useModal();
  const deleteVehicleModal = useModal();

  // Modals for Routes
  const addRouteModal = useModal();
  const editRouteModal = useModal();
  const viewRouteModal = useModal();
  const deleteRouteModal = useModal();

  // Modals for Drivers
  const addDriverModal = useModal();
  const editDriverModal = useModal();
  const viewDriverModal = useModal();
  const deleteDriverModal = useModal();

  // Vehicle Form State
  const initialVehicleForm = {
    name: "",
    registrationNumber: "",
    model: "",
    capacity: 48,
    occupiedSeats: 0,
    driverName: "Marcus Vance",
    driverPhone: "+1 (555) 345-9812",
    routeName: "Route 1 — North District / Willow Creek",
    fuelType: "Diesel",
    status: "Active",
  };
  const [vehicleFormData, setVehicleFormData] = useState(initialVehicleForm);

  // Route Form State
  const initialRouteForm = {
    code: "",
    name: "",
    startPoint: "",
    endPoint: "Oakridge Academy Campus",
    totalDistanceKm: 15,
    morningDeparture: "06:45 AM",
    afternoonDeparture: "03:20 PM",
    assignedVehicle: "Transit Bus Alpha 01 (OAK-BUS-401)",
    assignedDriver: "Marcus Vance",
    farePerTerm: 150,
    status: "Active",
  };
  const [routeFormData, setRouteFormData] = useState(initialRouteForm);

  // Driver Form State
  const initialDriverForm = {
    name: "",
    licenseNumber: "",
    licenseType: "Commercial Class A with Passenger Endorsement (P)",
    phone: "",
    email: "",
    experienceYears: 5,
    assignedVehicle: "Transit Bus Alpha 01",
    status: "Active",
  };
  const [driverFormData, setDriverFormData] = useState(initialDriverForm);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.routeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  // Filter Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.assignedDriver.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [routes, searchTerm, statusFilter]);

  // Filter Drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // Handlers for Vehicle
  const handleOpenAddVehicle = () => {
    setVehicleFormData(initialVehicleForm);
    addVehicleModal.open();
  };

  const handleSaveAddVehicle = (e) => {
    e.preventDefault();
    if (!vehicleFormData.name || !vehicleFormData.registrationNumber) {
      alert("Please enter vehicle name and registration number.");
      return;
    }
    const created = addVehicle(vehicleFormData);
    addVehicleModal.close();
    showToast(`Vehicle "${created.name}" added to fleet.`);
  };

  const handleOpenEditVehicle = (veh) => {
    setVehicleFormData({
      name: veh.name,
      registrationNumber: veh.registrationNumber,
      model: veh.model,
      capacity: veh.capacity,
      occupiedSeats: veh.occupiedSeats,
      driverName: veh.driverName,
      driverPhone: veh.driverPhone,
      routeName: veh.routeName,
      fuelType: veh.fuelType,
      status: veh.status,
    });
    editVehicleModal.open(veh);
  };

  const handleSaveEditVehicle = (e) => {
    e.preventDefault();
    if (!editVehicleModal.modalData) return;
    updateVehicle(editVehicleModal.modalData.id, vehicleFormData);
    editVehicleModal.close();
    showToast(`Vehicle "${vehicleFormData.name}" updated.`);
  };

  const handleDeleteVehicle = () => {
    if (!deleteVehicleModal.modalData) return;
    deleteVehicle(deleteVehicleModal.modalData.id);
    deleteVehicleModal.close();
    showToast(`Vehicle "${deleteVehicleModal.modalData.name}" removed from fleet.`);
  };

  // Handlers for Route
  const handleOpenAddRoute = () => {
    setRouteFormData({
      ...initialRouteForm,
      code: `RT-0${routes.length + 1}`,
    });
    addRouteModal.open();
  };

  const handleSaveAddRoute = (e) => {
    e.preventDefault();
    if (!routeFormData.name || !routeFormData.startPoint) {
      alert("Please provide route name and starting point.");
      return;
    }
    const created = addRoute(routeFormData);
    addRouteModal.close();
    showToast(`Transit Route "${created.name}" created.`);
  };

  const handleOpenEditRoute = (rt) => {
    setRouteFormData({
      code: rt.code,
      name: rt.name,
      startPoint: rt.startPoint,
      endPoint: rt.endPoint,
      totalDistanceKm: rt.totalDistanceKm,
      morningDeparture: rt.morningDeparture,
      afternoonDeparture: rt.afternoonDeparture,
      assignedVehicle: rt.assignedVehicle,
      assignedDriver: rt.assignedDriver,
      farePerTerm: rt.farePerTerm,
      status: rt.status,
    });
    editRouteModal.open(rt);
  };

  const handleSaveEditRoute = (e) => {
    e.preventDefault();
    if (!editRouteModal.modalData) return;
    updateRoute(editRouteModal.modalData.id, routeFormData);
    editRouteModal.close();
    showToast(`Route "${routeFormData.name}" updated.`);
  };

  const handleDeleteRoute = () => {
    if (!deleteRouteModal.modalData) return;
    deleteRoute(deleteRouteModal.modalData.id);
    deleteRouteModal.close();
    showToast(`Route removed.`);
  };

  // Handlers for Driver
  const handleOpenAddDriver = () => {
    setDriverFormData(initialDriverForm);
    addDriverModal.open();
  };

  const handleSaveAddDriver = (e) => {
    e.preventDefault();
    if (!driverFormData.name || !driverFormData.licenseNumber) {
      alert("Please enter driver name and CDL license number.");
      return;
    }
    const created = addDriver(driverFormData);
    addDriverModal.close();
    showToast(`Driver "${created.name}" registered.`);
  };

  const handleOpenEditDriver = (drv) => {
    setDriverFormData({
      name: drv.name,
      licenseNumber: drv.licenseNumber,
      licenseType: drv.licenseType,
      phone: drv.phone,
      email: drv.email,
      experienceYears: drv.experienceYears,
      assignedVehicle: drv.assignedVehicle,
      status: drv.status,
    });
    editDriverModal.open(drv);
  };

  const handleSaveEditDriver = (e) => {
    e.preventDefault();
    if (!editDriverModal.modalData) return;
    updateDriver(editDriverModal.modalData.id, driverFormData);
    editDriverModal.close();
    showToast(`Driver "${driverFormData.name}" updated.`);
  };

  const handleDeleteDriver = () => {
    if (!deleteDriverModal.modalData) return;
    deleteDriver(deleteDriverModal.modalData.id);
    deleteDriverModal.close();
    showToast(`Driver removed.`);
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
        title="Transport Management"
        description="Comprehensive vehicle fleet, transit routes, stops scheduling, certified drivers, and seat occupancy tracking"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetTransportData}
            title="Reset to default mock transport data"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>

          {activeTab === "vehicles" && (
            <Button variant="primary" size="sm" onClick={handleOpenAddVehicle}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Vehicle
            </Button>
          )}

          {activeTab === "routes" && (
            <Button variant="primary" size="sm" onClick={handleOpenAddRoute}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Route
            </Button>
          )}

          {activeTab === "drivers" && (
            <Button variant="primary" size="sm" onClick={handleOpenAddDriver}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Driver
            </Button>
          )}
        </div>
      </PageHeader>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Fleet Vehicles"
          value={stats.totalVehicles}
          icon={Bus}
          description={`${stats.activeVehicles} active in circulation`}
        />
        <StatsCard
          title="Transit Routes"
          value={stats.totalRoutesCount}
          icon={Navigation}
          description="Designated pickup lines"
        />
        <StatsCard
          title="Total Bus Capacity"
          value={`${stats.totalOccupied} / ${stats.totalCapacity}`}
          icon={Users}
          description={`${stats.utilizationRate}% seat utilization`}
        />
        <StatsCard
          title="Certified Drivers"
          value={stats.totalDriversCount}
          icon={UserCheck}
          description="Commercial CDL licensed"
        />
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab("vehicles");
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "vehicles"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <Bus className="h-4 w-4" />
          <span>Vehicles & Fleet ({vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("routes");
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "routes"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <Navigation className="h-4 w-4" />
          <span>Transit Routes & Stops ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("drivers");
            setSearchTerm("");
            setStatusFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "drivers"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Certified Drivers ({drivers.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "vehicles"
                    ? "Search vehicles by name, reg number, route, or driver..."
                    : activeTab === "routes"
                    ? "Search routes by name, code, start point, or driver..."
                    : "Search drivers by name, CDL license, or phone..."
                }
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

            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                {activeTab === "vehicles" && (
                  <>
                    <option value="Available">Available (Standby)</option>
                    <option value="Maintenance">In Maintenance</option>
                  </>
                )}
                {activeTab === "drivers" && (
                  <>
                    <option value="Available">Available</option>
                    <option value="On Leave">On Leave</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TAB 1: VEHICLES & FLEET */}
      {activeTab === "vehicles" && (
        <Card>
          <CardHeader className="border-b border-slate-100 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-slate-800">
              Fleet Vehicle Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Vehicle registration numbers, route allocations, driver assignments, and passenger capacity
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-12 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Vehicle Name & Model</TableHead>
                  <TableHead className="text-xs">Registration No.</TableHead>
                  <TableHead className="text-xs">Assigned Route</TableHead>
                  <TableHead className="text-xs">Driver Details</TableHead>
                  <TableHead className="text-xs">Passenger Capacity</TableHead>
                  <TableHead className="text-xs">Fuel / Engine</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                      No vehicles found matching the criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((veh, idx) => {
                    const isMaintenance = veh.status === "Maintenance";
                    const isAvailable = veh.status === "Available";
                    const isFull = veh.occupiedSeats >= veh.capacity;

                    return (
                      <TableRow key={veh.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-center text-xs font-mono text-slate-400">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <button
                              type="button"
                              onClick={() => viewVehicleModal.open(veh)}
                              className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                            >
                              {veh.name}
                            </button>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {veh.model}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {veh.registrationNumber}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Navigation className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="line-clamp-1">{veh.routeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-xs text-slate-800">
                              {veh.driverName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {veh.driverPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-28 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">
                                {veh.occupiedSeats}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                / {veh.capacity} seats
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isFull
                                    ? "bg-rose-500"
                                    : veh.occupiedSeats > veh.capacity * 0.75
                                    ? "bg-amber-500"
                                    : "bg-indigo-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round((veh.occupiedSeats / (veh.capacity || 1)) * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            <Fuel className="h-3 w-3 text-slate-400" />
                            {veh.fuelType}
                          </span>
                        </TableCell>
                        <TableCell>
                          {veh.status === "Active" ? (
                            <Badge variant="success" className="text-[10px] font-bold">
                              Active
                            </Badge>
                          ) : isMaintenance ? (
                            <Badge variant="danger" className="text-[10px] font-bold">
                              Maintenance
                            </Badge>
                          ) : (
                            <Badge variant="info" className="text-[10px] font-bold">
                              Available
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewVehicleModal.open(veh)}
                              title="View Vehicle Specs & GPS Status"
                              className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditVehicle(veh)}
                              title="Edit Vehicle Details"
                              className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteVehicleModal.open(veh)}
                              title="Delete Vehicle"
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
      )}

      {/* TAB 2: TRANSIT ROUTES & STOPS */}
      {activeTab === "routes" && (
        <Card>
          <CardHeader className="border-b border-slate-100 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-slate-800">
              Transit Route Network & Schedules
            </CardTitle>
            <CardDescription className="text-xs">
              Daily bus lines, intermediate pickup stops, allocated transport vehicles, and term fees
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-12 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Route Name & Code</TableHead>
                  <TableHead className="text-xs">Departure / Destination</TableHead>
                  <TableHead className="text-xs">Total Stops</TableHead>
                  <TableHead className="text-xs">Timing (Morning / Afternoon)</TableHead>
                  <TableHead className="text-xs">Assigned Vehicle & Driver</TableHead>
                  <TableHead className="text-xs text-center">Students Enrolled</TableHead>
                  <TableHead className="text-xs">Term Fare</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                      No transit routes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((rt, idx) => (
                    <TableRow key={rt.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <button
                            type="button"
                            onClick={() => viewRouteModal.open(rt)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                          >
                            {rt.name}
                          </button>
                          <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {rt.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            From: {rt.startPoint}
                          </p>
                          <p className="text-slate-500 line-clamp-1">
                            To: {rt.endPoint}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => viewRouteModal.open(rt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          <MapPin className="h-3 w-3" />
                          {rt.stopsCount} Stops
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {rt.morningDeparture}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Return: {rt.afternoonDeparture}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {rt.assignedVehicle}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Driver: {rt.assignedDriver}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                          {rt.totalStudents} students
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {formatCurrency(rt.farePerTerm)}
                        </span>
                        <p className="text-[10px] text-slate-400">per term</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewRouteModal.open(rt)}
                            title="View Stops Timeline"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditRoute(rt)}
                            title="Edit Route"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRouteModal.open(rt)}
                            title="Delete Route"
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
      )}

      {/* TAB 3: CERTIFIED DRIVERS */}
      {activeTab === "drivers" && (
        <Card>
          <CardHeader className="border-b border-slate-100 py-3.5 px-6">
            <CardTitle className="text-sm font-bold text-slate-800">
              Commercial Driver Register
            </CardTitle>
            <CardDescription className="text-xs">
              Commercial driver licenses, passenger endorsements, contact information, and assigned transit lines
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-12 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Driver Name & ID</TableHead>
                  <TableHead className="text-xs">License Classification</TableHead>
                  <TableHead className="text-xs">Contact Information</TableHead>
                  <TableHead className="text-xs">Experience</TableHead>
                  <TableHead className="text-xs">Assigned Vehicle & Route</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      No drivers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((drv, idx) => (
                    <TableRow key={drv.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{drv.name}</p>
                          <span className="font-mono text-[11px] text-slate-400">
                            {drv.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {drv.licenseNumber}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {drv.licenseType}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="flex items-center gap-1 font-semibold text-slate-800">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {drv.phone}
                          </p>
                          <p className="text-slate-500 text-[11px]">{drv.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-700">
                          {drv.experienceYears} Years
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {drv.assignedVehicle}
                          </p>
                          <p className="text-slate-500 text-[11px] line-clamp-1">
                            {drv.assignedRoute}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {drv.status === "Active" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Active
                          </Badge>
                        ) : drv.status === "Available" ? (
                          <Badge variant="info" className="text-[10px] font-bold">
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            On Leave
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewDriverModal.open(drv)}
                            title="View Driver Profile"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDriver(drv)}
                            title="Edit Driver"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDriverModal.open(drv)}
                            title="Delete Driver"
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
      )}

      {/* MODAL: ADD VEHICLE */}
      <Modal
        isOpen={addVehicleModal.isOpen}
        onClose={addVehicleModal.close}
        title="Add Fleet Vehicle"
        description="Register a new bus or passenger van to the transport inventory."
        size="lg"
      >
        <form onSubmit={handleSaveAddVehicle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Vehicle Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Transit Bus Zeta 07"
                value={vehicleFormData.name}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registration Number / License Plate *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. OAK-BUS-407"
                value={vehicleFormData.registrationNumber}
                onChange={(e) =>
                  setVehicleFormData({
                    ...vehicleFormData,
                    registrationNumber: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Model / Make & Year
              </label>
              <input
                type="text"
                placeholder="e.g. Blue Bird All American (2024)"
                value={vehicleFormData.model}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, model: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                min="5"
                max="90"
                required
                value={vehicleFormData.capacity}
                onChange={(e) =>
                  setVehicleFormData({
                    ...vehicleFormData,
                    capacity: parseInt(e.target.value, 10) || 48,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fuel Type
              </label>
              <select
                value={vehicleFormData.fuelType}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, fuelType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="LPG / Propane">LPG / Propane</option>
                <option value="Gasoline">Gasoline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Operational Status
              </label>
              <select
                value={vehicleFormData.status}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, status: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Active">Active (On Transit Route)</option>
                <option value="Available">Available (Reserve Depot)</option>
                <option value="Maintenance">Maintenance (Service Bay)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Assigned Driver
              </label>
              <select
                value={vehicleFormData.driverName}
                onChange={(e) => {
                  const d = drivers.find((x) => x.name === e.target.value);
                  setVehicleFormData({
                    ...vehicleFormData,
                    driverName: e.target.value,
                    driverPhone: d?.phone || "N/A",
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.licenseNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Assigned Route
              </label>
              <select
                value={vehicleFormData.routeName}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, routeName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
                <option value="Reserve / Standby Fleet">Reserve / Standby Fleet</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={addVehicleModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT VEHICLE */}
      <Modal
        isOpen={editVehicleModal.isOpen}
        onClose={editVehicleModal.close}
        title="Edit Vehicle Details"
        description={`Update specs and assignments for ${editVehicleModal.modalData?.name}`}
        size="lg"
      >
        <form onSubmit={handleSaveEditVehicle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Vehicle Name *
              </label>
              <input
                type="text"
                required
                value={vehicleFormData.name}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={vehicleFormData.registrationNumber}
                onChange={(e) =>
                  setVehicleFormData({
                    ...vehicleFormData,
                    registrationNumber: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Model / Make
              </label>
              <input
                type="text"
                value={vehicleFormData.model}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, model: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                min="5"
                required
                value={vehicleFormData.capacity}
                onChange={(e) =>
                  setVehicleFormData({
                    ...vehicleFormData,
                    capacity: parseInt(e.target.value, 10) || 48,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Operational Status
              </label>
              <select
                value={vehicleFormData.status}
                onChange={(e) =>
                  setVehicleFormData({ ...vehicleFormData, status: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Active">Active</option>
                <option value="Available">Available (Standby)</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Occupied Seats
              </label>
              <input
                type="number"
                min="0"
                max={vehicleFormData.capacity}
                value={vehicleFormData.occupiedSeats}
                onChange={(e) =>
                  setVehicleFormData({
                    ...vehicleFormData,
                    occupiedSeats: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={editVehicleModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Vehicle Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW VEHICLE DETAILS */}
      <Modal
        isOpen={viewVehicleModal.isOpen}
        onClose={viewVehicleModal.close}
        title="Vehicle Specifications & Telematics"
        description="Depot registration specs, live tracking indicator, and inspection compliance"
        size="md"
      >
        {viewVehicleModal.modalData && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
              <div className="h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <Bus className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {viewVehicleModal.modalData.registrationNumber}
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">
                  {viewVehicleModal.modalData.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {viewVehicleModal.modalData.model}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Assigned Route</span>
                <span className="font-bold text-slate-800 line-clamp-1">
                  {viewVehicleModal.modalData.routeName}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Primary Driver</span>
                <span className="font-bold text-slate-800">
                  {viewVehicleModal.modalData.driverName}
                </span>
                <p className="text-[10px] text-slate-500 font-mono">
                  {viewVehicleModal.modalData.driverPhone}
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Seating Occupancy</span>
                <span className="font-bold text-indigo-700">
                  {viewVehicleModal.modalData.occupiedSeats} / {viewVehicleModal.modalData.capacity} Seats ({Math.round(
                    (viewVehicleModal.modalData.occupiedSeats /
                      (viewVehicleModal.modalData.capacity || 1)) *
                      100
                  )}%)
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">GPS Telematics</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {viewVehicleModal.modalData.gpsStatus || "Online"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Last Maintenance</span>
                <span className="font-medium text-slate-700">
                  {viewVehicleModal.modalData.lastServiceDate}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Next Service Due</span>
                <span className="font-semibold text-amber-700">
                  {viewVehicleModal.modalData.nextServiceDate}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={viewVehicleModal.close}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW ROUTE STOPS */}
      <Modal
        isOpen={viewRouteModal.isOpen}
        onClose={viewRouteModal.close}
        title="Transit Route Timeline & Waypoints"
        description={`Pickup sequence and student boarding points for ${viewRouteModal.modalData?.name}`}
        size="md"
      >
        {viewRouteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs">
              <p className="font-bold text-indigo-900">
                {viewRouteModal.modalData.name} ({viewRouteModal.modalData.code})
              </p>
              <p className="text-slate-600 mt-0.5">
                Total Distance: <span className="font-bold">{viewRouteModal.modalData.totalDistanceKm} km</span> &bull; Morning Start:{" "}
                <span className="font-bold">{viewRouteModal.modalData.morningDeparture}</span>
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">
                Pickup Waypoints Sequence
              </h5>
              <div className="space-y-2 border-l-2 border-indigo-200 ml-3 pl-3">
                {viewRouteModal.modalData.stops?.map((st) => (
                  <div key={st.stopNumber} className="relative text-xs">
                    <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">
                        {st.stopNumber}. {st.name}
                      </p>
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                        {st.time}
                      </span>
                    </div>
                    {st.pickupStudents > 0 && (
                      <p className="text-[11px] text-slate-500">
                        Boarding: {st.pickupStudents} students
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={viewRouteModal.close}>
                Close Timeline
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW DRIVER DETAILS */}
      <Modal
        isOpen={viewDriverModal.isOpen}
        onClose={viewDriverModal.close}
        title="Driver Personnel Dossier"
        description="Commercial driving credentials and compliance audit"
        size="md"
      >
        {viewDriverModal.modalData && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {viewDriverModal.modalData.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Employee ID: {viewDriverModal.modalData.id} &bull; Experience: {viewDriverModal.modalData.experienceYears} Years
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[11px]">License Class</span>
                <span className="font-bold text-slate-800">
                  {viewDriverModal.modalData.licenseNumber}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {viewDriverModal.modalData.licenseType}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Assigned Bus</span>
                  <span className="font-bold text-slate-800">
                    {viewDriverModal.modalData.assignedVehicle}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">License Expiry</span>
                  <span className="font-semibold text-emerald-700">
                    {viewDriverModal.modalData.licenseExpiry || "2028-01-01"}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                <span className="font-medium text-slate-800">
                  {viewDriverModal.modalData.emergencyContact || "Registered with HR"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={viewDriverModal.close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE VEHICLE CONFIRMATION */}
      <Modal
        isOpen={deleteVehicleModal.isOpen}
        onClose={deleteVehicleModal.close}
        title="Remove Vehicle from Fleet"
        description="Are you certain you wish to purge this vehicle from active transport records?"
        size="sm"
      >
        {deleteVehicleModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete &quot;{deleteVehicleModal.modalData.name}&quot;?
                </p>
                <p className="mt-0.5">
                  Reg: {deleteVehicleModal.modalData.registrationNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={deleteVehicleModal.close}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteVehicle}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
