# Fix Async Event Handlers - Batch Fixes

This document tracks all the Promise-returning function violations that need to be fixed.

## Files to Fix

### 1. AppLayout.tsx:151
```typescript
// Before:
<button onClick={handleLogout}>

// After:
<button onClick={() => void handleLogout()}>
```

### 2. BirthdaySharing.tsx:278, 296, 358
```typescript
// Before:
<button onClick={handleCopyLink}>
<button onClick={handleShare}>
<button onClick={handleRegenerate}>

// After:
<button onClick={() => void handleCopyLink()}>
<button onClick={() => void handleShare()}>
<button onClick={() => void handleRegenerate()}>
```

### 3. CalendarExport.tsx:218
```typescript
// Before:
<button onClick={handleExport}>

// After:
<button onClick={() => void handleExport()}>
```

### 4. CalendarView.tsx:151
```typescript
// Before:
<button onClick={handleRefresh}>

// After:
<button onClick={() => void handleRefresh()}>
```

### 5. LunarForecastView.tsx:136
```typescript
// Before:
<button onClick={handleLoadPrevious}>

// After:
<button onClick={() => void handleLoadPrevious()}>
```

### 6. LunarHistoryView.tsx:98, 130
```typescript
// Before:
<button onClick={onSelect && onSelect(lunarReturn)}>
<button onClick={() => handleDelete(lunarReturn.id)}>

// After:
<button onClick={() => onSelect && void onSelect(lunarReturn)}>
<button onClick={() => void handleDelete(lunarReturn.id)}>
```

### 7. LunarReturnDashboard.tsx:90
```typescript
// Before:
<button onClick={handleCalculate}>

// After:
<button onClick={() => void handleCalculate()}>
```

### 8. PushNotificationPermission.tsx:71, 90
```typescript
// Before:
<button onClick={handleRequestPermission}>
<button onClick={handleDenyPermission}>

// After:
<button onClick={() => void handleRequestPermission()}>
<button onClick={() => void handleDenyPermission()}>
```

### 9. ReportActions.tsx (Multiple locations)
Fix all async onClick handlers similarly

## Alternative Pattern (Better Error Handling)

```typescript
// Create wrapper function with error handling
const handleActionWithFeedback = async () => {
  try {
    await asyncAction();
  } catch (error) {
    console.error('Action failed:', error);
    // Show user feedback
  }
};

<button onClick={handleActionWithFeedback}>
```

## Progress

- [x] LunarHistoryView.tsx - Fixed
- [ ] AppLayout.tsx - Pending
- [ ] BirthdaySharing.tsx - Pending
- [ ] CalendarExport.tsx - Pending
- [ ] CalendarView.tsx - Pending
- [ ] LunarForecastView.tsx - Pending
- [ ] LunarReturnDashboard.tsx - Pending
- [ ] PushNotificationPermission.tsx - Pending
- [ ] ReportActions.tsx - Pending
