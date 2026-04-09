import { useState, useEffect } from 'react'

const API = 'http://localhost:5000/api'

export default function DataExplorer() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/data/overview`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-wrapper">
      <p>Loading data...</p>
    </div>
  )

  if (!data) return <p>Failed to load data.</p>

  const stats = data.numerical_stats

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Overview</h1>
        <p>Explore the statistical properties of the dataset's numerical features.</p>
      </div>

      {/* Numerical Statistics */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Descriptive Statistics</h2>
          <span className="tag">Numerical Features</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Statistic</th>
                {Object.keys(stats).map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map(stat => (
                <tr key={stat}>
                  <td className="metric-highlight">{stat}</td>
                  {Object.keys(stats).map(col => (
                    <td key={col}>
                      {stats[col][stat] !== undefined 
                        ? Number(stats[col][stat]).toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : '-'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Data */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Sample Data</h2>
          <span className="panel-subtitle">First 10 rows</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {data.sample_data.length > 0 && Object.keys(data.sample_data[0]).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sample_data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val !== null ? String(val) : '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
