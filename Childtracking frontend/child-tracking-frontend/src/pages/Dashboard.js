
import { useEffect, useState } from "react";
import axios from "axios";

import Header from "../component.js/header";
import LiveMap from "../component.js/LiveMap";
import LocationHistory from "../component.js/LocationHistory";
import Sidebar from "../component.js/sidebar";


import "../styles/Dashboard.css";

const API = "http://localhost:3000";

export default function Dashboard({ setToken }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isUnsafe, setIsUnsafe] = useState(false);

  const token = localStorage.getItem("token");

  const fetchChildren = async () => {
    const res = await axios.get(`${API}/child`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setChildren(res.data);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const addChild = async () => {
    if (!name || !age) return;

    await axios.post(
      `${API}/child`,
      { name, age },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setName("");
    setAge("");
    fetchChildren();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <Header setToken={setToken} />

        <div className="summary-cards">
          <div className="summary-card">
            <h4>Total Children</h4>
            <p>{children.length}</p>
          </div>

          <div className="summary-card">
            <h4>Selected Child</h4>
            <p>{selectedChild ? selectedChild.name : "None"}</p>
          </div>

          <div className="summary-card">
            <h4>Status</h4>
            <p className="safe-text">
              {selectedChild ? "Tracking Active" : "Idle"}
            </p>
          </div>
        </div>

        <div className="dashboard-content">

          {/* LEFT PANEL */}
          <div className="card">
            <h3>➕ Add Child</h3>

            <input
              placeholder="Child Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />

            <button onClick={addChild}>Add Child</button>

            <h3 style={{ marginTop: "20px" }}>👶 Your Children</h3>

            {children.length === 0 && <p>No children added yet</p>}

            {children.map((child) => (
              <div
                key={child._id}
                className={`child-item ${selectedChild?._id === child._id ? "active" : ""
                  } ${isUnsafe && selectedChild?._id === child._id ? "unsafe" : ""}`}
                onClick={() => setSelectedChild(child)}
              >
                <strong>{child.name}</strong>
                <span>Age: {child.age}</span>
              </div>
            ))}
          </div>

          {/* RIGHT PANEL */}
          <div className="card map-card">
            {!selectedChild ? (
              <p>Select a child to view live location</p>
            ) : (
              <>
                <h3>📍 Live Location – {selectedChild.name}</h3>

                <div style={{ height: "300px", marginBottom: "15px" }}>
                  <LiveMap childId={selectedChild._id} setUnsafe={setIsUnsafe} />

                </div>

                <LocationHistory childId={selectedChild._id} />
              </>
            )}
          </div>

        </div>
      </div>
    </div>


  );
}
