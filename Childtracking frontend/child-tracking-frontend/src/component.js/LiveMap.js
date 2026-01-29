import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:3000";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "10px"
};

const SAFE_ZONE = {
  lat: 18.5204,
  lng: 73.8567,
  radius: 0.01
};

const isOutsideSafeZone = (lat, lng) =>
  Math.abs(lat - SAFE_ZONE.lat) > SAFE_ZONE.radius ||
  Math.abs(lng - SAFE_ZONE.lng) > SAFE_ZONE.radius;

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
        const res = await axios.get(
          `${API}/location/latest/${childId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data) {
          const { latitude, longitude } = res.data;
          setPosition({ lat: latitude, lng: longitude });

          if (isOutsideSafeZone(latitude, longitude) && !alertShown.current) {
            alert("🚨 Child is outside the safe zone!");
            alertShown.current = true;
          }
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
  if (!position) return <p>Waiting for location...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position}
      zoom={15}
    >
      <Marker position={position} />
    </GoogleMap>
  );
}
