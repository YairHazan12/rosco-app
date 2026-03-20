# Profile Tab Component Structure

```
📄 page.tsx (Server Component)
│
├─ Fetches:
│  ├─ settings (getSettings)
│  ├─ company data (Firestore)
│  └─ user data (Firestore)
│
└─ Renders:
   └─ ProfileView (Client Component)

🎨 ProfileView.tsx
│
├─ Section 1: Business Overview
│  ├─ Company name (large heading)
│  ├─ Company code badge
│  ├─ Business type, team size, phone (grid)
│  └─ "Share Join Link" button → JoinLinkModal
│
├─ Section 2: Admin Profile
│  ├─ Display name
│  ├─ Email
│  ├─ Role badge ("Admin")
│  └─ "Edit" button → EditProfileModal
│
├─ Section 3: Bank Details
│  └─ BankDetailsForm (existing component, refactored)
│
└─ Section 4: Preferences
   └─ SettingsForm (existing component, refactored)

📦 Supporting Components:

┌─────────────────────────┐
│  JoinLinkModal.tsx      │
├─────────────────────────┤
│ • Company code display  │
│ • Copy code button      │
│ • Join URL display      │
│ • Copy URL button       │
│ • QR code generator     │
│   (react-qr-code)       │
└─────────────────────────┘

┌─────────────────────────┐
│  EditProfileModal.tsx   │
├─────────────────────────┤
│ • Display name input    │
│ • Validation (min 2ch)  │
│ • Save → PUT /api/users │
│ • Cancel button         │
└─────────────────────────┘

┌─────────────────────────┐
│  BankDetailsForm.tsx    │
├─────────────────────────┤
│ • Payment split setup   │
│ • Bank selection        │
│ • Account number input  │
│ • Configured state UI   │
└─────────────────────────┘

┌─────────────────────────┐
│  SettingsForm.tsx       │
├─────────────────────────┤
│ • Currency picker       │
│ • Language picker       │
│ • Timezone picker       │
│ • Notification toggles  │
└─────────────────────────┘
```

## Data Flow

```
User clicks "Profile" tab
        ↓
page.tsx (Server Component)
        ↓
    Fetches data from:
    ├─ getSettings() [cached 5min]
    ├─ Firestore: companies/{companyId}
    └─ Firestore: users/{userId}
        ↓
ProfileView receives props:
    { user, company, settings }
        ↓
    Renders 4 sections
        ↓
User interactions:
    ├─ Click "Share Join Link" → JoinLinkModal opens
    ├─ Click "Edit" → EditProfileModal opens
    ├─ Edit bank details → BankDetailsForm handles
    └─ Edit settings → SettingsForm handles
```

## API Endpoints Used

- `GET /api/companies/{id}` - Fetch company (already exists)
- `PUT /api/companies/{id}` - Update company/bank details (already exists)
- `GET /api/settings` - Fetch settings (already exists)
- `PUT /api/settings` - Update settings (already exists)
- `GET /api/users/{id}` - Fetch user (newly created)
- `PUT /api/users/{id}` - Update user profile (newly created)

## Styling

All components use the iOS design system:
- `ios-card` - Frosted glass cards
- `ios-large-title` - Large page title
- `var(--brand)` - Brand color (orange/green)
- `var(--label-primary/secondary/tertiary)` - Text colors
- `var(--separator)` - Divider lines
- `var(--ios-blue/green/red)` - System colors

## State Management

- **Server Component** (page.tsx): Fetches data once on load
- **Client Components**: Local state for modals and forms
- **Form submission**: Calls API, then reloads page to reflect changes
- **No global state**: Each component is self-contained

## Benefits of This Structure

✅ **Performance**: Server-side data fetching, cached where possible  
✅ **Maintainability**: Clear separation of concerns  
✅ **Reusability**: Existing forms (BankDetailsForm, SettingsForm) integrated cleanly  
✅ **User Experience**: All profile info in one place, quick access to key actions  
✅ **Scalability**: Easy to add more sections or functionality
