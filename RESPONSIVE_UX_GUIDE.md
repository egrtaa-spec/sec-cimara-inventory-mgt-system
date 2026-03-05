# Responsive UX & Navigation Guide

## 1. Automatic Resizing (Responsive Design)

The system is designed to automatically adapt to any screen size (Mobile, Tablet, Desktop) using **Tailwind CSS**. This removes the need for a manual "Desktop/Mobile" switch button, as the layout adapts to the device width automatically.

### Implementation Strategy

#### Viewport Configuration
Ensure `app/layout.tsx` is configured for mobile devices to prevent zooming issues:
```tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}
```

#### Responsive Grid Layouts
Use Tailwind's breakpoint prefixes (`sm:`, `md:`, `lg:`) to alter layouts dynamically based on screen size.

**Example: Dashboard Statistics**
*   **Mobile**: 1 column (Stack vertically)
*   **Tablet**: 2 columns
*   **Desktop**: 4 columns

```tsx
// components/dashboard-stats.tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Stat Cards will auto-resize */}
</div>
```

#### Responsive Tables
Tables often break mobile layouts. Wrap them in a scrollable container to allow horizontal scrolling on phones.

```tsx
// components/withdrawal-history.tsx
<div className="w-full overflow-x-auto">
  <table className="w-full min-w-[600px]">
    {/* Table Content */}
  </table>
</div>
```

#### Navigation Bar
On mobile, hide the full menu and show a hamburger icon or simplified links.

```tsx
// components/header.tsx
<nav className="flex items-center justify-between p-4">
  {/* Visible on all screens */}
  <Link href="/" className="font-bold">CIMARA</Link>
  
  {/* Hidden on Mobile (hidden), Visible on Desktop (md:flex) */}
  <div className="hidden md:flex gap-4 ml-4">
    <Link href="/dashboard">Dashboard</Link>
    <Link href="/engineers">Engineers</Link>
  </div>
</nav>
```

## 2. Authentication & Process Evaluation

### Current Status
The system currently operates as a **Single-User / Open System** (see `PROJECT_COMPLETION.md`). There is no login screen for the administrator.

### Engineer Registration Flow
The "Signup" process refers to registering engineers into the system.

**Evaluation**: Currently, after registering an engineer, the user might remain on the form.
**Improvement**: Redirect the administrator to the Dashboard immediately after success.

### Implementation: Redirect after Registration

Modify `components/engineer-registration-form.tsx` to include redirection logic using `useRouter`.

```tsx
'use client';

import { useRouter } from 'next/navigation'; // Import router
import { toast } from 'sonner';

export default function EngineerRegistrationForm() {
  const router = useRouter(); // Initialize router

  async function onSubmit(data) {
    try {
      // 1. Submit data to API
      const res = await fetch('/api/engineers', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error('Registration failed');

      // 2. Show success message
      toast.success('Engineer registered successfully');

      // 3. REDIRECT to Dashboard (User Request)
      router.push('/dashboard'); 
      
      // Optional: Refresh data to show new counts
      router.refresh();

    } catch (error) {
      toast.error('Error registering engineer');
    }
  }

  return (
    // Form JSX...
  );
}
```