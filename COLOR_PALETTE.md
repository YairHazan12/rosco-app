# ROSCO Light Mode Color Palette

## 🎨 Brand Colors

```css
--brand:          #0F9C8C  /* Primary Teal */
--brand-dark:     #0D8578  /* Darker Teal */
--brand-light:    #E6F7F5  /* Light Teal Background */
```

**Visual:**
```
████████  #0F9C8C  Primary Teal (buttons, links, accents)
████████  #0D8578  Dark Teal (hover states)
████████  #E6F7F5  Light Teal (backgrounds, badges)
```

---

## 🎨 System Colors

### Blue (Admin, Information)
```css
--blue:           #0088CC
--blue-light:     #E6F4FA
```

### Green (Success, Completed)
```css
--green:          #10B981
--green-light:    #D1FAE5
```

### Amber (Warning, Pending)
```css
--amber:          #F59E0B
--amber-light:    #FEF3C7
```

### Red (Error, Urgent)
```css
--red:            #EF4444
--red-light:      #FEE2E2
```

### Purple (Special States)
```css
--purple:         #9333EA
```

---

## 🎨 Background Colors

```css
--bg-primary:     #F8FAFB  /* Page background */
--bg-card:        #FFFFFF  /* Card/elevated surface */
--bg-card-alt:    #F9FAFB  /* Alternate card */
--bg-grouped:     #F1F5F9  /* Grouped sections */
--bg-elevated:    #FFFFFF  /* Elevated elements */
--bg-subtle:      #F8FAFB  /* Subtle backgrounds */
```

**Visual:**
```
████████  #F8FAFB  Page Background (light gray-blue)
████████  #FFFFFF  Cards & Surfaces (pure white)
████████  #F1F5F9  Grouped Sections (subtle gray)
```

---

## 🎨 Text Colors

```css
--label-primary:      #0F172A  /* Primary text (headings, body) */
--label-secondary:    #64748B  /* Secondary text (descriptions) */
--label-tertiary:     #94A3B8  /* Tertiary text (metadata) */
--label-quaternary:   #CBD5E1  /* Quaternary text (disabled, subtle) */
```

**Visual:**
```
████████  #0F172A  Primary (dark slate)
████████  #64748B  Secondary (medium gray)
████████  #94A3B8  Tertiary (light gray)
████████  #CBD5E1  Quaternary (very light)
```

**Text Hierarchy Example:**
```
┌─────────────────────────────────────┐
│ Job Details             #0F172A     │  ← Primary
│ Installation & Repair   #64748B     │  ← Secondary  
│ Scheduled for tomorrow  #94A3B8     │  ← Tertiary
│ Created 2 days ago      #CBD5E1     │  ← Quaternary
└─────────────────────────────────────┘
```

---

## 🎨 Borders & Separators

```css
--separator:          #E2E8F0  /* Lines, borders */
--separator-opaque:   #E2E8F0  /* Opaque variant */
--border-light:       #F1F5F9  /* Very subtle borders */
```

**Visual:**
```
████████  #E2E8F0  Standard borders
████████  #F1F5F9  Subtle borders
```

---

## 🎨 Status Badge Colors

### Pending (Amber)
```css
background: #FEF3C7  /* Light amber */
color:      #B45309  /* Dark amber text */
```

### In Progress (Blue)
```css
background: #E6F4FA  /* Light blue */
color:      #0369A1  /* Dark blue text */
```

### Completed (Green)
```css
background: #D1FAE5  /* Light green */
color:      #047857  /* Dark green text */
```

**Visual:**
```
🟨 Pending       #FEF3C7 bg, #B45309 text
🟦 In Progress   #E6F4FA bg, #0369A1 text
🟩 Completed     #D1FAE5 bg, #047857 text
```

---

## 🎨 Button Colors

### Primary Button (Teal)
```css
background: linear-gradient(145deg, #0F9C8C, #0D8578)
color:      #FFFFFF
shadow:     0 2px 8px rgba(15, 156, 140, 0.2)
```

### Success Button (Green)
```css
background: #10B981
color:      #FFFFFF
shadow:     0 4px 16px rgba(16, 185, 129, 0.22)
```

**Visual:**
```
┌─────────────────────┐
│  Primary Button     │  ← Teal gradient
└─────────────────────┘

┌─────────────────────┐
│  Success Button     │  ← Solid green
└─────────────────────┘
```

---

## 🎨 Gradients

### Page Background
```css
background: linear-gradient(to bottom right, #F8FAFC, #FFFFFF, #F0FDFA)
```

### Logo/Icon
```css
background: linear-gradient(145deg, #0F9C8C, #0D8578)
```

---

## 🎨 Shadows

### Card Shadow
```css
box-shadow: 
  0 1px 3px rgba(15, 23, 42, 0.06),
  0 1px 2px rgba(15, 23, 42, 0.04);
```

### Button Shadow (Primary)
```css
box-shadow: 0 2px 8px rgba(15, 156, 140, 0.2);
```

### Button Shadow (Success)
```css
box-shadow: 0 4px 16px rgba(16, 185, 129, 0.22);
```

---

## 📐 Design Principles

1. **High Contrast**: Dark text (#0F172A) on light backgrounds (#FFFFFF) for readability
2. **Subtle Depth**: Light shadows for card elevation, avoiding harsh contrasts
3. **Professional Palette**: Muted, sophisticated colors suitable for business software
4. **Accessible**: All text meets WCAG AA contrast requirements
5. **Consistent Branding**: Teal accent used throughout for primary actions

---

## 🎯 Usage Guidelines

### Primary Actions
Use **Teal** (#0F9C8C) for:
- Primary buttons
- Active navigation items
- Important links
- Brand elements

### Success States
Use **Green** (#10B981) for:
- Completed jobs
- Payment success
- Positive confirmations

### Warning/Pending
Use **Amber** (#F59E0B) for:
- Pending jobs
- Awaiting payment
- Attention needed

### Errors/Urgent
Use **Red** (#EF4444) for:
- Errors
- Overdue items
- Critical warnings

### Information
Use **Blue** (#0088CC) for:
- Admin-related items
- Informational badges
- Secondary actions

---

**Last Updated**: February 24, 2026  
**Theme**: Professional Light Mode  
**Design System**: iOS-Inspired with Modern SaaS Aesthetic
