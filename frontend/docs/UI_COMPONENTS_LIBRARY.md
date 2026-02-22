# Base UI Components Library

## Overview

A comprehensive, production-ready UI component library built with TypeScript, React, and Tailwind CSS. All components follow WCAG 2.1 AA accessibility guidelines and include full keyboard navigation support.

## Component List

### 1. Button
**File:** `Button.tsx`

**Features:**
- 4 variants: primary, secondary, ghost, danger
- 4 sizes: sm, md, lg, xl
- Loading state with animated spinner
- Disabled state styling
- Left/right icon support
- Full accessibility (aria-label, aria-disabled, aria-busy)

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>

<Button
  variant="danger"
  leftIcon={<TrashIcon />}
  onClick={handleDelete}
>
  Delete
</Button>
```

### 2. Input
**File:** `Input.tsx`

**Features:**
- 8 input types: text, email, password, number, date, time, tel, url
- Floating label support
- Error state with message
- Helper text
- Left/right icon support with click handlers
- Full accessibility (aria-invalid, aria-describedby)

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<MailIcon />}
/>

<Input
  label="Password"
  type="password"
  floatingLabel
  rightIcon={<EyeIcon />}
  onRightIconClick={togglePassword}
/>
```

### 3. Select
**File:** `Select.tsx`

**Features:**
- Single select dropdown
- Multi-select support
- Search/filter within options
- Grouped options support
- Keyboard navigation (Arrow keys, Enter, Escape)
- Error state with message
- Helper text
- Full accessibility (aria-haspopup, aria-expanded, role="combobox")

**Usage:**
```tsx
import { Select } from '@/components/ui';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

<Select
  label="Choose option"
  options={options}
  searchable
  onChange={(value) => setValue(value)}
/>

// Multi-select
<Select
  multiple
  options={options}
  onChange={(values) => setValues(values)}
/>

// Grouped options
<Select
  options={[
    { label: 'Group 1', options: [{ value: '1', label: 'Item' }] }
  ]}
/>
```

### 4. Checkbox
**File:** `Checkbox.tsx`

**Features:**
- Indeterminate state support
- 3 sizes: sm, md, lg
- Custom styling
- Label positioning (start/end)
- Error state with message
- Helper text
- Full accessibility (aria-checked, aria-invalid)

**Usage:**
```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  label="Accept terms and conditions"
  checked={accepted}
  onChange={(e) => setAccepted(e.target.checked)}
  error="Must accept to continue"
/>

<Checkbox
  label="Indeterminate"
  indeterminate={someIndeterminate}
/>

<Checkbox
  label="Start positioned"
  labelPosition="start"
/>
```

### 5. Toggle (Switch)
**File:** `Toggle.tsx`

**Features:**
- Animated thumb transition
- 3 sizes: sm, md, lg
- Label positioning (start, end, top, bottom)
- Error state with message
- Helper text
- Keyboard support (Enter, Space)
- Full accessibility (role="switch", aria-checked)

**Usage:**
```tsx
import { Toggle } from '@/components/ui';

<Toggle
  label="Enable notifications"
  checked={enabled}
  onChange={(checked) => setEnabled(checked)}
/>

<Toggle
  label="Dark mode"
  labelPosition="start"
  size="lg"
/>

<Toggle
  label="Auto-save"
  helperText="Automatically save changes"
  error="Failed to enable"
/>
```

### 6. Badge
**File:** `Badge.tsx`

**Features:**
- 5 variants: default, primary, success, warning, danger
- 3 sizes: sm, md, lg
- Dot indicator option
- Icon support
- Count display with max count
- Full accessibility (role="status", aria-label)

**Includes:**
- `Badge` - Main badge component
- `DotBadge` - Animated ping indicator
- `CountBadge` - Numeric badge for notifications

**Usage:**
```tsx
import { Badge, DotBadge, CountBadge } from '@/components/ui';

<Badge variant="success">Completed</Badge>
<Badge dot>New</Badge>
<Badge icon={<StarIcon />}>Featured</Badge>

<CountBadge count={5} maxCount={99} />
<CountBadge count={150} maxCount={99} /> // Shows "99+"

<DotBadge variant="success" />
```

### 7. Modal
**File:** `Modal.tsx` (Already existed)

**Features:**
- 5 sizes: sm, md, lg, xl, full
- Focus trap
- Escape key to close
- Click outside to close
- Header, body, footer subcomponents
- 3 variants: default, danger, success
- Initial focus options
- Full accessibility (role="dialog", aria-modal)

**Usage:**
```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="primary" onClick={onConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### 8. Toast
**File:** `Toast.tsx` (Already existed)

**Features:**
- 4 variants: info, success, warning, error
- Auto-dismiss with timer (default 5s)
- Manual dismiss button
- Progress bar for auto-dismiss
- Action button support
- Pause on hover
- Stackable multiple toasts
- Full accessibility (role="alert", aria-live)

**Usage:**
```tsx
import { Toast } from '@/components/ui';

<Toast
  id="toast-1"
  variant="success"
  title="Success!"
  message="Your changes have been saved"
  duration={5000}
  showProgress
  action={{
    label: 'Undo',
    onClick: handleUndo
  }}
/>
```

### 9. LoadingSpinner
**File:** `LoadingSpinner.tsx` (Updated)

**Features:**
- 5 sizes: xs, sm, md, lg, xl
- 4 colors: primary, secondary, white, gray
- Fullscreen variant with backdrop
- Full accessibility (role="status", aria-busy, aria-label)

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="md" color="primary" />
<LoadingSpinner size="xs" color="white" />
<LoadingSpinner size="xl" color="gray" />

<LoadingSpinner fullScreen label="Loading content..." />
```

### 10. SkeletonScreen
**File:** `SkeletonScreen.tsx` (Already existed)

**Features:**
- 8 skeleton types: text, avatar (circle), rect, card, chart, calendar, list, table, form
- Animated shimmer effect (pulse)
- Configurable width/height
- Multiple lines for text
- Full accessibility (aria-hidden, role="status")

**Usage:**
```tsx
import {
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonTable
} from '@/components/ui';

<SkeletonText lines={3} width={['100%', '80%', '60%']} />
<SkeletonCircle size={40} />
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

### 11. Alert
**File:** `Alert.tsx` (Already existed)

**Features:**
- 4 variants: info, success, warning, error
- Optional title
- Dismissible with close button
- Icon support
- Full accessibility (role="alert", aria-live)

**Usage:**
```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success!" dismissible onClose={handleClose}>
  Your changes have been saved successfully.
</Alert>

<Alert variant="error">
  Something went wrong. Please try again.
</Alert>
```

### 12. ErrorBoundary
**File:** `ErrorBoundary.tsx` (Already existed)

**Features:**
- Catches JavaScript errors in component tree
- Custom fallback UI
- Error recovery with reset button
- Error details in development
- Reset keys support
- Higher-order component wrapper

**Usage:**
```tsx
import { ErrorBoundary, withErrorBoundary } from '@/components/ui';

<ErrorBoundary
  onError={(error, errorInfo) => logError(error)}
  resetKeys={[userId]}
>
  <App />
</ErrorBoundary>

// Or with HOC
export default withErrorBoundary(MyComponent, {
  fallback: <CustomError />
});
```

## Design Tokens

The components use the following design tokens from `tailwind.config.js`:

### Colors
- **Primary:** Indigo (#6366F1)
- **Secondary:** Purple (#8B5CF6)
- **Accent:** Amber (#F59E0B)
- **Success:** Green
- **Warning:** Yellow
- **Danger:** Red
- **Gray Scale:** Full palette for neutrals

### Spacing
- Follows Tailwind's spacing scale (0.25rem increments)
- Consistent padding: sm (0.5rem), md (0.75rem), lg (1rem)

### Typography
- **Font Family:** Inter (sans-serif), Playfair Display (display)
- **Font Sizes:** xs (0.75rem), sm (0.875rem), base (1rem), lg (1.125rem)

### Border Radius
- sm (rounded-md), md (rounded-md), lg (rounded-lg), xl (rounded-lg)

## Accessibility Features

All components include:
- **Semantic HTML:** Proper use of button, input, select, etc.
- **ARIA Attributes:** aria-label, aria-describedby, aria-invalid, etc.
- **Keyboard Navigation:** Full keyboard support for all interactive elements
- **Focus Management:** Visible focus indicators, focus traps in modals
- **Screen Reader Support:** Proper roles and live regions
- **Color Contrast:** WCAG 2.1 AA compliant (4.5:1 for text)

## TypeScript Support

All components are fully typed with TypeScript:
- Exported interfaces for all props
- Generic types where appropriate
- Strict type checking enabled
- Proper forwardRef typing
- Discriminated unions for variants

## Testing

Comprehensive test suite in `__tests__/UIComponents.test.tsx`:
- Unit tests for all components
- Accessibility tests
- User interaction tests
- Edge case coverage

Run tests with:
```bash
npm test src/components/ui/__tests__/UIComponents.test.tsx
```

## Import Examples

### Individual Imports
```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
```

### Barrel Import (Recommended)
```tsx
import {
  Button,
  Input,
  Select,
  Checkbox,
  Toggle,
  Badge,
  Modal,
  Toast,
  LoadingSpinner
} from '@/components/ui';
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

```json
{
  "react": "^18.x",
  "clsx": "^2.x",
  "tailwindcss": "^3.x"
}
```

## Performance Considerations

- **React.memo:** Used where appropriate (Toast, Badge variants)
- **useCallback:** Event handlers properly memoized
- **Code Splitting:** Components can be lazy-loaded
- **Bundle Size:** Optimized imports, tree-shaking friendly

## Best Practices

1. **Always provide labels** for form inputs (Input, Select, Checkbox, Toggle)
2. **Use semantic variants** (danger for destructive actions, success for confirmations)
3. **Provide error messages** for validation states
4. **Include helper text** for complex inputs
5. **Use loading states** for async actions
6. **Maintain focus order** in custom flows
7. **Test keyboard navigation** for custom interactions

## Future Enhancements

Potential additions:
- DatePicker component
- Slider/Range input
- File upload component
- Rich text editor
- Data table component
- Pagination component
- Tooltip component
- Popover component
- Progress bar
- Avatar component with fallbacks

## Support

For issues or questions:
1. Check this documentation
2. Review component PropTypes/TypeScript types
3. Examine test files for usage examples
4. Check accessibility in browser DevTools

## License

Part of the Astrology MVP project. Internal use only.
