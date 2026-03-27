export default function Header({
  setToken,
  isDarkMode,
  setIsDarkMode,
  activeTab,
  setActiveTab
}) {
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="header">
      <div>
        <h3>Parent Dashboard</h3>
        <p className="header-subtitle">Monitor children location and safety in real time</p>

        <select
          className="dashboard-tab-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          aria-label="Select dashboard section"
        >
          <option value="dashboard">Dashboard</option>
          <option value="children">Children</option>
          <option value="live">Live Tracking</option>
          <option value="alerts">Alerts</option>
        </select>
      </div>

      <div className="profile">
        <button className="theme-btn" onClick={() => setIsDarkMode((prev) => !prev)}>
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <span className="profile-tag">👤 Parent</span>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
