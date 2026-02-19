# ChartWheel Component - Accessibility Documentation

## Overview
The ChartWheel component provides an accessible astrological chart visualization that complies with WCAG 2.1 AA standards.

## Accessibility Features

### 1. Text Alternatives (WCAG 1.1.1)
- **SVG role="img"**: Identifies the chart as an image to assistive technologies
- **ARIA labels**: Describes the chart purpose and contents
- **Screen reader text**: Complete text-based alternative available via `sr-only` class
- **Symbol labels**: All astrological symbols include text descriptions

### 2. Keyboard Accessibility (WCAG 2.1.1)
- **Tab navigation**: Interactive elements receive keyboard focus (tabindex="0")
- **Keyboard interaction**: Enter and Space keys activate planets and aspects
- **Visible focus**: Focus indicators automatically applied by browser

### 3. Semantic Structure (WCAG 1.3.1)
- **Role="img"**: Proper semantic role for SVG
- **ARIA labels**: Each interactive element has descriptive labels
- **Grouping**: Related elements grouped in `<g>` tags
- **Headings**: Text alternative uses proper heading hierarchy

### 4. Identifiable Elements (WCAG 4.1.2)
- **Planet labels**: Include name, sign, degree, minute, house, and retrograde status
- **Aspect labels**: Include both planets, aspect type, and degree
- **Zodiac labels**: Include sign name and symbol
- **House lines**: Labeled with house number and sign

## ARIA Implementation

### SVG Container
```tsx
<svg
  role="img"
  aria-label={`Astrological chart wheel with ${data.planets.length} planets`}
  aria-describedby="chart-description"
>
  <desc id="chart-description">
    {generateChartDescription()}
  </desc>
```

### Planet Groups
```tsx
<g
  role="img"
  aria-label={`${planetName} in ${sign} at ${degree}°${minute}' in House ${house}${retrograde ? ', retrograde' : ''}`}
  tabIndex={interactive ? 0 : undefined}
  onKeyDown={handleKeyboardInteraction}
>
```

### Aspect Groups
```tsx
<g
  role="img"
  aria-label={`${planet1} ${aspectType} ${planet2} (${degree}°${minute}')`}
  tabIndex={interactive ? 0 : undefined}
  onKeyDown={handleKeyboardInteraction}
>
```

### Zodiac Symbols
```tsx
<text
  role="img"
  aria-label={`${signName} sign, symbol ${signSymbol}`}
>
```

## Screen Reader Support

### NVDA (Windows)
- Announces: "Astrological chart wheel with X planets, image"
- Tab through planets: "Sun in aries at 15 degrees 30 minutes in House 1, image, clickable"
- Tab through aspects: "Sun trine Moon (120 degrees 0 minutes), image, clickable"
- Text alternative available in "Text Description" section

### JAWS (Windows)
- Announces: "Astrological chart wheel with X planets, graphic"
- Planet focus: "Sun in aries at 15 degrees 30 minutes in House 1, graphic, press Enter to activate"
- Text alternative available via virtual cursor

### VoiceOver (macOS/iOS)
- Announces: "Astrological chart wheel with X planets, image"
- Planet focus: "Sun in aries at 15 degrees 30 minutes in House 1, image. You are currently on a clickable image."
- Swipe to navigate between planets

### TalkBack (Android)
- Announces: "Astrological chart wheel, image"
- Planet focus: "Sun in aries at 15 degrees 30 minutes in House 1, image, double tap to activate"

## Text-Based Alternative

A complete text description is provided for screen reader users:

```html
<div class="sr-only" role="region" aria-label="Chart data in text format">
  <h2>Astrological Chart - Text Description</h2>
  <h3>Planetary Positions</h3>
  <ul>
    <li>Sun in aries at 15°30' in House 1</li>
    <li>Moon in taurus at 20°45' in House 2</li>
    <li>Mercury in aries at 5°15' in House 1 (retrograde)</li>
  </ul>
  <h3>Aspects</h3>
  <ul>
    <li>Sun trine Moon (120°0')</li>
  </ul>
  <h3>House Cusps</h3>
  <ul>
    <li>House 1: aries 0°0'</li>
    <li>House 2: taurus 30°0'</li>
  </ul>
</div>
```

## Keyboard Navigation

### Interactive Mode
When `interactive={true}`:

1. **Tab to chart**: Focus moves to first planet
2. **Tab through planets**: Each planet receives focus in order
3. **Tab through aspects**: After planets, aspects receive focus
4. **Enter or Space**: Activates clicked planet/aspect
5. **Shift+Tab**: Reverse navigation order

### Non-Interactive Mode
When `interactive={false}`:

- Chart is not keyboard focusable
- No tabindex attributes
- Used for display-only scenarios

## Color Contrast

### Planet Symbols
- **Foreground**: White (#FFFFFF) on colored circles
- **Background**: Planet-specific colors
- **Contrast Ratio**: Meets WCAG AA (4.5:1 minimum)

### Aspect Lines
- **Colors**: Red, green, blue, orange, purple
- **Contrast**: All aspect colors meet 3:1 minimum for UI components

### Legend
- **Text**: Gray-600 (#4B5563) on white
- **Contrast Ratio**: 7.5:1 (WCAG AAA compliant)

## Testing Checklist

### Automated Testing
- [x] axe-core scan passes
- [x] No ARIA violations
- [x] No color contrast failures
- [x] All interactive elements focusable

### Manual Testing
- [x] Keyboard navigation works
- [x] Screen reader announces all elements
- [x] Text alternative is complete
- [x] Focus indicators are visible

### Screen Reader Testing
- [x] NVDA announces correctly
- [x] JAWS announces correctly
- [x] VoiceOver announces correctly
- [x] TalkBack announces correctly

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | Full    |
| Firefox | 88+     | Full    |
| Safari  | 14+     | Full    |
| Edge    | 90+     | Full    |

## Known Limitations

1. **Dynamic Updates**: If chart data changes, screen reader may not announce updates automatically
   - **Workaround**: User can navigate to text alternative for updated information

2. **Complex Aspects**: Many aspect lines may be difficult to navigate
   - **Workaround**: Text alternative provides complete aspect list

3. **Visual Patterns**: Color coding of aspects may not be perceivable
   - **Workaround**: All aspects include text labels with aspect type

## Future Improvements

1. **Live Regions**: Add aria-live regions for dynamic chart updates
2. **Expanded Descriptions**: More detailed interpretations of positions
3. **Audio Descriptions**: Optional audio explanation of chart
4. **Braille Support**: Enhanced output for braille displays
5. **High Contrast Mode**: Improved visibility in high contrast themes

## Resources

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [ARIA SVG Best Practices](https://www.w3.org/TR/svg-aam-1.0/)
- [Accessible Chart Patterns](https://www.w3.org/WAI/tutorials/images/complex/)
- [Screen Reader Testing Guide](https://webaim.org/articles/screenreader_testing/)

## Support

For accessibility issues or questions:
1. Check this documentation
2. Review the accessibility test file: `ChartWheel.accessibility.test.tsx`
3. Test with screen reader using provided test data
4. File accessibility bug with detailed reproduction steps
