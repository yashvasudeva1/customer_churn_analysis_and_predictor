import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const COLORS = {
  stayed: '#10b981', // Emerald
  churned: '#ff4b3e', // Coral
}

const PIE_COLORS = ['#ff4b3e', '#eab308', '#6366f1', '#10b981', '#a1a1aa', '#71717a']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div style={{
      background: 'var(--bg-surface-hover)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Visualizations() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/data/visualizations`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-wrapper">
      <p>Loading visualizations...</p>
    </div>
  )

  if (!data) return <p>Failed to load data.</p>

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Visualizations</h1>
        <p>Interactive charts exploring churn patterns across different customer segments.</p>
      </div>

      <div className="grid-2">
        {/* Contract Type */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Contract Type</div>
              <div className="panel-subtitle">Month-to-month contracts show highest churn</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.contract_churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="contract" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Internet Service */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Internet Service</div>
              <div className="panel-subtitle">Fiber optic users churn most</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.internet_churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="service" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenure Distribution */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Tenure</div>
              <div className="panel-subtitle">New customers (0-12 months) churn most</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tenure_churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="tenure" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Payment Method</div>
              <div className="panel-subtitle">Electronic check users at highest risk</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.payment_churn} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis type="category" dataKey="method" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[0, 2, 2, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Charges Distribution */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Monthly Charges Distribution</div>
              <div className="panel-subtitle">Higher charges correlate with more churn</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_charges_hist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tech Support */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Tech Support</div>
              <div className="panel-subtitle">No tech support = higher churn</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tech_support_churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="techSupport" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Gender</div>
              <div className="panel-subtitle">Gender has minimal impact on churn</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.gender_churn}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="churned"
                nameKey="gender"
                label={({ gender, churned }) => `${gender}: ${churned}`}
              >
                {data.gender_churn.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Senior Citizen */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" style={{fontSize: '1.1rem'}}>Churn by Senior Citizen Status</div>
              <div className="panel-subtitle">Seniors churn at a higher rate proportionally</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.senior_citizen_churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="senior" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="stayed" name="Stayed" fill={COLORS.stayed} radius={[2, 2, 0, 0]} />
              <Bar dataKey="churned" name="Churned" fill={COLORS.churned} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
