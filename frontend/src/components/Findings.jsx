import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Findings() {
  const [data, setData] = useState(null)
  const [abTest, setAbTest] = useState(null)
  const [cohortData, setCohortData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/data/overview`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API}/ab_test`)
      .then(r => r.json())
      .then(d => setAbTest(d))
      .catch(e => console.error(e))
  }, [])

  useEffect(() => {
    fetch(`${API}/cohort`)
      .then(r => r.json())
      .then(d => setCohortData(d))
      .catch(e => console.error(e))
  }, [])

  if (loading) return (
    <div className="loading-wrapper">
      <p>Loading findings...</p>
    </div>
  )

  if (!data) return <p>Failed to load data.</p>

  const { statistics } = data

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Key Findings</h1>
        <p>Statistical analysis and significant drivers of customer churn.</p>
      </div>

      <div className="grid-2">
        <div>
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Statistical Significance</h2>
              <span className="tag">p &lt; 0.05</span>
            </div>
            
            <div className="finding-block">
              <div className="label-caps" style={{color: 'var(--accent-primary)', marginBottom: '4px'}}>Finding 01</div>
              <h3 className="finding-title">Tenure Impact (K-S Test)</h3>
              <p className="finding-desc">
                {statistics.ks_tenure.significant 
                  ? `Significant difference in tenure between churned and retained customers (p=${statistics.ks_tenure.p_value.toExponential(2)}). `
                  : 'No significant difference in tenure. '}
                Newer customers are at a much higher risk of leaving.
              </p>
            </div>

            <div className="finding-block">
              <div className="label-caps" style={{color: 'var(--accent-primary)', marginBottom: '4px'}}>Finding 02</div>
              <h3 className="finding-title">Monthly Charges (K-S Test)</h3>
              <p className="finding-desc">
                {statistics.ks_charges.significant 
                  ? `Significant difference in monthly charges (p=${statistics.ks_charges.p_value.toExponential(2)}). `
                  : 'No significant difference in charges. '}
                Customers paying higher monthly fees are more likely to churn.
              </p>
            </div>

            <div className="finding-block">
              <div className="label-caps" style={{color: 'var(--accent-primary)', marginBottom: '4px'}}>Finding 03</div>
              <h3 className="finding-title">Contract Type (Chi-Square)</h3>
              <p className="finding-desc">
                {statistics.chi2_contract.significant 
                  ? `Strong correlation between contract type and churn (p=${statistics.chi2_contract.p_value.toExponential(2)}). `
                  : 'No significant correlation. '}
                Month-to-month contracts lack lock-in, leading to higher attrition.
              </p>
            </div>

            <div className="finding-block">
              <div className="label-caps" style={{color: 'var(--accent-primary)', marginBottom: '4px'}}>Finding 04</div>
              <h3 className="finding-title">Internet Service (Chi-Square)</h3>
              <p className="finding-desc">
                {statistics.chi2_internet.significant 
                  ? `Service type significantly affects churn (p=${statistics.chi2_internet.p_value.toExponential(2)}). `
                  : 'No significant correlation. '}
                Fiber optic users churn at highest rates, possibly due to higher costs or performance issues.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)' }}>
            <div className="panel-header">
              <h2 className="panel-title" style={{color: 'var(--accent-primary)'}}>High-Risk Customer Profile</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Based on the analysis, a customer is most likely to churn if they match this profile:
            </p>
            <ul className="bullet-list">
              <li><strong>Tenure:</strong> Less than 12 months (New customer)</li>
              <li><strong>Contract:</strong> Month-to-month (No lock-in)</li>
              <li><strong>Internet:</strong> Fiber Optic (High cost)</li>
              <li><strong>Payment:</strong> Electronic Check</li>
              <li><strong>Support:</strong> No Tech Support or Online Security</li>
            </ul>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Recommended Business Actions</h2>
            </div>
            <ul className="bullet-list" style={{ marginTop: '16px' }}>
              <li><strong>Incentivize Annual Contracts:</strong> Offer discounts or added benefits for customers switching from month-to-month to 1-year or 2-year contracts.</li>
              <li><strong>Targeted Onboarding:</strong> Implement a strong 90-day onboarding program, as new customers have the highest attrition rate.</li>
              <li><strong>Promote Tech Support:</strong> Bundle basic tech support and online security for free or at a deep discount for the first 6 months.</li>
              <li><strong>Review Fiber Optic Pricing:</strong> Investigate if the churn in Fiber Optic users is due to price sensitivity versus competitors or service reliability issues.</li>
              <li><strong>Push Autopay:</strong> Encourage users to move away from strictly manual "Electronic checks" to automatic bank transfers or credit cards.</li>
            </ul>
          </div>
        </div>
      </div>

      {abTest && !abTest.error && (
        <div className="panel" style={{marginTop: '24px'}}>
          <div className="panel-header">
            <h2 className="panel-title">A/B Test: Pricing Segment Churn Analysis</h2>
            <span className="tag">Hypothesis Test</span>
          </div>
          <div className="grid-2" style={{marginBottom: '16px'}}>
            <div style={{border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '8px'}}>
              <h3 style={{marginBottom: '12px'}}>{abTest.group_a.label}</h3>
              <div>N: {abTest.group_a.n}</div>
              <div>Churned: {abTest.group_a.churned}</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-stay)', marginTop: '8px'}}>{abTest.group_a.churn_rate}% Churn Rate</div>
            </div>
            <div style={{border: '1px solid var(--border-muted)', padding: '16px', borderRadius: '8px'}}>
              <h3 style={{marginBottom: '12px'}}>{abTest.group_b.label}</h3>
              <div>N: {abTest.group_b.n}</div>
              <div>Churned: {abTest.group_b.churned}</div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-churn)', marginTop: '8px'}}>{abTest.group_b.churn_rate}% Churn Rate</div>
            </div>
          </div>
          <div style={{display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center'}}>
             <div style={{background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '4px'}}>
               <strong>z-statistic:</strong> {abTest.z_stat?.toFixed(2)}
             </div>
             <div style={{background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: '4px'}}>
               <strong>p-value:</strong> {abTest.p_value < 0.001 ? '< 0.001' : abTest.p_value?.toExponential(2)}
             </div>
          </div>
          <p style={{marginBottom: '24px'}}>{abTest.interpretation}</p>
          
          <div style={{display: 'flex', height: '32px', borderRadius: '4px', overflow: 'hidden'}}>
            <div style={{width: `${abTest.group_a.churn_rate}%`, background: 'var(--color-stay)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden'}}>
              Group A {abTest.group_a.churn_rate}%
            </div>
            <div style={{width: `${abTest.group_b.churn_rate}%`, background: 'var(--color-churn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden'}}>
              Group B {abTest.group_b.churn_rate}%
            </div>
          </div>
        </div>
      )}

      {cohortData && !cohortData.error && cohortData.cohorts && (
        <div className="panel" style={{marginTop: '24px'}}>
          <div className="panel-header">
            <h2 className="panel-title">Cohort Retention Analysis</h2>
            <span className="tag">Time-Series</span>
          </div>
          <div style={{height: '280px', marginBottom: '24px', width: '100%'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData.cohorts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="churn_rate" name="Churn Rate (%)" fill="var(--color-churn)" />
                <Bar dataKey="retention_rate" name="Retention Rate (%)" fill="var(--color-stay)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Total Customers</th>
                  <th>Churned</th>
                  <th>Churn Rate</th>
                  <th>Retention Rate</th>
                  <th>Avg CLV</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.cohorts.map(c => (
                  <tr key={c.label}>
                    <td className="metric-highlight">{c.label}</td>
                    <td>{c.total.toLocaleString()}</td>
                    <td>{c.churned.toLocaleString()}</td>
                    <td>
                      <span className={c.churn_rate > 40 ? 'status-bad font-semibold' : c.churn_rate >= 20 ? 'status-warn font-semibold' : 'status-good font-semibold'}>
                        {c.churn_rate}%
                      </span>
                    </td>
                    <td>{c.retention_rate}%</td>
                    <td>${c.avg_clv.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
