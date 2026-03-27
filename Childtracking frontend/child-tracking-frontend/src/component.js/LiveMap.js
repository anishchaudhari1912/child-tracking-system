import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Circle as LeafletCircle, useMapEvents } from "react-leaflet";
import axios from "axios";

import API from "../Api";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "10px"
};

// Default center (Pune)
const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 };

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapClickHandler({ onPickCenter, enablePickSafeZone }) {
  useMapEvents({
    click(e) {
      if (!enablePickSafeZone) return;
      onPickCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function LiveMap({
  childId,
  setUnsafe,
  onPickCenter,
  enablePickSafeZone,
  pendingSafeCenter,
  safeRadius,
  onSafeZoneLoaded,
  onSafetyUpdate
}) {
  const [position, setPosition] = useState(null);
  const [safeZone, setSafeZone] = useState(null);
  const token = localStorage.getItem("token");
  const alertShown = useRef(false);
  const hasGoogleMapsKey = Boolean(process.env.REACT_APP_GOOGLE_MAPS_KEY);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || ""
  });

  useEffect(() => {
    if (!childId) return;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API}/location/latest/${childId}`,
          { headers: { Authorization: `Bearer ${token}`
          }
        });

        if (!res.data) {
          console.log("No GPS data yet");
          return;
        }

        const { latitude, longitude, safeZone: zoneFromDB, createdAt } = res.data;

        setPosition({ lat: latitude, lng: longitude });
        setSafeZone(zoneFromDB || null);
        if (zoneFromDB && onSafeZoneLoaded) onSafeZoneLoaded(zoneFromDB);

        // Keep status stable even when safe zone is unavailable
        if (!zoneFromDB) {
          if (setUnsafe) setUnsafe(false);
          return;
        }

        // True geodesic distance check against radius
        const distance = getDistanceInMeters(latitude, longitude, zoneFromDB.lat, zoneFromDB.lng);
        const isOutside = distance > zoneFromDB.radius;
        if (setUnsafe) setUnsafe(isOutside);
        if (onSafetyUpdate) {
          onSafetyUpdate({
            isUnsafe: isOutside,
            distanceMeters: distance,
            createdAt: createdAt ? new Date(createdAt) : new Date()
          });
        }
        if (isOutside && !alertShown.current) {
          alert("Child is outside the safe zone");
          alertShown.current = true;
        }
        if (!isOutside) {
          alertShown.current = false;
        }
      } catch (err) {
        console.error("Location fetch failed", err);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [childId, token, setUnsafe, onSafeZoneLoaded, onSafetyUpdate]);

  if (!position) return <p>Waiting for GPS data...</p>;

  const previewZone = pendingSafeCenter
    ? { lat: pendingSafeCenter.lat, lng: pendingSafeCenter.lng, radius: Number(safeRadius) || 500 }
    : null;

  if (!hasGoogleMapsKey || loadError) {
    return (
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        style={{ width: "100%", height: "300px", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LeafletCircle
          center={[position.lat, position.lng]}
          radius={40}
          pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.65 }}
        />

        <MapClickHandler onPickCenter={onPickCenter} enablePickSafeZone={enablePickSafeZone} />

        {safeZone && (
          <LeafletCircle
            center={[safeZone.lat, safeZone.lng]}
            radius={safeZone.radius}
            pathOptions={{ color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.2 }}
          />
        )}

        {previewZone && (
          <LeafletCircle
            center={[previewZone.lat, previewZone.lng]}
            radius={previewZone.radius}
            pathOptions={{ color: "#f59e0b", fillColor: "#fbbf24", fillOpacity: 0.2, dashArray: "6 6" }}
          />
        )}
      </MapContainer>
    );
  }

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position || DEFAULT_CENTER}
      zoom={15}
      onClick={(e) => {
        if (!enablePickSafeZone || !onPickCenter || !e.latLng) return;
        onPickCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }}
    >
      <Marker position={position} />
      {safeZone && (
        <Circle
          center={{ lat: safeZone.lat, lng: safeZone.lng }}
          radius={safeZone.radius}
          options={{
            fillColor: "#22c55e",
            fillOpacity: 0.2,
            strokeColor: "#16a34a",
            strokeOpacity: 0.8
          }}
        />
      )}

      {previewZone && (
        <Circle
          center={{ lat: previewZone.lat, lng: previewZone.lng }}
          radius={previewZone.radius}
          options={{
            fillColor: "#fbbf24",
            fillOpacity: 0.18,
            strokeColor: "#f59e0b",
            strokeOpacity: 0.9,
            strokeWeight: 2
          }}
        />
      )}
    </GoogleMap>
  );
}
