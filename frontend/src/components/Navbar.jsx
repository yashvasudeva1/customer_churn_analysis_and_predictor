export default function Navbar({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-title">Customer Churn Analysis</div>
      </div>
      <ul className="navbar-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <button
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  )
}
