#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Travel Tracker Cloud Provisioning..."

# 1. Configuration
# Unset any potentially invalid project config to prevent errors
gcloud config unset project --quiet

# Generate a random suffix to ensure uniqueness
RANDOM_SUFFIX=$((RANDOM % 90000 + 10000))
PROJECT_ID="travel-tracker-${RANDOM_SUFFIX}"
BILLING_ACCOUNT_ID="" # Leave empty to ask user, or fill if known

echo "------------------------------------------------"
echo "Target Project ID: ${PROJECT_ID}"
echo "------------------------------------------------"

# 2. Create Project
echo "📦 Creating Google Cloud Project..."
gcloud projects create ${PROJECT_ID} --name="Travel Tracker"

echo "✅ Project created."

# 3. Link Billing (Required for many APIs)
# We need to find a billing account first
echo "💳 Checking Billing Accounts..."
BILLING_ACCOUNTS=$(gcloud beta billing accounts list --format="value(name,displayName)")

if [ -z "$BILLING_ACCOUNTS" ]; then
    echo "❌ No billing accounts found. You must set up billing in the Google Cloud Console first."
    echo "   Go to: https://console.cloud.google.com/billing"
    exit 1
fi

# Just pick the first one for now, or ask user (interactive)
# For automation, we'll try to pick the first open one.
BILLING_ACCOUNT_ID=$(gcloud beta billing accounts list --format="value(name)" --limit=1)

echo "🔗 Linking to Billing Account: ${BILLING_ACCOUNT_ID}"
gcloud beta billing projects link ${PROJECT_ID} --billing-account=${BILLING_ACCOUNT_ID}

# 4. Set Config
gcloud config set project ${PROJECT_ID}

# 5. Enable APIs
echo "🔌 Enabling Google Cloud APIs (this may take a minute)..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    firestore.googleapis.com \
    aiplatform.googleapis.com \
    storage-component.googleapis.com \
    artifactregistry.googleapis.com \
    iam.googleapis.com

# 6. Create Service Account for Local Dev
echo "🔑 Creating Service Account for Local Development..."
SA_NAME="travel-tracker-dev"
gcloud iam service-accounts create ${SA_NAME} --display-name="Local Dev Account"

# Grant permissions
echo "🛡️ Granting permissions..."
# Owner is broad, but easiest for a solo dev starter kit. 
# For production, use tighter roles (Cloud Run Admin, Firestore User, etc.)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/owner"

# 7. Download Key
echo "⬇️ Downloading Service Account Key..."
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "✅ Key saved to service-account-key.json"

# 8. Create Artifact Registry
echo "🐳 Creating Docker Repository..."
gcloud artifacts repositories create travel-app-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for Travel App"

echo "------------------------------------------------"
echo "🎉 Provisioning Complete!"
echo "Project ID: ${PROJECT_ID}"
echo "Key File: service-account-key.json"
echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/"
echo "2. Add project '${PROJECT_ID}'"
echo "3. Enable Auth & Firestore (Production Mode)"
echo "------------------------------------------------"
