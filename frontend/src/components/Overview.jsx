import { useState, useEffect } from 'react'
import { Users, Layers, UserMinus, Percent, UserCheck } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Overview() {
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Overview</h1>
        <p>
          Analyzing customer data to understand and predict churn- identifying customers
          who are likely to discontinue a service. By uncovering key behavioral and demographic
          factors behind churn, this analysis helps businesses make data-driven retention decisions.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-header">
            <span className="label-caps">Total Customers</span>
            <span className="stat-icon-wrapper"><Users size={16} /></span>
          </div>
          <div className="stat-value">{data.shape.rows.toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="stat-header">
            <span className="label-caps">Features</span>
            <span className="stat-icon-wrapper"><Layers size={16} /></span>
          </div>
          <div className="stat-value">{data.shape.cols}</div>
        </div>
        <div className="stat-item">
          <div className="stat-header">
            <span className="label-caps" style={{ color: 'var(--color-churn)' }}>Churned</span>
            <span className="stat-icon-wrapper text-coral"><UserMinus size={16} /></span>
          </div>
          <div className="stat-value">{data.churn_distribution.churn.toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="stat-header">
            <span className="label-caps" style={{ color: 'var(--color-churn)' }}>Churn Rate</span>
            <span className="stat-icon-wrapper text-coral"><Percent size={16} /></span>
          </div>
          <div className="stat-value">{data.churn_distribution.churn_rate}%</div>
        </div>
        <div className="stat-item">
          <div className="stat-header">
            <span className="label-caps" style={{ color: 'var(--color-stay)' }}>Retained</span>
            <span className="stat-icon-wrapper text-emerald"><UserCheck size={16} /></span>
          </div>
          <div className="stat-value">{data.churn_distribution.no_churn.toLocaleString()}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">About the Dataset</h2>
          <span className="tag">Telco Customer Churn</span>
        </div>
        <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: '16px' }}>
            Sourced from <strong>IBM Sample Data Sets</strong> via Kaggle, this dataset captures
            customer demographics, subscribed services, account details, and churn status for a
            telecommunications company.
          </p>
          <div className="grid-2">
            <div>
              <div className="label-caps" style={{ marginBottom: '4px' }}>Demographics</div>
              <div style={{ fontSize: '0.85rem' }}>Gender, senior citizen, partner & dependents</div>
            </div>
            <div>
              <div className="label-caps" style={{ marginBottom: '4px' }}>Services</div>
              <div style={{ fontSize: '0.85rem' }}>Phone, internet, security, backup, streaming</div>
            </div>
            <div>
              <div className="label-caps" style={{ marginBottom: '4px' }}>Account</div>
              <div style={{ fontSize: '0.85rem' }}>Contract, billing, payment method, charges</div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Column Information</h2>
          <span className="panel-subtitle">{data.column_info.length} columns</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
                <th>Unique Values</th>
                <th>Missing</th>
              </tr>
            </thead>
            <tbody>
              {data.column_info.map(col => (
                <tr key={col.name}>
                  <td className="metric-highlight">{col.name}</td>
                  <td><span className="tag">{col.dtype}</span></td>
                  <td>{col.nunique}</td>
                  <td>
                    {col.null_count > 0
                      ? <span className="status-bad font-semibold">{col.null_count}</span>
                      : <span className="status-good">0</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
