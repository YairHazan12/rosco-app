#!/bin/bash
# ROSCO Push Notification Test Script
# This script helps diagnose FCM notification issues step by step

set -e

echo "🔍 ROSCO Push Notification Diagnostic Tool"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check environment variables
echo "📋 Step 1: Checking environment variables..."
if grep -q "NEXT_PUBLIC_FIREBASE_VAPID_KEY" .env 2>/dev/null; then
    VAPID=$(grep "NEXT_PUBLIC_FIREBASE_VAPID_KEY" .env | cut -d '=' -f2)
    if [ -n "$VAPID" ] && [ "$VAPID" != "your-vapid-key-here" ]; then
        echo -e "${GREEN}✅ VAPID key is configured${NC}"
    else
        echo -e "${RED}❌ VAPID key is missing or placeholder${NC}"
        echo "   Fix: Add your VAPID key from Firebase Console → Cloud Messaging → Web Push certificates"
        exit 1
    fi
else
    echo -e "${RED}❌ .env file not found or VAPID key missing${NC}"
    exit 1
fi

echo ""

# Step 2: Check if service worker exists
echo "📋 Step 2: Checking service worker files..."
if [ -f "public/firebase-messaging-sw.js" ]; then
    echo -e "${GREEN}✅ firebase-messaging-sw.js exists${NC}"
else
    echo -e "${RED}❌ firebase-messaging-sw.js missing${NC}"
    exit 1
fi

if [ -f "public/sw.js" ]; then
    echo -e "${GREEN}✅ sw.js exists${NC}"
else
    echo -e "${YELLOW}⚠️  sw.js missing (optional but recommended)${NC}"
fi

echo ""

# Step 3: Verify Firebase Admin SDK credentials
echo "📋 Step 3: Checking Firebase Admin credentials..."
if grep -q "FIREBASE_PRIVATE_KEY" .env 2>/dev/null; then
    PRIVATE_KEY=$(grep "FIREBASE_PRIVATE_KEY" .env | cut -d '=' -f2)
    if [[ "$PRIVATE_KEY" == *"BEGIN PRIVATE KEY"* ]]; then
        echo -e "${GREEN}✅ Firebase Admin private key is configured${NC}"
    else
        echo -e "${RED}❌ Firebase Admin private key is invalid${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ FIREBASE_PRIVATE_KEY not found${NC}"
    exit 1
fi

echo ""

# Step 4: Check if dev server is running
echo "📋 Step 4: Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev server is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server not detected. Start it with: npm run dev${NC}"
fi

echo ""

# Step 5: Instructions for manual testing
echo "📋 Step 5: Manual Testing Checklist"
echo "======================================"
echo ""
echo "1. Open http://localhost:3000 in Chrome/Firefox (Safari doesn't support FCM)"
echo "2. Log in as a handyman user"
echo "3. Go to Profile page"
echo "4. Enable 'Push Notifications' toggle"
echo "5. Accept the browser permission prompt"
echo "6. Open browser DevTools Console (F12)"
echo "7. Look for: '✅ FCM token saved: ...'"
echo ""
echo "To test notification delivery:"
echo "-----------------------------"
echo "Option A: Create a test job assigned to your handyman account"
echo "Option B: Use the API test below"
echo ""

# Step 6: Offer to send a test notification
echo "📋 Step 6: Send Test Notification (Optional)"
echo "============================================="
echo ""
read -p "Do you want to send a test notification? (requires handymanId) [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter handyman Firebase UID: " HANDYMAN_ID
    
    if [ -z "$HANDYMAN_ID" ]; then
        echo -e "${RED}❌ No handyman ID provided${NC}"
        exit 1
    fi
    
    echo ""
    echo "📤 Sending test notification..."
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/send-notification \
        -H "Content-Type: application/json" \
        -d "{
            \"handymanId\": \"$HANDYMAN_ID\",
            \"title\": \"🧪 Test Notification\",
            \"body\": \"If you see this, FCM is working!\",
            \"data\": {
                \"url\": \"/handyman\",
                \"tag\": \"test\"
            }
        }")
    
    if echo "$RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✅ Test notification sent successfully!${NC}"
        echo ""
        echo "Check your device/browser for the notification."
    else
        echo -e "${RED}❌ Failed to send notification:${NC}"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
        echo ""
        echo "Common issues:"
        echo "  - Handyman doesn't have an FCM token registered (check Firestore)"
        echo "  - Service worker not registered properly"
        echo "  - Browser doesn't support FCM (try Chrome/Firefox)"
    fi
fi

echo ""
echo "🎯 Next Steps if notifications still don't work:"
echo "================================================"
echo ""
echo "1. Check browser console for errors (especially service worker registration)"
echo "2. Verify Firestore handymen/{uid}/fcmToken field is populated"
echo "3. Test in incognito mode (clears old service worker cache)"
echo "4. Check Firebase Console → Cloud Messaging for delivery logs"
echo "5. Ensure notifications are enabled in OS system settings"
echo ""
echo "For iOS Safari users:"
echo "  - FCM is NOT supported on iOS Safari/WebView"
echo "  - Only works in standalone PWA mode (Add to Home Screen)"
echo ""
