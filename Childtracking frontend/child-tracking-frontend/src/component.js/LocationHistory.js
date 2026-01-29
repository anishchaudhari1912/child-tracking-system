import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function LocationHistory({ childId }) {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!childId) return;

    axios.get(`${API}/location/history/${childId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setHistory(res.data));

  }, [childId, token]);

  return (
    <div style={{ marginTop: "15px" }}>
      <h4>📜 Location History</h4>
      {history.length === 0 && <p>No history available</p>}
      {history.map((loc, i) => (
        <div key={i} className="history-item">
          Lat: {loc.latitude}, Lng: {loc.longitude}
        </div>
      ))}
    </div>
  );
}
