"""
Flask Backend Server for Customer Churn Analysis
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from scipy import stats

app = Flask(__name__)
CORS(app)

# ─── Load model and metrics ───
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "..", "WA_Fn-UseC_-Telco-Customer-Churn.csv")

pipeline = joblib.load(os.path.join(BASE_DIR, "churn_model.pkl"))
preprocessor = pipeline["preprocessor"]
model = pipeline["model"]
NUMERIC_FEATURES = pipeline["numeric_features"]
CATEGORICAL_FEATURES = pipeline["categorical_features"]

with open(os.path.join(BASE_DIR, "model_metrics.json"), "r") as f:
    MODEL_METRICS = json.load(f)


def load_dataset():
    df = pd.read_csv(DATA_PATH)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(0)
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})
    return df


# ══════════════════════════════════════════
# API Endpoints
# ══════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/predict", methods=["POST"])
def predict():
    """Predict churn for a single customer."""
    try:
        data = request.json
        input_df = pd.DataFrame([{
            "gender": data["gender"],
            "SeniorCitizen": int(data["seniorCitizen"]),
            "Partner": data["partner"],
            "Dependents": data["dependents"],
            "tenure": int(data["tenure"]),
            "PhoneService": data["phoneService"],
            "MultipleLines": data["multipleLines"],
            "InternetService": data["internetService"],
            "OnlineSecurity": data["onlineSecurity"],
            "OnlineBackup": data["onlineBackup"],
            "DeviceProtection": data["deviceProtection"],
            "TechSupport": data["techSupport"],
            "StreamingTV": data["streamingTV"],
            "StreamingMovies": data["streamingMovies"],
            "Contract": data["contract"],
            "PaperlessBilling": data["paperlessBilling"],
            "PaymentMethod": data["paymentMethod"],
            "MonthlyCharges": float(data["monthlyCharges"]),
            "TotalCharges": float(data["totalCharges"])
        }])

        X_processed = preprocessor.transform(input_df)
        prediction = int(model.predict(X_processed)[0])
        probability = float(model.predict_proba(X_processed)[0][1])

        return jsonify({
            "prediction": prediction,
            "churn_probability": round(probability, 4),
            "label": "Churn" if prediction == 1 else "Stay"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """Return train vs test metrics."""
    return jsonify(MODEL_METRICS)


@app.route("/api/data/overview", methods=["GET"])
def data_overview():
    """Return dataset overview statistics."""
    df = load_dataset()

    # --- Statistical Tests ---
    churned = df[df["Churn"] == 1]
    stayed  = df[df["Churn"] == 0]

    # KS test: tenure
    ks_tenure_stat, ks_tenure_p = stats.ks_2samp(churned["tenure"], stayed["tenure"])
    # KS test: MonthlyCharges
    ks_charges_stat, ks_charges_p = stats.ks_2samp(churned["MonthlyCharges"], stayed["MonthlyCharges"])
    # Chi2: Contract
    ct_contract = pd.crosstab(df["Contract"], df["Churn"])
    chi2_contract, p_contract, _, _ = stats.chi2_contingency(ct_contract)
    # Chi2: InternetService
    ct_internet = pd.crosstab(df["InternetService"], df["Churn"])
    chi2_internet, p_internet, _, _ = stats.chi2_contingency(ct_internet)

    statistics = {
        "ks_tenure":     {"stat": round(float(ks_tenure_stat), 4),  "p_value": float(ks_tenure_p),  "significant": bool(ks_tenure_p  < 0.05)},
        "ks_charges":    {"stat": round(float(ks_charges_stat), 4), "p_value": float(ks_charges_p), "significant": bool(ks_charges_p < 0.05)},
        "chi2_contract": {"stat": round(float(chi2_contract), 4),   "p_value": float(p_contract),   "significant": bool(p_contract   < 0.05)},
        "chi2_internet": {"stat": round(float(chi2_internet), 4),   "p_value": float(p_internet),   "significant": bool(p_internet   < 0.05)},
    }

    overview = {
        "shape": {"rows": df.shape[0], "cols": df.shape[1]},
        "churn_distribution": {
            "no_churn": int((df["Churn"] == 0).sum()),
            "churn":    int((df["Churn"] == 1).sum()),
            "churn_rate": round(df["Churn"].mean() * 100, 2)
        },
        "numerical_stats": json.loads(df.describe().to_json()),
        "column_info": [
            {
                "name": col,
                "dtype": str(df[col].dtype),
                "nunique": int(df[col].nunique()),
                "null_count": int(df[col].isnull().sum())
            }
            for col in df.columns
        ],
        "sample_data": json.loads(df.head(10).to_json(orient="records")),
        "statistics": statistics,
    }
    return jsonify(overview)


@app.route("/api/data/visualizations", methods=["GET"])
def visualizations():
    """Return data for charts and visualizations."""
    df = load_dataset()

    # 1. Churn by Contract Type
    contract_churn = df.groupby(["Contract", "Churn"]).size().unstack(fill_value=0)
    contract_data = []
    for contract_type in contract_churn.index:
        contract_data.append({
            "contract": contract_type,
            "stayed": int(contract_churn.loc[contract_type, 0]),
            "churned": int(contract_churn.loc[contract_type, 1])
        })

    # 2. Churn by Internet Service
    internet_churn = df.groupby(["InternetService", "Churn"]).size().unstack(fill_value=0)
    internet_data = []
    for svc in internet_churn.index:
        internet_data.append({
            "service": svc,
            "stayed": int(internet_churn.loc[svc, 0]),
            "churned": int(internet_churn.loc[svc, 1])
        })

    # 3. Monthly Charges distribution by Churn
    charges_data = {
        "churned": df[df["Churn"] == 1]["MonthlyCharges"].describe().to_dict(),
        "stayed": df[df["Churn"] == 0]["MonthlyCharges"].describe().to_dict()
    }
    # Convert numpy types
    for k in charges_data:
        charges_data[k] = {kk: float(vv) for kk, vv in charges_data[k].items()}

    # 4. Tenure distribution  
    tenure_bins = [0, 12, 24, 36, 48, 60, 72]
    labels = ["0-12", "13-24", "25-36", "37-48", "49-60", "61-72"]
    df["tenure_bin"] = pd.cut(df["tenure"], bins=tenure_bins, labels=labels, include_lowest=True)
    tenure_churn = df.groupby(["tenure_bin", "Churn"]).size().unstack(fill_value=0)
    tenure_data = []
    for tb in labels:
        if tb in tenure_churn.index:
            tenure_data.append({
                "tenure": tb,
                "stayed": int(tenure_churn.loc[tb, 0]),
                "churned": int(tenure_churn.loc[tb, 1])
            })

    # 5. Payment Method churn
    payment_churn = df.groupby(["PaymentMethod", "Churn"]).size().unstack(fill_value=0)
    payment_data = []
    for pm in payment_churn.index:
        payment_data.append({
            "method": pm,
            "stayed": int(payment_churn.loc[pm, 0]),
            "churned": int(payment_churn.loc[pm, 1])
        })

    # 6. Monthly charges histogram buckets
    mc_bins = list(range(0, 130, 10))
    mc_labels = [f"${b}-{b+10}" for b in mc_bins[:-1]]
    df["mc_bin"] = pd.cut(df["MonthlyCharges"], bins=mc_bins, labels=mc_labels, include_lowest=True)
    mc_churn = df.groupby(["mc_bin", "Churn"]).size().unstack(fill_value=0)
    mc_data = []
    for label in mc_labels:
        if label in mc_churn.index:
            mc_data.append({
                "range": label,
                "stayed": int(mc_churn.loc[label, 0]),
                "churned": int(mc_churn.loc[label, 1])
            })

    # 7. Churn by Tech Support
    tech_churn = df.groupby(["TechSupport", "Churn"]).size().unstack(fill_value=0)
    tech_data = []
    for t in tech_churn.index:
        tech_data.append({
            "techSupport": t,
            "stayed": int(tech_churn.loc[t, 0]),
            "churned": int(tech_churn.loc[t, 1])
        })

    # 8. Gender distribution
    gender_churn = df.groupby(["gender", "Churn"]).size().unstack(fill_value=0)
    gender_data = []
    for g in gender_churn.index:
        gender_data.append({
            "gender": g,
            "stayed": int(gender_churn.loc[g, 0]),
            "churned": int(gender_churn.loc[g, 1])
        })

    # 9. Senior Citizen
    senior_churn = df.groupby(["SeniorCitizen", "Churn"]).size().unstack(fill_value=0)
    senior_data = []
    for s in senior_churn.index:
        senior_data.append({
            "senior": "Yes" if s == 1 else "No",
            "stayed": int(senior_churn.loc[s, 0]),
            "churned": int(senior_churn.loc[s, 1])
        })

    return jsonify({
        "contract_churn": contract_data,
        "internet_churn": internet_data,
        "monthly_charges": charges_data,
        "tenure_churn": tenure_data,
        "payment_churn": payment_data,
        "monthly_charges_hist": mc_data,
        "tech_support_churn": tech_data,
        "gender_churn": gender_data,
        "senior_citizen_churn": senior_data
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Customer Churn API server on port {port}")
    app.run(host="0.0.0.0", port=port)
