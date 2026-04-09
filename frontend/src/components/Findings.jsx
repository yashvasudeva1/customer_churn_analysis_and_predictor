import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Findings() {
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
    </div>
  )
}
