"""
Customer Churn Model Training Script
=====================================
Trains an XGBoost model with proper preprocessing, class imbalance handling,
and saves both the model and comprehensive train/test metrics.
"""

import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from xgboost import XGBClassifier

# ─── Config ───
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "WA_Fn-UseC_-Telco-Customer-Churn.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "churn_model.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model_metrics.json")
RANDOM_STATE = 42

def load_and_preprocess():
    """Load dataset and perform initial preprocessing."""
    df = pd.read_csv(DATA_PATH)

    # Drop customerID- not a feature
    df = df.drop("customerID", axis=1)

    # Fix TotalCharges: convert to numeric, fill missing with 0
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(0)

    # Encode target
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    return df

def get_feature_columns(df):
    """Identify numeric and categorical feature columns."""
    X = df.drop("Churn", axis=1)
    y = df["Churn"]

    numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_features = X.select_dtypes(include=["object"]).columns.tolist()

    return X, y, numeric_features, categorical_features

def build_preprocessor(numeric_features, categorical_features):
    """Build the column transformer for preprocessing."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(drop="first", handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    return preprocessor

def compute_metrics(y_true, y_pred, y_prob):
    """Compute all classification metrics."""
    return {
        "accuracy": round(accuracy_score(y_true, y_pred) * 100, 2),
        "precision": round(precision_score(y_true, y_pred) * 100, 2),
        "recall": round(recall_score(y_true, y_pred) * 100, 2),
        "f1_score": round(f1_score(y_true, y_pred) * 100, 2),
        "roc_auc": round(roc_auc_score(y_true, y_prob) * 100, 2),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "classification_report": classification_report(y_true, y_pred, output_dict=True)
    }

def train():
    """Main training pipeline."""
    print("=" * 60)
    print("CUSTOMER CHURN MODEL TRAINING")
    print("=" * 60)

    # 1. Load and preprocess
    print("\n[1/6] Loading dataset...")
    df = load_and_preprocess()
    X, y, numeric_features, categorical_features = get_feature_columns(df)
    print(f"  Dataset shape: {df.shape}")
    print(f"  Class distribution: {dict(y.value_counts())}")
    print(f"  Numeric features ({len(numeric_features)}): {numeric_features}")
    print(f"  Categorical features ({len(categorical_features)}): {categorical_features}")

    # 2. Train/Test split (stratified)
    print("\n[2/6] Splitting data (80/20 stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Train: {X_train.shape[0]} samples")
    print(f"  Test:  {X_test.shape[0]} samples")

    # 3. Build preprocessor
    print("\n[3/6] Building preprocessor...")
    preprocessor = build_preprocessor(numeric_features, categorical_features)

    # 4. Preprocess data
    print("\n[4/6] Preprocessing and applying SMOTE...")
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # Apply SMOTE to handle class imbalance (only on training data)
    smote = SMOTE(random_state=RANDOM_STATE)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_processed, y_train)
    print(f"  After SMOTE - Train: {X_train_resampled.shape[0]} samples")
    print(f"  Class distribution after SMOTE: {dict(pd.Series(y_train_resampled).value_counts())}")

    # 5. Train XGBoost with regularization
    print("\n[5/6] Training XGBoost with regularization...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,               # Shallow trees to prevent overfitting
        min_child_weight=5,        # Minimum samples per leaf
        subsample=0.8,             # Row sampling
        colsample_bytree=0.8,     # Column sampling
        reg_alpha=0.1,             # L1 regularization
        reg_lambda=1.0,            # L2 regularization
        learning_rate=0.05,        # Slow learning rate
        scale_pos_weight=1,        # Already handled by SMOTE
        random_state=RANDOM_STATE,
        eval_metric="logloss"
    )

    model.fit(
        X_train_resampled, y_train_resampled,
        eval_set=[(X_test_processed, y_test)],
        verbose=False
    )

    # 6. Evaluate
    print("\n[6/6] Evaluating model...")

    # Train metrics
    y_train_pred = model.predict(X_train_processed)
    y_train_prob = model.predict_proba(X_train_processed)[:, 1]
    train_metrics = compute_metrics(y_train, y_train_pred, y_train_prob)

    # Test metrics
    y_test_pred = model.predict(X_test_processed)
    y_test_prob = model.predict_proba(X_test_processed)[:, 1]
    test_metrics = compute_metrics(y_test, y_test_pred, y_test_prob)

    # Cross-validation on training data
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(model, X_train_resampled, y_train_resampled, cv=cv, scoring='f1')
    cv_metrics = {
        "mean_f1": round(cv_scores.mean() * 100, 2),
        "std_f1": round(cv_scores.std() * 100, 2),
        "fold_scores": [round(s * 100, 2) for s in cv_scores]
    }

    # Feature importance
    feature_names = numeric_features.copy()
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_names = cat_encoder.get_feature_names_out(categorical_features).tolist()
    feature_names.extend(encoded_cat_names)

    importance = model.feature_importances_
    feature_importance = sorted(
        zip(feature_names, importance.tolist()),
        key=lambda x: x[1], reverse=True
    )
    feature_importance_dict = [{"feature": f, "importance": round(i, 4)} for f, i in feature_importance]

    # Print results
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"\n{'Metric':<20} {'Train':>10} {'Test':>10} {'Gap':>10}")
    print("-" * 50)
    for metric in ["accuracy", "precision", "recall", "f1_score", "roc_auc"]:
        gap = train_metrics[metric] - test_metrics[metric]
        print(f"{metric:<20} {train_metrics[metric]:>9.2f}% {test_metrics[metric]:>9.2f}% {gap:>+9.2f}%")

    print(f"\nCross-Validation F1: {cv_metrics['mean_f1']:.2f}% ± {cv_metrics['std_f1']:.2f}%")

    # Check generalization
    accuracy_gap = train_metrics["accuracy"] - test_metrics["accuracy"]
    f1_gap = train_metrics["f1_score"] - test_metrics["f1_score"]
    if accuracy_gap < 5 and f1_gap < 5:
        print("\n[OK] Model is well-generalized (gaps < 5%)")
    else:
        print(f"\n[WARNING] Potential overfitting (accuracy gap: {accuracy_gap:.2f}%, f1 gap: {f1_gap:.2f}%)")

    # Save everything
    print("\nTop 10 Important Features:")
    for item in feature_importance_dict[:10]:
        print(f"  {item['feature']}: {item['importance']}")

    # Build final pipeline for prediction
    full_pipeline = {
        "preprocessor": preprocessor,
        "model": model,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features
    }

    joblib.dump(full_pipeline, MODEL_PATH)
    print(f"\n[OK] Model saved to {MODEL_PATH}")

    # Save metrics
    all_metrics = {
        "train": train_metrics,
        "test": test_metrics,
        "cross_validation": cv_metrics,
        "feature_importance": feature_importance_dict,
        "dataset_info": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "num_features": len(numeric_features),
            "cat_features": len(categorical_features),
            "churn_rate": round(y.mean() * 100, 2)
        }
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"[OK] Metrics saved to {METRICS_PATH}")

    return all_metrics

if __name__ == "__main__":
    train()
