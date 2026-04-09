# Customer Churn Analysis   & Prediction

This project analyzes customer data to understand and predict churn- identifying customers who are likely to discontinue a service. By uncovering key behavioral and demographic factors behind churn, this analysis helps businesses make data-driven retention decisions.

## Features

- **Interactive Dashboard**: Explore customer data with visualizations and statistics.
- **Model Evaluation**: Comprehensive metrics for model performance.
- **Churn Prediction**: Predict churn probability for individual customers.
- **Data Explorer**: Deep dive into dataset characteristics and column information.
- **Key Findings**: Statistical significance and business insights.

## Tech Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Flask, Python
- **Machine Learning**: XGBoost, Scikit-learn
- **Data Processing**: Pandas, NumPy

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Customer-Churn-Analysis-
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend**
   ```bash
   cd backend
   python server.py
   ```
   The backend will start on `http://localhost:5000`.

2. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

3. **Access the Dashboard**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
Customer-Churn-Analysis-
├── backend/                # Flask backend application
│   ├── server.py           # API endpoints
│   ├── train_model.py      # Model training script
│   ├── churn_model.pkl     # Trained XGBoost model
│   └── model_metrics.json  # Model evaluation metrics
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main application component
│   │   └── index.css       # Styles
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── WA_Fn-UseC_-Telco-Customer-Churn.csv  # Dataset
└── requirements.txt        # Backend dependencies
```

## Model Details

- **Algorithm**: XGBoost Classifier
- **Target Variable**: Churn (Yes/No)
- **Key Features**: Tenure, Monthly Charges, Contract Type, Internet Service
- **Evaluation Metrics**: Accuracy, Precision, Recall, F1-Score, ROC-AUC
