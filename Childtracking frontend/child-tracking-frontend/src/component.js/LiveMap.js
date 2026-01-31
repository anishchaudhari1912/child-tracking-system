import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "https://child-tracking-backend.onrender.com";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "10px"
};

// ✅ SAFE ZONE (meters – Google Maps compatible)
const SAFE_ZONE = {
  lat: 18.5204,
  lng: 73.8567,
  radius: 500 // ✅ 500 meters
};

const isOutsideSafeZone = (lat, lng) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius (meters)

  const dLat = toRad(lat - SAFE_ZONE.lat);
  const dLng = toRad(lng - SAFE_ZONE.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(SAFE_ZONE.lat)) *
      Math.cos(toRad(lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance > SAFE_ZONE.radius;
};

export default function LiveMap({ childId }) {
  const [position, setPosition] = useState(null);
  const token = localStorage.getItem("token");
  const alertShown = useRef(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
    // 🔴 TEMP DEBUG:
    // googleMapsApiKey: "AIzaSyXXXX"
  });

  useEffect(() => {
    if (!childId) return;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(
          `${API}/location/latest/${childId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.data || res.data.latitude == null || res.data.longitude == null) {
          console.warn("No GPS data yet");
          return;
        }

        const { latitude, longitude } = res.data;

        setPosition({ lat: latitude, lng: longitude });

        if (isOutsideSafeZone(latitude, longitude) && !alertShown.current) {
          alert("🚨 Child is outside the safe zone!");
          alertShown.current = true;
        }

        if (!isOutsideSafeZone(latitude, longitude)) {
          alertShown.current = false;
        }
      } catch (err) {
        console.error("Location fetch failed", err.message);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [childId, token]);

  if (loadError) return <p>❌ Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;
  if (!position) return <p>Waiting for GPS signal…</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position}
      zoom={15}
    >
      {/* CHILD LOCATION */}
      <Marker position={position} />

      {/* SAFE ZONE */}
      <Circle
        center={{ lat: SAFE_ZONE.lat, lng: SAFE_ZONE.lng }}
        radius={SAFE_ZONE.radius}
        options={{
          fillColor: "#22c55e",
          fillOpacity: 0.25,
          strokeColor: "#16a34a",
          strokeOpacity: 0.8,
          strokeWeight: 2
        }}
      />
    </GoogleMap>
  );
}
