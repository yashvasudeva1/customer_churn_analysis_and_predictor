import { useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Overview from './components/Overview'
import DataExplorer from './components/DataExplorer'
import Visualizations from './components/Visualizations'
import Findings from './components/Findings'
import Prediction from './components/Prediction'
import ModelMetrics from './components/ModelMetrics'
import { LayoutDashboard, Database, PieChart, Lightbulb, Target, Activity } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'viz', label: 'Visualizations', icon: PieChart },
  { id: 'findings', label: 'Findings', icon: Lightbulb },
  { id: 'metrics', label: 'Metrics', icon: Target },
  { id: 'predict', label: 'Predict', icon: Activity },
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <Overview />
      case 'data': return <DataExplorer />
      case 'viz': return <Visualizations />
      case 'findings': return <Findings />
      case 'metrics': return <ModelMetrics />
      case 'predict': return <Prediction />
      default: return <Overview />
    }
  }

  return (
    <div className="app-layout">
      <Navbar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderTab()}
      </main>
    </div>
  )
}

export default App
