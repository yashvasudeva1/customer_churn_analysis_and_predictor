import { useState } from 'react'

const API = 'http://localhost:5000/api'

const DEFAULT_STATE = {
  gender: 'Male',
  seniorCitizen: 0,
  partner: 'No',
  dependents: 'No',
  tenure: 12,
  phoneService: 'Yes',
  multipleLines: 'No',
  internetService: 'DSL',
  onlineSecurity: 'No',
  onlineBackup: 'No',
  deviceProtection: 'No',
  techSupport: 'No',
  streamingTV: 'No',
  streamingMovies: 'No',
  contract: 'Month-to-month',
  paperlessBilling: 'Yes',
  paymentMethod: 'Electronic check',
  monthlyCharges: 70,
  totalCharges: 840,
}

function getRiskTier(prob) {
  if (prob >= 0.75) return { label: 'Critical Risk', color: '#ff4b3e', bg: 'rgba(255,75,62,0.08)' }
  if (prob >= 0.50) return { label: 'High Risk', color: '#f97316', bg: 'rgba(249,115,22,0.08)' }
  if (prob >= 0.30) return { label: 'Moderate Risk', color: '#eab308', bg: 'rgba(234,179,8,0.08)' }
  return { label: 'Low Risk', color: '#10b981', bg: 'rgba(16,185,129,0.08)' }
}

function PredictionResult({ result, form }) {
  const prob = result.churn_probability
  const isChurn = result.prediction === 1
  const stayProb = 1 - prob
  const risk = getRiskTier(prob)

  // SVG donut ring
  const R = 64
  const CIRC = 2 * Math.PI * R
  const fill = prob * CIRC

  return (
    <div style={{
      marginTop: '28px',
      border: `1px solid ${isChurn ? 'rgba(255,75,62,0.3)' : 'rgba(16,185,129,0.3)'}`,
      borderLeft: `4px solid ${isChurn ? 'var(--color-churn)' : 'var(--color-stay)'}`,
      background: 'var(--bg-surface)',
      animation: 'fadeIn 0.4s ease',
    }}>

      {/* ── Banner row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: '1px solid var(--border-muted)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)', marginBottom: '5px' }}>
            Model Verdict
          </div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.7rem',
            fontWeight: 600,
            lineHeight: 1,
            color: isChurn ? 'var(--color-churn)' : 'var(--color-stay)',
          }}>
            {isChurn ? 'Likely to Churn' : 'Likely to Stay'}
          </div>
        </div>

        <div style={{
          padding: '5px 14px',
          background: risk.bg,
          border: `1px solid ${risk.color}`,
          color: risk.color,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {risk.label}
        </div>
      </div>

      {/* ── Main body: ring + breakdown ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '190px 1fr',
      }}>

        {/* Left: donut gauge */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          borderRight: '1px solid var(--border-muted)',
        }}>
          <svg width="152" height="152" viewBox="0 0 152 152">
            {/* track */}
            <circle cx="76" cy="76" r={R} fill="none" stroke="var(--border-muted)" strokeWidth="12" />
            {/* fill */}
            <circle
              cx="76" cy="76" r={R}
              fill="none"
              stroke={isChurn ? 'var(--color-churn)' : 'var(--color-stay)'}
              strokeWidth="12"
              strokeLinecap="butt"
              strokeDasharray={`${fill} ${CIRC}`}
              transform="rotate(-90 76 76)"
              style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)' }}
            />
            <text x="76" y="70" textAnchor="middle"
              fontFamily="Space Grotesk, sans-serif" fontSize="26" fontWeight="700"
              fill={isChurn ? 'var(--color-churn)' : 'var(--color-stay)'}>
              {(prob * 100).toFixed(1)}%
            </text>
            <text x="76" y="89" textAnchor="middle"
              fontFamily="Inter, sans-serif" fontSize="10"
              fill="var(--text-faint)">
              Churn Probability
            </text>
          </svg>
        </div>

        {/* Right: details */}
        <div style={{ padding: '24px 24px' }}>

          {/* Stacked bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)', marginBottom: '8px' }}>
              Probability Split
            </div>
            <div style={{ height: '6px', display: 'flex', background: 'var(--border-muted)' }}>
              <div style={{
                width: `${prob * 100}%`,
                background: 'var(--color-churn)',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
              }} />
              <div style={{
                width: `${stayProb * 100}%`,
                background: 'var(--color-stay)',
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-churn)', fontWeight: 600 }}>
                Churn {(prob * 100).toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-stay)', fontWeight: 600 }}>
                Stay {(stayProb * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 4-cell stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            {[
              { label: 'Churn Score', value: (prob * 100).toFixed(2) + '%', color: isChurn ? 'var(--color-churn)' : 'var(--text-main)' },
              { label: 'Retention Score', value: (stayProb * 100).toFixed(2) + '%', color: 'var(--color-stay)' },
              { label: 'Contract Type', value: form.contract, color: 'var(--text-main)' },
              { label: 'Tenure', value: `${form.tenure} months`, color: 'var(--text-main)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderLeft: '2px solid var(--border-muted)',
              }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-faint)', marginBottom: '3px' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Interpretation strip */}
          <div style={{
            padding: '11px 14px',
            borderLeft: `2px solid ${isChurn ? 'var(--color-churn)' : 'var(--color-stay)'}`,
            background: isChurn ? 'rgba(255,75,62,0.05)' : 'rgba(16,185,129,0.05)',
            fontSize: '0.83rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
          }}>
            {isChurn
              ? `This customer carries a ${(prob * 100).toFixed(1)}% churn probability. Primary risk signals: ${form.contract} contract, ${form.paymentMethod} payment, and only ${form.tenure} months of tenure. A targeted retention offer is recommended.`
              : `This customer has a ${(stayProb * 100).toFixed(1)}% retention probability- relatively low churn risk. Maintain engagement through loyalty incentives and contract upgrade nudges.`
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Prediction() {
  const [form, setForm] = useState(DEFAULT_STATE)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const predict = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const SelectField = ({ label, value, options, onChange }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const SectionHead = ({ n, title }) => (
    <h3 style={{
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'var(--text-faint)',
      marginBottom: '14px', marginTop: '8px',
    }}>
      {n}- {title}
    </h3>
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Churn Predictor</h1>
        <p>Fill in the customer profile below and run the XGBoost model to get a churn probability.</p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Customer Profile</h2>
          <span className="tag">19 Features</span>
        </div>

        {/* ── 01 Demographics ── */}
        <SectionHead n="01" title="Demographics" />
        <div className="form-grid" style={{ marginBottom: '28px' }}>
          <SelectField label="Gender" value={form.gender} options={['Male', 'Female']} onChange={v => update('gender', v)} />
          <SelectField label="Senior Citizen" value={form.seniorCitizen} options={[0, 1]} onChange={v => update('seniorCitizen', parseInt(v))} />
          <SelectField label="Partner" value={form.partner} options={['Yes', 'No']} onChange={v => update('partner', v)} />
          <SelectField label="Dependents" value={form.dependents} options={['Yes', 'No']} onChange={v => update('dependents', v)} />
        </div>

        {/* ── 02 Services ── */}
        <SectionHead n="02" title="Services" />
        <div className="form-grid" style={{ marginBottom: '28px' }}>
          <SelectField label="Phone Service" value={form.phoneService} options={['Yes', 'No']} onChange={v => update('phoneService', v)} />
          <SelectField label="Multiple Lines" value={form.multipleLines} options={['Yes', 'No', 'No phone service']} onChange={v => update('multipleLines', v)} />
          <SelectField label="Internet Service" value={form.internetService} options={['DSL', 'Fiber optic', 'No']} onChange={v => update('internetService', v)} />
          <SelectField label="Online Security" value={form.onlineSecurity} options={['Yes', 'No', 'No internet service']} onChange={v => update('onlineSecurity', v)} />
          <SelectField label="Online Backup" value={form.onlineBackup} options={['Yes', 'No', 'No internet service']} onChange={v => update('onlineBackup', v)} />
          <SelectField label="Device Protection" value={form.deviceProtection} options={['Yes', 'No', 'No internet service']} onChange={v => update('deviceProtection', v)} />
          <SelectField label="Tech Support" value={form.techSupport} options={['Yes', 'No', 'No internet service']} onChange={v => update('techSupport', v)} />
          <SelectField label="Streaming TV" value={form.streamingTV} options={['Yes', 'No', 'No internet service']} onChange={v => update('streamingTV', v)} />
          <SelectField label="Streaming Movies" value={form.streamingMovies} options={['Yes', 'No', 'No internet service']} onChange={v => update('streamingMovies', v)} />
        </div>

        {/* ── 03 Account ── */}
        <SectionHead n="03" title="Account Variables" />
        <div className="form-grid" style={{ marginBottom: '28px' }}>
          <div className="form-group">
            <label className="form-label">
              Tenure- <strong style={{ color: 'var(--text-main)' }}>{form.tenure} months</strong>
            </label>
            <div className="form-range-container">
              <input type="range" className="form-range" min="0" max="72"
                value={form.tenure} onChange={e => update('tenure', parseInt(e.target.value))} />
            </div>
          </div>
          <SelectField label="Contract" value={form.contract} options={['Month-to-month', 'One year', 'Two year']} onChange={v => update('contract', v)} />
          <SelectField label="Paperless Billing" value={form.paperlessBilling} options={['Yes', 'No']} onChange={v => update('paperlessBilling', v)} />
          <SelectField label="Payment Method" value={form.paymentMethod} options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} onChange={v => update('paymentMethod', v)} />
          <div className="form-group">
            <label className="form-label">Monthly Charges ($)</label>
            <input type="number" className="form-input" min="0" max="150" step="0.05"
              value={form.monthlyCharges} onChange={e => update('monthlyCharges', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Total Charges ($)</label>
            <input type="number" className="form-input" min="0" max="10000" step="0.05"
              value={form.totalCharges} onChange={e => update('totalCharges', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={predict} disabled={loading}>
            {loading ? 'Processing...' : 'Run Inference'}
          </button>
          <button className="btn btn-ghost" onClick={() => { setForm(DEFAULT_STATE); setResult(null); setError(null) }}>
            Reset
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ marginTop: '16px', padding: '11px 14px', border: '1px solid var(--color-churn)', color: 'var(--color-churn)', fontSize: '0.85rem' }}>
            Error: {error}
          </div>
        )}

        {/* ── Result card ── */}
        {result && <PredictionResult result={result} form={form} />}
      </div>
    </div>
  )
}
