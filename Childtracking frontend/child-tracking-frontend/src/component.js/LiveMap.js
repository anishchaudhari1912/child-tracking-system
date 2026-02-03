import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import API from "../Api";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "10px"
};

// Default center (Pune)
const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 };

// Static safe zone (can be made dynamic later)
const SAFE_ZONE = {
  lat: 18.5204,
  lng: 73.8567,
  radius: 500 // meters
};

const isOutsideSafeZone = (lat, lng) => {
  const dLat = Math.abs(lat - SAFE_ZONE.lat);
  const dLng = Math.abs(lng - SAFE_ZONE.lng);
  return dLat > 0.01 || dLng > 0.01;
};

export default function LiveMap({ childId }) {
  const [position, setPosition] = useState(null);
  const token = localStorage.getItem("token");
  const alertShown = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    if (!childId) return;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API}/location/latest/${childId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.data) {
          console.log("No GPS data yet");
          return;
        }

        const { latitude, longitude } = res.data;

        setPosition({ lat: latitude, lng: longitude });

        if (isOutsideSafeZone(latitude, longitude) && !alertShown.current) {
          alert("🚨 Child is outside the safe zone!");
          alertShown.current = true;
        }
      } catch (err) {
        console.error("Location fetch failed");
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 5000);
    return () => clearInterval(interval);
  }, [childId, token]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position || DEFAULT_CENTER}
      zoom={15}
    >
      {position && <Marker position={position} />}

      <Circle
        center={{ lat: SAFE_ZONE.lat, lng: SAFE_ZONE.lng }}
        radius={SAFE_ZONE.radius}
        options={{
          fillColor: "#22c55e",
          fillOpacity: 0.2,
          strokeColor: "#16a34a",
          strokeOpacity: 0.8
        }}
      />
    </GoogleMap>
  );
}
