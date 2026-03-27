export default function Sidebar({ activeTab, onTabChange, isUnsafe }) {
  return (
    <div className="sidebar">
      <h2 className="logo">👨‍👩‍👧 CTS</h2>

      <ul>
        <li
          className={activeTab === "dashboard" ? "active" : ""}
          role="button"
          tabIndex={0}
          onClick={() => onTabChange("dashboard")}
          onKeyDown={(e) => e.key === "Enter" && onTabChange("dashboard")}
        >
          Dashboard
        </li>
        <li
          className={activeTab === "children" ? "active" : ""}
          role="button"
          tabIndex={0}
          onClick={() => onTabChange("children")}
          onKeyDown={(e) => e.key === "Enter" && onTabChange("children")}
        >
          Children
        </li>
        <li
          className={activeTab === "live" ? "active" : ""}
          role="button"
          tabIndex={0}
          onClick={() => onTabChange("live")}
          onKeyDown={(e) => e.key === "Enter" && onTabChange("live")}
        >
          Live Tracking
        </li>
        <li
          className={activeTab === "alerts" ? "active" : ""}
          role="button"
          tabIndex={0}
          onClick={() => onTabChange("alerts")}
          onKeyDown={(e) => e.key === "Enter" && onTabChange("alerts")}
        >
          <div className="sidebar-alert-row">
            <span>Alerts</span>
            {isUnsafe ? <span className="sidebar-alert-badge">Unsafe</span> : null}
          </div>
        </li>
      </ul>
    </div>
  );
}
