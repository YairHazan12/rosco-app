# Implementation Code Reference

## Key Code Changes Overview

### 1. Modal State in Team Page

```typescript
// Added state for modal management
const [selectedHandyman, setSelectedHandyman] = useState<Handyman | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 2. Event Handlers in Team Page

```typescript
// Handler to open modal with selected handyman
const handleViewHandyman = (handyman: Handyman) => {
  setSelectedHandyman(handyman);
  setIsModalOpen(true);
};

// Handler to close modal
const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedHandyman(null);
};
```

### 3. Clickable Team Member Cards

**Before:**
```typescript
<div className="flex-1 min-w-0">
  {/* Content */}
</div>
```

**After:**
```typescript
<button
  onClick={() => handleViewHandyman(member)}
  className="flex-1 min-w-0 text-left transition-opacity hover:opacity-80 active:opacity-60 cursor-pointer"
>
  {/* Same content, now clickable */}
</button>
```

### 4. Remove Button Update

```typescript
<button
  onClick={(e) => {
    e.stopPropagation(); // Prevents modal from opening when removing
    handleRemoveMember(member.id, member.name);
  }}
  // ... rest of button props
>
```

### 5. Modal Component Integration

```typescript
{/* Added at end of component JSX */}
<HandymanDetailsModal 
  handyman={selectedHandyman}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
/>
```

## Component Architecture

```
TeamPage
├── Team Code Card
├── Team Members Section
│   └── Team Member Cards (clickable)
│       ├── Handyman Info (triggers modal)
│       └── Remove Button (with stopPropagation)
├── Join Requests Section
└── HandymanDetailsModal (conditionally rendered)
    ├── Backdrop (clickable to close)
    ├── Modal Content
    │   ├── Header (with close button)
    │   ├── Contact Information
    │   ├── Specialties
    │   ├── Member Information
    │   └── Action Buttons (Call/Email)
    └── ESC key listener
```

## CSS Variables Used

The modal uses the existing ROSCO design system variables:
- `--brand`: Primary brand color
- `--brand-light`: Light brand color for backgrounds
- `--label`: Primary text color
- `--label-secondary`: Secondary text color
- `--label-tertiary`: Tertiary text color
- `--bg-grouped`: Grouped background color
- `--separator`: Border/separator color
- `--green`, `--green-light`: Success/active status
- `--red`, `--red-light`: Error/inactive status

## Props Interface

```typescript
interface HandymanDetailsModalProps {
  handyman: Handyman | null;  // The handyman to display
  isOpen: boolean;             // Controls modal visibility
  onClose: () => void;         // Callback when modal should close
}
```

## Handyman Type Structure

```typescript
interface Handyman {
  id: string;
  name: string;
  phone?: string;          // Optional
  email?: string;          // Optional
  companyId: string;
  specialties?: string[];  // Optional
  status?: string;         // Optional
  createdAt: string;
}
```

## Responsive Behavior

- **Desktop:** Modal centered with max-width of 512px
- **Mobile:** Modal takes up most of screen with proper padding
- **Scrolling:** Modal content scrolls if it exceeds viewport height
- **Max Height:** 90vh to ensure close button remains accessible

## Animation Details

1. **Backdrop:** Fade in/out with blur effect
2. **Team Cards:** Opacity change on hover/active
3. **Dismissing Members:** Smooth height/opacity transition
4. **Modal Close:** Instant removal (could be enhanced with animation)

## Accessibility Features

- **Keyboard:** ESC key closes modal
- **Mouse:** Click backdrop to close
- **Touch:** Tap backdrop to close
- **Focus:** Close button easily accessible
- **Links:** Tel and mailto links for native app integration
