"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockVehicles,
  mockRoutes,
  mockDrivers,
} from "@/data/mock/transport";

let transportStore = {
  vehicles: [...mockVehicles],
  routes: [...mockRoutes],
  drivers: [...mockDrivers],
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
  return transportStore;
}

function getServerSnapshot() {
  return transportStore;
}

export function useTransport() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { vehicles, routes, drivers } = store;

  // Vehicle operations
  const addVehicle = useCallback((newVeh) => {
    const id = `VEH-${100 + transportStore.vehicles.length + 1}`;
    const cap = parseInt(newVeh.capacity, 10) || 30;
    const item = {
      id,
      name: newVeh.name,
      registrationNumber: newVeh.registrationNumber,
      model: newVeh.model || "Commercial Bus",
      capacity: cap,
      occupiedSeats: parseInt(newVeh.occupiedSeats, 10) || 0,
      driverId: newVeh.driverId || "Unassigned",
      driverName: newVeh.driverName || "Unassigned",
      driverPhone: newVeh.driverPhone || "N/A",
      routeId: newVeh.routeId || "Unassigned",
      routeName: newVeh.routeName || "Unassigned Route",
      fuelType: newVeh.fuelType || "Diesel",
      status: newVeh.status || "Active",
      gpsStatus: "Online - Active GPS",
      lastServiceDate: "2026-03-01",
      nextServiceDate: "2026-06-01",
      insurancePolicy: newVeh.insurancePolicy || "POL-US-991200",
      insuranceExpiry: "2026-12-31",
    };

    transportStore = {
      ...transportStore,
      vehicles: [item, ...transportStore.vehicles],
    };
    emitChange();
    return item;
  }, []);

  const updateVehicle = useCallback((vehId, updatedFields) => {
    transportStore = {
      ...transportStore,
      vehicles: transportStore.vehicles.map((v) =>
        v.id === vehId
          ? {
              ...v,
              ...updatedFields,
              capacity: parseInt(updatedFields.capacity, 10) || v.capacity,
              occupiedSeats:
                parseInt(updatedFields.occupiedSeats, 10) ?? v.occupiedSeats,
            }
          : v
      ),
    };
    emitChange();
  }, []);

  const deleteVehicle = useCallback((vehId) => {
    transportStore = {
      ...transportStore,
      vehicles: transportStore.vehicles.filter((v) => v.id !== vehId),
    };
    emitChange();
  }, []);

  // Route operations
  const addRoute = useCallback((newRt) => {
    const id = `RT-0${transportStore.routes.length + 1}`;
    const item = {
      id,
      code: newRt.code || `RT-SCH-${transportStore.routes.length + 1}`,
      name: newRt.name,
      startPoint: newRt.startPoint || "Depot Start",
      endPoint: newRt.endPoint || "Oakridge Academy Main Gate",
      stopsCount: parseInt(newRt.stopsCount, 10) || 4,
      stops: newRt.stops || [],
      assignedVehicle: newRt.assignedVehicle || "Pending Assignment",
      assignedDriver: newRt.assignedDriver || "Pending Assignment",
      totalDistanceKm: parseFloat(newRt.totalDistanceKm) || 15.0,
      morningDeparture: newRt.morningDeparture || "07:00 AM",
      afternoonDeparture: newRt.afternoonDeparture || "03:15 PM",
      totalStudents: parseInt(newRt.totalStudents, 10) || 0,
      farePerTerm: parseFloat(newRt.farePerTerm) || 140,
      status: newRt.status || "Active",
    };

    transportStore = {
      ...transportStore,
      routes: [item, ...transportStore.routes],
    };
    emitChange();
    return item;
  }, []);

  const updateRoute = useCallback((rtId, updatedFields) => {
    transportStore = {
      ...transportStore,
      routes: transportStore.routes.map((r) =>
        r.id === rtId ? { ...r, ...updatedFields } : r
      ),
    };
    emitChange();
  }, []);

  const deleteRoute = useCallback((rtId) => {
    transportStore = {
      ...transportStore,
      routes: transportStore.routes.filter((r) => r.id !== rtId),
    };
    emitChange();
  }, []);

  // Driver operations
  const addDriver = useCallback((newDrv) => {
    const id = `DRV-00${transportStore.drivers.length + 1}`;
    const item = {
      id,
      name: newDrv.name,
      licenseNumber: newDrv.licenseNumber,
      licenseType: newDrv.licenseType || "Commercial CDL-A",
      phone: newDrv.phone || "N/A",
      email: newDrv.email || "",
      experienceYears: parseInt(newDrv.experienceYears, 10) || 5,
      assignedVehicle: newDrv.assignedVehicle || "Unassigned",
      assignedRoute: newDrv.assignedRoute || "Unassigned",
      joiningDate: "2026-01-10",
      licenseExpiry: newDrv.licenseExpiry || "2028-01-01",
      emergencyContact: newDrv.emergencyContact || "N/A",
      status: newDrv.status || "Active",
    };

    transportStore = {
      ...transportStore,
      drivers: [item, ...transportStore.drivers],
    };
    emitChange();
    return item;
  }, []);

  const updateDriver = useCallback((drvId, updatedFields) => {
    transportStore = {
      ...transportStore,
      drivers: transportStore.drivers.map((d) =>
        d.id === drvId ? { ...d, ...updatedFields } : d
      ),
    };
    emitChange();
  }, []);

  const deleteDriver = useCallback((drvId) => {
    transportStore = {
      ...transportStore,
      drivers: transportStore.drivers.filter((d) => d.id !== drvId),
    };
    emitChange();
  }, []);

  // Reset to default
  const resetTransportData = useCallback(() => {
    transportStore = {
      vehicles: [...mockVehicles],
      routes: [...mockRoutes],
      drivers: [...mockDrivers],
    };
    emitChange();
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "Active").length;
    const maintenanceVehicles = vehicles.filter(
      (v) => v.status === "Maintenance"
    ).length;
    const totalCapacity = vehicles.reduce((acc, v) => acc + (v.capacity || 0), 0);
    const totalOccupied = vehicles.reduce(
      (acc, v) => acc + (v.occupiedSeats || 0),
      0
    );
    const utilizationRate =
      totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    const totalRoutesCount = routes.length;
    const totalDriversCount = drivers.length;

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalCapacity,
      totalOccupied,
      utilizationRate,
      totalRoutesCount,
      totalDriversCount,
    };
  }, [vehicles, routes, drivers]);

  return {
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
  };
}

export default useTransport;
