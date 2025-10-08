"""
Train production-ready XGBoost model on PhiUSIIL dataset
This is the FINAL training script for deployment
"""

import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    precision_recall_fscore_support, roc_auc_score
)
import joblib
import json
import numpy as np

print("="*70)
print("Training Production Phishing Detection Model")
print("="*70)

# Load PhiUSIIL dataset
print("\n1. Loading dataset...")
df = pd.read_csv('PhiUSIIL_Phishing_URL_Dataset.csv')

print(f"   Dataset shape: {df.shape}")
print(f"   Label distribution:\n{df['label'].value_counts()}")

# Drop rows with missing labels
df = df.dropna(subset=['label'])

# Prepare features
print("\n2. Preparing features...")
columns_to_drop = ['label', 'URL', 'Domain', 'TLD', 'Title']
existing_drop_cols = [col for col in columns_to_drop if col in df.columns]

X = df.drop(existing_drop_cols, axis=1)
X = X.fillna(0)  # Fill any remaining NaNs
y = df['label'].astype(int)

print(f"   Features: {X.shape[1]}")
print(f"   Sample features: {list(X.columns[:10])}")

# Split data (80/20)
print("\n3. Splitting data (80% train, 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"   Training samples: {len(X_train):,}")
print(f"   Testing samples: {len(X_test):,}")

# Train XGBoost with optimized parameters
print("\n4. Training XGBoost model...")
model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='logloss',
    n_jobs=-1,
    use_label_encoder=False
)

print("   Fitting model (this may take 2-3 minutes)...")
model.fit(X_train, y_train, verbose=False)

# Evaluate on test set
print("\n5. Evaluating model...")
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
auc_score = roc_auc_score(y_test, y_pred_proba[:, 1])

print(f"\n   ✅ Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"   ✅ Precision: {precision:.4f}")
print(f"   ✅ Recall:    {recall:.4f}")
print(f"   ✅ F1-Score:  {f1:.4f}")
print(f"   ✅ ROC-AUC:   {auc_score:.4f}")

print("\n   Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))

print("\n   Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print(cm)
print(f"\n   True Negatives (Legitimate ✓):  {cm[0][0]:,}")
print(f"   False Positives (False alarm):   {cm[0][1]:,}")
print(f"   False Negatives (Missed phish):  {cm[1][0]:,}")
print(f"   True Positives (Phishing ✓):     {cm[1][1]:,}")

# Feature importance
print("\n6. Analyzing feature importance...")
feature_importance = model.feature_importances_
top_features = sorted(
    zip(X.columns, feature_importance),
    key=lambda x: x[1],
    reverse=True
)[:15]

print("\n   Top 15 Most Important Features:")
for i, (feat, imp) in enumerate(top_features, 1):
    print(f"   {i:2d}. {feat:30s} {imp:.4f}")

# Cross-validation (optional but recommended)
print("\n7. Running 5-fold cross-validation...")
cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy', n_jobs=-1)
print(f"   CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# Save model
print("\n8. Saving model files...")
joblib.dump(model, '../ml-model/phishing_model.pkl')
print("   ✅ Model saved: ../ml-model/phishing_model.pkl")

# Save feature names
feature_names = list(X.columns)
with open('../ml-model/feature_names.json', 'w') as f:
    json.dump(feature_names, f, indent=2)
print("   ✅ Features saved: ../ml-model/feature_names.json")

# Save model info
model_info = {
    'model_type': 'XGBoost',
    'version': '2.0.0',
    'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
    'dataset': 'PhiUSIIL',
    'total_samples': len(df),
    'training_samples': len(X_train),
    'testing_samples': len(X_test),
    'n_features': len(feature_names),
    'feature_names': feature_names,
    'top_features': [f[0] for f in top_features],
    'metrics': {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'roc_auc': float(auc_score)
    },
    'confusion_matrix': {
        'true_negatives': int(cm[0][0]),
        'false_positives': int(cm[0][1]),
        'false_negatives': int(cm[1][0]),
        'true_positives': int(cm[1][1])
    },
    'parameters': {
        'n_estimators': 100,
        'max_depth': 6,
        'learning_rate': 0.1
    }
}

with open('../ml-model/model_info.json', 'w') as f:
    json.dump(model_info, f, indent=2)
print("   ✅ Model info saved: ../ml-model/model_info.json")

print("\n" + "="*70)
print("✅ Training Complete!")
print("="*70)
print(f"\nModel Performance Summary:")
print(f"  • Accuracy:  {accuracy*100:.2f}%")
print(f"  • Precision: {precision*100:.2f}%")
print(f"  • Recall:    {recall*100:.2f}%")
print(f"  • F1-Score:  {f1*100:.2f}%")
print(f"\nModel is ready for deployment!")
print("Copy files to ml-model/ folder and build Docker image.")
