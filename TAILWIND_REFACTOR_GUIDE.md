# Tailwind CSS Refactoring Guide for ReporTube

## Overview
This guide documents the refactoring of ReporTube from Bulma CSS to Tailwind CSS, featuring a modern blue color scheme with responsive design and smooth animations.

## Completed Refactoring

### ✅ Files Already Updated
1. **`src/views/partials/header.ejs`** - Complete navigation with Tailwind
2. **`src/views/partials/footer.ejs`** - Modern footer design
3. **`src/views/auth/login.ejs`** - Full login page example

## Color Scheme

### Primary Colors (Blue Theme)
```javascript
primary: {
  50: '#eff6ff',   // Lightest blue
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',  // Base blue
  600: '#2563eb',  // Main brand color
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',  // Darkest blue
}
```

### Secondary Colors (Purple/Pink)
```javascript
secondary: {
  50: '#fdf4ff',
  500: '#d946ef',
  600: '#c026d3',
  // ... full spectrum
}
```

## Key Design Elements

### 1. Navigation Bar
- **Gradient Background**: `from-primary-600 via-primary-700 to-primary-800`
- **Sticky positioning**: `sticky top-0 z-50`
- **Responsive breakpoint**: `md:` for desktop, mobile-first approach
- **Hover effects**: `hover:bg-primary-700` with smooth transitions
- **Dropdowns**: CSS-only with `group` and `group-hover` utilities

### 2. Cards & Containers
- **Rounded corners**: `rounded-xl` (12px) or `rounded-2xl` (16px)
- **Shadows**: `shadow-lg`, `shadow-xl` for depth
- **White background**: `bg-white` with subtle borders
- **Padding**: `p-6`, `px-8 py-10` for consistent spacing

### 3. Buttons
- **Primary**: `bg-gradient-to-r from-primary-600 to-primary-700`
- **Hover**: `hover:from-primary-700 hover:to-primary-800`
- **Transform**: `hover:-translate-y-0.5` for lift effect
- **Shadows**: `shadow-md hover:shadow-lg`
- **Icons**: Material Design Icons with `mdi` classes

### 4. Forms
- **Input fields**: `rounded-xl border-2 border-gray-300`
- **Focus state**: `focus:ring-4 focus:ring-primary-100 focus:border-primary-500`
- **Icon positioning**: Absolute positioning with `pl-12` for input padding
- **Labels**: `text-sm font-semibold text-gray-700`

### 5. Responsive Design
- **Mobile-first**: Base styles apply to mobile
- **Breakpoints**:
  - `sm:` - 640px and up
  - `md:` - 768px and up
  - `lg:` - 1024px and up
  - `xl:` - 1280px and up

### 6. Animations
- **Transitions**: `transition-all duration-200` for smooth effects
- **Transforms**: `transform hover:scale-105` for interactive elements
- **Custom animations**: Float, shimmer, shake effects

## Refactoring Pattern

### Step-by-Step for Each Template

#### 1. Update Header Include
```ejs
<!-- Old Bulma -->
<%- include('../../partials/header', { title: 'Page Title' }) %>

<!-- Keep same (header now uses Tailwind) -->
<%- include('../../partials/header', { title: 'Page Title' }) %>
```

#### 2. Convert Layout Structure
```html
<!-- Old Bulma -->
<section class="section">
  <div class="container">
    <div class="box">
      <!-- content -->
    </div>
  </div>
</section>

<!-- New Tailwind -->
<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <!-- content -->
    </div>
  </div>
</div>
```

#### 3. Convert Components

##### Tables
```html
<!-- Old Bulma -->
<table class="table is-fullwidth is-striped">

<!-- New Tailwind -->
<div class="overflow-x-auto rounded-lg border border-gray-200">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
```

##### Buttons
```html
<!-- Old Bulma -->
<button class="button is-primary">Click Me</button>

<!-- New Tailwind -->
<button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
  Click Me
</button>
```

##### Forms
```html
<!-- Old Bulma -->
<div class="field">
  <label class="label">Email</label>
  <div class="control">
    <input class="input" type="email">
  </div>
</div>

<!-- New Tailwind -->
<div class="space-y-2">
  <label class="block text-sm font-semibold text-gray-700">Email</label>
  <input type="email" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all">
</div>
```

##### Tags/Badges
```html
<!-- Old Bulma -->
<span class="tag is-primary">Status</span>

<!-- New Tailwind -->
<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
  Status
</span>
```

##### Notifications/Alerts
```html
<!-- Old Bulma -->
<div class="notification is-info">Message</div>

<!-- New Tailwind -->
<div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
  <p class="text-blue-800">Message</p>
</div>
```

## Templates to Refactor

### Priority 1: Auth & Error Pages
- [ ] `src/views/auth/change-password.ejs`
- [ ] `src/views/error.ejs`

### Priority 2: Teacher Templates
- [ ] `src/views/teacher/dashboard.ejs`
- [ ] `src/views/teacher/classes/list.ejs`
- [ ] `src/views/teacher/classes/students.ejs`
- [ ] `src/views/teacher/scores/my-classes.ejs`
- [ ] `src/views/teacher/scores/entry.ejs` ⚠️ **Most Complex**
- [ ] `src/views/teacher/reports/student.ejs`

### Priority 3: Admin Templates
- [ ] `src/views/admin/dashboard.ejs`
- [ ] `src/views/admin/classes/list.ejs`
- [ ] `src/views/admin/classes/add.ejs`
- [ ] `src/views/admin/classes/details.ejs`
- [ ] `src/views/admin/students/list.ejs`
- [ ] `src/views/admin/students/add.ejs`
- [ ] `src/views/admin/subjects/list.ejs`
- [ ] `src/views/admin/subjects/add.ejs`
- [ ] `src/views/admin/users/list.ejs`
- [ ] `src/views/admin/users/add.ejs`
- [ ] `src/views/admin/users/edit.ejs`
- [ ] `src/views/admin/scores/list.ejs`
- [ ] `src/views/admin/reports/send.ejs`

## Common Tailwind Utilities

### Spacing
- `p-4, p-6, p-8` - Padding (16px, 24px, 32px)
- `m-4, m-6, m-8` - Margin
- `space-x-4, space-y-4` - Gap between children

### Typography
- `text-sm, text-base, text-lg, text-xl` - Font sizes
- `font-medium, font-semibold, font-bold` - Font weights
- `text-gray-600, text-gray-900` - Text colors

### Layout
- `flex, grid` - Display modes
- `items-center, justify-between` - Alignment
- `gap-4, gap-6` - Grid/flex gaps

### Responsive
- `hidden md:block` - Hide on mobile, show on desktop
- `md:flex-row` - Stack on mobile, row on desktop
- `sm:px-6 lg:px-8` - Different padding at different sizes

## Icons

Using Material Design Icons (MDI):
- `mdi-view-dashboard` - Dashboard
- `mdi-account` - User
- `mdi-school` - School/Class
- `mdi-clipboard-edit` - Scores
- `mdi-file-document` - Reports
- `mdi-cog` - Settings
- `mdi-logout` - Logout

## Testing Checklist

For each refactored template:
- [ ] Desktop view (1920px+)
- [ ] Laptop view (1024px-1920px)
- [ ] Tablet view (768px-1024px)
- [ ] Mobile view (320px-768px)
- [ ] All interactive elements (hover, focus)
- [ ] Form validation styling
- [ ] Loading states
- [ ] Error states

## Tips for Success

1. **Mobile-first**: Start with mobile styles, add `md:` and `lg:` prefixes for larger screens
2. **Use Dev Tools**: Chrome/Firefox responsive design mode
3. **Consistent Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12)
4. **Color Consistency**: Stick to primary/secondary color palettes
5. **Smooth Transitions**: Add `transition-all duration-200` for hover effects
6. **Accessibility**: Maintain focus states and ARIA labels

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Material Design Icons](https://materialdesignicons.com)
- [Color Shades Generator](https://uicolors.app)

## Notes

- The header and footer are globally applied to all authenticated pages
- Login page serves as the reference implementation
- All templates should follow the same color scheme and design patterns
- Keep animations subtle and professional
- Ensure all forms are accessible and validation-friendly

---

**Status**: Foundation Complete
**Last Updated**: <%= new Date().toISOString().split('T')[0] %>
**Refactored By**: Claude Code Assistant
