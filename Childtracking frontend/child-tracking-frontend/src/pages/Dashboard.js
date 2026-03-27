
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../Api";
import Header from "../component.js/header";
import LiveMap from "../component.js/LiveMap";
import LocationHistory from "../component.js/LocationHistory";
import Sidebar from "../component.js/sidebar";



import "../styles/Dashboard.css";





export default function Dashboard({ setToken }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [isUnsafe, setIsUnsafe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("dashboardTheme") === "dark");
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("dashboardActiveTab") || "dashboard");
  const [safeRadius, setSafeRadius] = useState(500);
  const [pendingSafeCenter, setPendingSafeCenter] = useState(null);
  const [pickSafeMode, setPickSafeMode] = useState(false);

  const token = localStorage.getItem("token");

  //Update Safe Zone 
  const updateSafeZone = async () => {
    const token = localStorage.getItem("token");

    if (!token || !selectedChild) {
      toast.error("Please select a child first");
      return;
    }

    if (!pendingSafeCenter) {
      toast.error("Click on map to choose safe zone center");
      return;
    }

    if (!safeRadius || Number(safeRadius) < 50) {
      toast.error("Safe radius should be at least 50 meters");
      return;
    }

    try {
      await axios.put(
        `${API}/child/safezone/${selectedChild._id}`,
        {
          lat: Number(pendingSafeCenter.lat),
          lng: Number(pendingSafeCenter.lng),
          radius: Number(safeRadius)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPickSafeMode(false);
      toast.success("Safe zone updated");
      fetchChildren();
    } catch (err) {
      console.error(err);
      toast.error("Safe zone update failed");
    }
  };



  // ✅ useCallback makes function stable
  const fetchChildren = useCallback(async () => {
    const res = await axios.get(`${API}/child`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setChildren(res.data);
  }, [token]);

  // ✅ ESLint satisfied
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    localStorage.setItem("dashboardTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Avoid confusion when leaving safe-center picking mode.
    if (activeTab === "alerts") setPickSafeMode(false);
  }, [activeTab]);

  useEffect(() => {
    if (!selectedChild?.safeZone) {
      setPendingSafeCenter(null);
      setSafeRadius(500);
      return;
    }

    setPendingSafeCenter({
      lat: selectedChild.safeZone.lat,
      lng: selectedChild.safeZone.lng
    });
    setSafeRadius(selectedChild.safeZone.radius || 500);
    setPickSafeMode(false);
  }, [selectedChild]);

  const addChild = async () => {
    if (!name.trim() || !age) {
      toast.error("Please enter child name and age");
      return;
    }

    try {
      await axios.post(
        `${API}/child`,
        { name: name.trim(), age: Number(age) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setAge("");
      await fetchChildren();
      toast.success("Child saved to database");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save child");
    }
  };

  return (
    <div className={`dashboard-layout ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isUnsafe={isUnsafe} />

      <div className="main-content">
        <Header
          setToken={setToken}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

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

        <div className={`dashboard-content ${activeTab !== "dashboard" ? "dashboard-content-single" : ""}`}>
          {(activeTab === "dashboard" || activeTab === "children") && (
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

              <button className="primary-btn" onClick={addChild}>Add Child</button>

              <h3 style={{ marginTop: "20px" }}>👶 Your Children</h3>

              {children.length === 0 && <p className="empty-text">No children added yet</p>}

              <div className="child-list">
                {children.map((child) => (
                  <div
                    key={child._id}
                    className={`child-item ${selectedChild?._id === child._id ? "active" : ""
                      } ${isUnsafe && selectedChild?._id === child._id ? "unsafe" : ""}`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <strong>{child.name}</strong>
                    <span className="child-meta">Age: {child.age}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === "dashboard" || activeTab === "live") && (
            <div className="card map-card">
              {!selectedChild ? (
                <p className="map-placeholder">Select a child to view live location</p>
              ) : (
                <>
                  <h3>📍 Live Location – {selectedChild.name}</h3>
                  <div className="safezone-toolbar">
                    <button
                      className="secondary-btn"
                      onClick={() => setPickSafeMode((prev) => !prev)}
                    >
                      {pickSafeMode ? "Cancel Picking" : "Pick Safe Center"}
                    </button>

                    <label className="radius-control">
                      Radius (m)
                      <input
                        type="number"
                        min="50"
                        value={safeRadius}
                        onChange={(e) => setSafeRadius(e.target.value)}
                      />
                    </label>

                    <button className="secondary-btn" onClick={updateSafeZone}>
                      Save Safe Zone
                    </button>
                  </div>

                  <p className="safezone-help">
                    {pickSafeMode
                      ? "Click anywhere on map to set safe center, then save."
                      : "Enable pick mode to choose safe center on map."}
                  </p>

                  <div style={{ height: "300px", marginBottom: "15px" }}>
                    <LiveMap
                      childId={selectedChild._id}
                      setUnsafe={setIsUnsafe}
                      enablePickSafeZone={pickSafeMode}
                      onPickCenter={setPendingSafeCenter}
                      pendingSafeCenter={pendingSafeCenter}
                      safeRadius={safeRadius}
                      onSafeZoneLoaded={(zone) => {
                        if (!pendingSafeCenter) {
                          setPendingSafeCenter({ lat: zone.lat, lng: zone.lng });
                          setSafeRadius(zone.radius || 500);
                        }
                      }}
                    />
                  </div>

                  <LocationHistory childId={selectedChild._id} />
                </>
              )}
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="card map-card">
              <h3>🚨 Alerts</h3>

              {!selectedChild ? (
                <>
                  <p className="map-placeholder" style={{ marginTop: 10 }}>
                    Select a child from <strong>Children</strong> tab
                  </p>
                  <button className="secondary-btn" onClick={() => setActiveTab("children")}>
                    Go to Children
                  </button>
                </>
              ) : (
                <>
                  <div className={`alert-box ${isUnsafe ? "alert-unsafe" : "alert-safe"}`}>
                    <p style={{ margin: 0, fontWeight: 900 }}>
                      {isUnsafe ? "Unsafe" : "Safe"}: {selectedChild.name}
                    </p>
                    <p style={{ margin: "6px 0 0" }}>
                      {isUnsafe ? "Child is outside the safe circle." : "Child is inside the safe circle."}
                    </p>
                  </div>

                  {selectedChild.safeZone ? (
                    <p className="empty-text" style={{ marginTop: 10 }}>
                      Safe radius: <strong>{selectedChild.safeZone.radius}m</strong>
                    </p>
                  ) : null}

                  <div style={{ height: "240px", margin: "12px 0" }}>
                    <LiveMap childId={selectedChild._id} setUnsafe={setIsUnsafe} enablePickSafeZone={false} />
                  </div>

                  <button className="secondary-btn" onClick={() => setActiveTab("live")}>
                    Open Live Tracking
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>


  );
}
