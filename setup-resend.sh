#!/bin/bash

# Resend Email Setup Script
# Run this to install and configure Resend

echo "🚀 Setting up Resend Email Service..."
echo ""

# Install Resend package
echo "📦 Installing Resend package..."
yarn add resend

echo ""
echo "✅ Resend package installed!"
echo ""
echo "📝 Next steps:"
echo "1. Get your API key from https://resend.com/api-keys"
echo "2. Add it to your .env file:"
echo "   VITE_RESEND_API_KEY=re_your_api_key_here"
echo "3. Restart your dev server"
echo ""
echo "🎉 Done! Emails will start sending automatically!"
