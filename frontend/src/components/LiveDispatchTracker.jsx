import { useState, useEffect, useRef } from "react";
import { FaTractor, FaMapMarkerAlt, FaLocationArrow, FaPhoneAlt, FaExternalLinkAlt, FaCompass, FaCheckCircle, FaWarehouse } from "react-icons/fa";

export default function LiveDispatchTracker({ booking, driverName = "Ramesh Patel", driverPhone = "+91 98765 43210" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tractorMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Dynamic Real Owner / Tractor Depot Coordinates based on actual Tractor Data
  const getOwnerDepotCoords = () => {
    if (booking?.tractor_details?.latitude && booking?.tractor_details?.longitude) {
      const lat = parseFloat(booking.tractor_details.latitude);
      const lon = parseFloat(booking.tractor_details.longitude);
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0) return [lat, lon];
    }
    const loc = `${booking?.tractor_details?.location || ''} ${booking?.tractor_details?.district || ''}`.toLowerCase();
    if (loc.includes("rajkot") || loc.includes("jetpur")) return [21.7584, 70.6276];
    if (loc.includes("mehsana") || loc.includes("visnagar") || loc.includes("kadi")) return [23.6961, 72.5488];
    if (loc.includes("amreli") || loc.includes("babra")) return [21.8488, 71.3006];
    if (loc.includes("surat") || loc.includes("bardoli")) return [21.1192, 73.1118];
    if (loc.includes("anand")) return [22.5645, 72.9289];
    if (loc.includes("junagadh")) return [21.5222, 70.4579];
    if (loc.includes("vadodara")) return [22.3072, 73.1812];
    if (loc.includes("deesa") || loc.includes("banaskantha")) return [24.2570, 72.1822];
    return [22.9868, 72.3787]; // Sanand, Ahmedabad
  };

  const initialDepot = getOwnerDepotCoords();
  const [depotCoords, setDepotCoords] = useState(initialDepot);
  const [farmCoords, setFarmCoords] = useState([22.7234, 72.4633]); // Dholka / Farm location

  // Haversine distance calculator
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Determine Tractor GPS Coordinates purely based on REAL TRIP STATUS and DRIVER BROADCAST
  const getTractorPositionForStatus = (status, dCoords, fCoords) => {
    // If real driver coordinates exist on booking, use them!
    if (booking?.driver_latitude && booking?.driver_longitude) {
      const dLat = parseFloat(booking.driver_latitude);
      const dLon = parseFloat(booking.driver_longitude);
      if (!isNaN(dLat) && !isNaN(dLon)) return [dLat, dLon];
    }

    if (status === "pending") {
      // Parked at owner garage
      return dCoords;
    }
    if (status === "approved") {
      // Dispatched on the road
      return [
        dCoords[0] + (fCoords[0] - dCoords[0]) * 0.5,
        dCoords[1] + (fCoords[1] - dCoords[1]) * 0.5,
      ];
    }
    if (status === "arrived" || status === "in_progress" || status === "paid" || status === "completed") {
      // Reached farm
      return fCoords;
    }
    return dCoords;
  };

  const [currentTractorCoords, setCurrentTractorCoords] = useState(() =>
    getTractorPositionForStatus(booking?.status || "pending", initialDepot, [22.7234, 72.4633])
  );

  const [realGpsActive, setRealGpsActive] = useState(false);

  // Update tractor position when booking status or driver location updates
  useEffect(() => {
    const newDepot = getOwnerDepotCoords();
    setDepotCoords(newDepot);
    const newPos = getTractorPositionForStatus(booking?.status || "pending", newDepot, farmCoords);
    setCurrentTractorCoords(newPos);

    if (tractorMarkerRef.current) {
      tractorMarkerRef.current.setLatLng(newPos);
    }
  }, [booking?.status, booking?.driver_latitude, booking?.driver_longitude, booking?.tractor_details?.id]);

  // Get Farmer's Real Browser GPS Location
  const handleGetRealLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const updatedFarm = [latitude, longitude];
          setFarmCoords(updatedFarm);
          setRealGpsActive(true);

          const updatedTractor = getTractorPositionForStatus(booking?.status || "pending", depotCoords, updatedFarm);
          setCurrentTractorCoords(updatedTractor);
          if (tractorMarkerRef.current) {
            tractorMarkerRef.current.setLatLng(updatedTractor);
          }
        },
        (error) => {
          console.warn("Geolocation permission error:", error);
          alert("📍 Location permission was denied or unavailable. Using default farm location.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (typeof window !== "undefined" && window.L && !mapInstanceRef.current) {
      try {
        const L = window.L;
        const map = L.map(mapContainerRef.current, {
          center: [(depotCoords[0] + farmCoords[0]) / 2, (depotCoords[1] + farmCoords[1]) / 2],
          zoom: 11,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Depot / Owner Marker
        const depotIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color:#1e293b; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.3); font-size:14px; border:2px solid white;">🏭</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker(depotCoords, { icon: depotIcon }).addTo(map).bindPopup(
          `<b>Tractor Owner Garage / Depot</b><br>Owner: <b>${driverName}</b><br>📍 Location: <b>${booking?.tractor_details?.location || "Sanand, Ahmedabad"}</b>`
        );

        // Farmer Farm Marker
        const farmIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color:#dc2626; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 6px rgba(0,0,0,0.3); font-size:14px; border:2px solid white;">🌾</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        L.marker(farmCoords, { icon: farmIcon }).addTo(map).bindPopup(`<b>Destination Farm Field</b><br>📍 ${booking?.purpose || "Farmer Field"}`);

        // Tractor Marker
        const tractorIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color:#16a34a; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 10px rgba(0,0,0,0.4); font-size:18px; border:2px solid white;">🚜</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const tractorMarker = L.marker(currentTractorCoords, { icon: tractorIcon })
          .addTo(map)
          .bindPopup(`<b>${booking?.tractor_details?.name || "Tractor"}</b><br>Driver: ${driverName}<br>Status: ${booking?.status?.toUpperCase()}`);
        tractorMarkerRef.current = tractorMarker;

        // Polyline
        const polyline = L.polyline([depotCoords, currentTractorCoords, farmCoords], {
          color: "#16a34a",
          weight: 4,
          opacity: 0.8,
          dashArray: "8, 8",
        }).addTo(map);
        routePolylineRef.current = polyline;

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("Leaflet Map init error:", err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [depotCoords, farmCoords]);

  const currentDist = calculateDistance(currentTractorCoords[0], currentTractorCoords[1], farmCoords[0], farmCoords[1]);
  const etaMins = Math.max(1, Math.round((currentDist / 22) * 60));

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${depotCoords[0]},${depotCoords[1]}&destination=${farmCoords[0]},${farmCoords[1]}&travelmode=driving`;

  const getStatusDescription = () => {
    if (booking?.status === "pending") return "🛑 Tractor parked at owner's depot • Waiting for owner dispatch";
    if (booking?.status === "approved") return `🚚 Tractor dispatched by ${driverName} • En route on road (${currentDist} km away)`;
    if (booking?.status === "arrived") return "📍 Tractor arrived at your farm field • Driver on site 🌾";
    if (booking?.status === "in_progress") return "⏱️ Tractor actively operating on farm field";
    if (booking?.status === "paid") return "💰 Payment received • Ready for work completion OTP";
    if (booking?.status === "completed") return "⭐ Farm rental completed successfully";
    return "🚜 Dispatch tracking active";
  };

  return (
    <div className="card glass-card border-success-subtle p-3 rounded-4 shadow-sm mb-3">
      {/* Header with Status and Real-time Status Badge */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
          <span className="fw-bold text-dark fs-6 d-flex align-items-center gap-1.5">
            <FaLocationArrow className="text-success" /> Live GPS Dispatch Tracking (માલિક દ્વારા સંચાલિત લાઈવ ટ્રેકિંગ)
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold d-flex align-items-center gap-1 shadow-sm ${realGpsActive ? "btn-success" : "btn-outline-primary"}`}
            onClick={handleGetRealLocation}
            title="Fetch real browser GPS coordinates for your farm"
          >
            <FaCompass /> {realGpsActive ? "📍 Real GPS Active" : "📍 Use My Farm GPS"}
          </button>

          <span className={`badge ${booking?.status === 'arrived' || booking?.status === 'in_progress' ? 'bg-success' : booking?.status === 'approved' ? 'bg-primary' : 'bg-warning text-dark'} fw-bold px-3 py-2 rounded-pill fs-6`}>
            {booking?.status === "arrived" ? "On Site (0 km)" : booking?.status === "approved" ? `En Route (~${etaMins} mins)` : "At Depot"}
          </span>
        </div>
      </div>

      {/* Real-time Status Banner */}
      <div className="alert alert-info py-2 px-3 mb-2 rounded-3 small fw-semibold d-flex align-items-center gap-2">
        <span className="fs-5">ℹ️</span>
        <span>{getStatusDescription()}</span>
      </div>

      {/* Real Interactive OpenStreetMap Canvas */}
      <div
        ref={mapContainerRef}
        className="rounded-4 border mb-3 shadow-inner"
        style={{
          width: "100%",
          height: 240,
          backgroundColor: "#e2e8f0",
          zIndex: 1,
        }}
      ></div>

      {/* Driver Information and Google Maps Navigation Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 bg-light p-2.5 rounded-3 border">
        <div className="small">
          <div className="fw-bold text-dark">
            🚜 {booking?.tractor_details?.name || "Tractor Fleet"} • Driver: {driverName}
          </div>
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            📍 Depot: {booking?.tractor_details?.location || "Sanand"} ➔ Destination: {booking?.purpose || "Farmer's Field"}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 text-decoration-none shadow-sm"
          >
            <FaExternalLinkAlt /> Google Maps Route
          </a>

          <a
            href={`tel:${driverPhone}`}
            className="btn btn-success btn-sm rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5 text-decoration-none shadow-sm"
          >
            <FaPhoneAlt /> Call Driver ({driverPhone})
          </a>
        </div>
      </div>
    </div>
  );
}
