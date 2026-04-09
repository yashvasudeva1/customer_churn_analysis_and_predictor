import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ModelMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/metrics`)
      .then(r => r.json())
      .then(d => { setMetrics(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-wrapper">
      <p>Loading metrics...</p>
    </div>
  )

  if (!metrics) return <p>Failed to load metrics.</p>

  const comparisonData = ['accuracy', 'precision', 'recall', 'f1_score', 'roc_auc'].map(metric => ({
    name: metric.toUpperCase().replace('_', ' '),
    Train: metrics.train[metric],
    Test: metrics.test[metric]
  }))

  const radarData = comparisonData.map(d => ({
    metric: d.name,
    Train: d.Train,
    Test: d.Test,
    fullMark: 100,
  }))

  const trainCM = metrics.train.confusion_matrix
  const testCM = metrics.test.confusion_matrix

  // Format feature importance to percentage
  const featureImp = metrics.feature_importance.slice(0, 12).map(f => ({
    ...f,
    importanceText: (f.importance * 100).toFixed(1) + '%'
  }))

  const cross_validation = metrics.cross_validation

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Model Performance</h1>
        <p>
          XGBoost classifier trained with SMOTE oversampling and regularization for generalization.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="label-caps">Total Samples</div>
          <div className="stat-value">{(trainCM[0][0]+trainCM[0][1]+trainCM[1][0]+trainCM[1][1]+testCM[0][0]+testCM[0][1]+testCM[1][0]+testCM[1][1]).toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="label-caps">Training Samples</div>
          <div className="stat-value">{(trainCM[0][0]+trainCM[0][1]+trainCM[1][0]+trainCM[1][1]).toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="label-caps">Test Samples</div>
          <div className="stat-value">{(testCM[0][0]+testCM[0][1]+testCM[1][0]+testCM[1][1]).toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="label-caps" style={{color: 'var(--accent-primary)'}}>CV F1 Score</div>
          <div className="stat-value" style={{color: 'var(--accent-primary)'}}>{(cross_validation.mean_f1).toFixed(2)}%</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="chart-panel">
          <div className="panel-header">
            <h2 className="panel-title" style={{fontSize: '1.25rem'}}>Train vs Test Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-strong)', borderRadius: '4px' }}
                itemStyle={{ color: 'var(--text-main)' }}
                formatter={(value) => value.toFixed(1) + '%'}
              />
              <Legend />
              <Bar dataKey="Train" fill="var(--text-faint)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Test" fill="var(--color-stay)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <div className="panel-header">
            <h2 className="panel-title" style={{fontSize: '1.25rem'}}>Performance Radar</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="var(--border-muted)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-faint)' }} />
              <Radar name="Train" dataKey="Train" stroke="var(--text-faint)" fill="var(--text-faint)" fillOpacity={0.1} />
              <Radar name="Test" dataKey="Test" stroke="var(--color-stay)" fill="var(--color-stay)" fillOpacity={0.4} />
              <Legend />
              <Tooltip formatter={(value) => value.toFixed(1) + '%'} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Detailed Metrics Analysis</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Train</th>
                  <th>Test</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((d) => {
                  const gap = d.Train - d.Test;
                  const isGood = gap < 5;
                  const isWarn = gap >= 5 && gap < 10;
                  return (
                    <tr key={d.name}>
                      <td className="metric-highlight">{d.name}</td>
                      <td>{d.Train.toFixed(2)}%</td>
                      <td>{d.Test.toFixed(2)}%</td>
                      <td className={isGood ? 'status-good' : isWarn ? 'status-warn' : 'status-bad'}>
                        {gap.toFixed(2)}%
                      </td>
                      <td>
                        {isGood ? 'Good' : isWarn ? 'Acceptable' : 'Overfit'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Top Feature Importance</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={featureImp} layout="vertical" margin={{ left: 50, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="feature" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-strong)' }}
                formatter={(value) => (value * 100).toFixed(2) + '%'}
              />
              <Bar dataKey="importance" fill="var(--accent-primary)" radius={[0, 2, 2, 0]}>
                {featureImp.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={'var(--accent-primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Confusion Matrices</h2>
        </div>
        <div className="grid-2">
          {/* TRAIN */}
          <div>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-muted)' }}>Training Set</h3>
            <div className="table-wrapper">
              <table className="data-table" style={{ textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Pred: Stay</th>
                    <th>Pred: Churn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>Actual: Stay</td>
                    <td style={{ background: 'rgba(16, 185, 129, 0.2)', fontWeight: 'bold' }}>{trainCM[0][0]} (TN)</td>
                    <td style={{ background: 'var(--accent-primary-dim)' }}>{trainCM[0][1]} (FP)</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>Actual: Churn</td>
                    <td style={{ background: 'var(--accent-primary-dim)' }}>{trainCM[1][0]} (FN)</td>
                    <td style={{ background: 'rgba(16, 185, 129, 0.2)', fontWeight: 'bold' }}>{trainCM[1][1]} (TP)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* TEST */}
          <div>
            <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-muted)' }}>Testing Set</h3>
            <div className="table-wrapper">
              <table className="data-table" style={{ textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Pred: Stay</th>
                    <th>Pred: Churn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>Actual: Stay</td>
                    <td style={{ background: 'rgba(16, 185, 129, 0.2)', fontWeight: 'bold' }}>{testCM[0][0]} (TN)</td>
                    <td style={{ background: 'var(--accent-primary-dim)' }}>{testCM[0][1]} (FP)</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'left', fontWeight: '500' }}>Actual: Churn</td>
                    <td style={{ background: 'var(--accent-primary-dim)' }}>{testCM[1][0]} (FN)</td>
                    <td style={{ background: 'rgba(16, 185, 129, 0.2)', fontWeight: 'bold' }}>{testCM[1][1]} (TP)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
