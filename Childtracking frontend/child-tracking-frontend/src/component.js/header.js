export default function Header({ setToken }) {
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="header">
      <h3>Parent Dashboard</h3>

      <div className="profile">
        <span>👤 Parent</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
