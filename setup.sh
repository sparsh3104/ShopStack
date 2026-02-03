#!/bin/bash

# ShopStack - Setup and Deployment Script
# This script helps with initial setup and deployment to Firebase

set -e

echo "🚀 ShopStack Setup & Deployment Script"
echo "======================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI is not installed."
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ All prerequisites are met"
echo ""

# Setup function
setup() {
    echo "📦 Setting up ShopStack..."
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install functions dependencies
    echo "Installing Cloud Functions dependencies..."
    cd functions
    npm install
    cd ..
    
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. To run the development server: cd frontend && npm run dev"
    echo "2. To deploy to Firebase: firebase deploy"
    echo ""
}

# Deploy function
deploy() {
    echo "🚀 Deploying ShopStack to Firebase..."
    
    # Check if user is logged in
    if ! firebase projects:list &> /dev/null; then
        echo "Please login to Firebase first:"
        firebase login
    fi
    
    # Build frontend
    echo "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    # Deploy everything
    echo "Deploying to Firebase..."
    firebase deploy
    
    echo "✅ Deployment complete!"
    echo ""
    echo "Your app is now live!"
    echo "Visit: https://shopstack-5351f.web.app"
    echo ""
}

# Deploy only functions
deploy_functions() {
    echo "🚀 Deploying Cloud Functions..."
    
    if ! firebase projects:list &> /dev/null; then
        echo "Please login to Firebase first:"
        firebase login
    fi
    
    firebase deploy --only functions
    
    echo "✅ Cloud Functions deployed!"
}

# Deploy only rules
deploy_rules() {
    echo "🚀 Deploying Security Rules..."
    
    if ! firebase projects:list &> /dev/null; then
        echo "Please login to Firebase first:"
        firebase login
    fi
    
    firebase deploy --only firestore,storage
    
    echo "✅ Security Rules deployed!"
}

# Main menu
if [ $# -eq 0 ]; then
    echo "Usage: ./setup.sh [setup|dev|deploy|deploy-functions|deploy-rules]"
    echo ""
    echo "Commands:"
    echo "  setup              - Install dependencies"
    echo "  dev                - Run development server"
    echo "  deploy             - Deploy everything to Firebase"
    echo "  deploy-functions   - Deploy only Cloud Functions"
    echo "  deploy-rules       - Deploy only Security Rules"
    echo ""
else
    case $1 in
        setup)
            setup
            ;;
        dev)
            echo "Starting development server..."
            cd frontend
            npm run dev
            ;;
        deploy)
            deploy
            ;;
        deploy-functions)
            deploy_functions
            ;;
        deploy-rules)
            deploy_rules
            ;;
        *)
            echo "Unknown command: $1"
            echo "Use: ./setup.sh [setup|dev|deploy|deploy-functions|deploy-rules]"
            exit 1
            ;;
    esac
fi
