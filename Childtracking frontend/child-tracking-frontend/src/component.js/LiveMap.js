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

export default function LiveMap({ childId }) {
  const [position, setPosition] = useState(null);
  const[safeZone,setSafeZone]=useState(null);
  const token = localStorage.getItem("token");
  const alertShown = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    if (!childId) return;

    const fetchLocation = async () => {
      try {
        const res = await axios.get(`${API}/location/latest/${childId}`, 
          {headers: {Authorization: `Bearer ${token}`
          }
        });

        if (!res.data) {
          console.log("No GPS data yet");
          return;
        }

        const { latitude, longitude,safeZone:zoneFromDB} = res.data;

        setPosition({ lat: latitude, lng: longitude });
        setSafeZone(zoneFromDB);//store safe zone from backend
        //simple distance check (rough but works for demo)
        const isOutside=Math.abs(latitude-zoneFromDB.lat)>0.01||Math.abs(longitude-zoneFromDB.lng)>0.01;
        if(isOutside && !alertShown.current){
          alert(" Child is Outside the Safe Zone");
          alertShown.current=true;
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
  if (!position) return <p>Waaiting For GPS data...</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={position || DEFAULT_CENTER}
      zoom={15}
    >
      <Marker position={position} />
      {safeZone&&(
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
    </GoogleMap>
  );
}
