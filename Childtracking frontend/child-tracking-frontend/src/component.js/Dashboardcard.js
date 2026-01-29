export default function DashboardCards() {
  return (
    <div className="cards">
      <div className="card">
        <h4>Total Children</h4>
        <p>2</p>
      </div>

      <div className="card">
        <h4>Last Location</h4>
        <p>Updated 2 mins ago</p>
      </div>

      <div className="card">
        <h4>Status</h4>
        <p className="safe">Safe ✅</p>
      </div>
    </div>
  );
}
