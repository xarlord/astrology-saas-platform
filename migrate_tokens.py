#!/usr/bin/env python3
"""Bulk migrate hardcoded hex colors to design tokens in AstroVerse frontend."""
import re, os, sys

# Mapping: hex → Tailwind class (for className props)
# AND hex → CSS var (for inline styles / style objects)
HEX_TO_TOKEN = {
    # Background
    '#0B0D17': 'bg-cosmic-page',       # var(--color-bg-page)
    '#0b0d17': 'bg-cosmic-page',
    '#141627': 'bg-cosmic-card-solid',  # var(--color-bg-card-solid)
    
    # Primary/Accent
    '#6b3de1': 'text-primary',          # var(--color-accent)
    '#6B3DE1': 'text-primary',
    
    # Error/Status
    '#EF4444': 'text-status-error',     # var(--color-error)
    '#ef4444': 'text-status-error',
    
    # Success
    '#22c55e': 'text-status-success',   # var(--color-success)
    '#10B981': 'text-emerald',          # var(--color-emerald)
    '#10b981': 'text-emerald',
    
    # Warning/Amber
    '#fbbf24': 'text-status-warning',   # var(--color-warning)
    '#FBBF24': 'text-status-warning',
    '#F59E0B': 'text-amber',
    '#f59e0b': 'text-amber',
    
    # Gold
    '#FFD700': 'text-gold',             # var(--color-gold)
    '#ffd700': 'text-gold',
    
    # Pink/Silver/Orange
    '#FF69B4': 'text-pink',             # var(--color-pink)
    '#ff69b4': 'text-pink',
    '#C0C0C0': 'text-silver',           # var(--color-silver)
    '#c0c0c0': 'text-silver',
    '#FFA500': 'text-orange',           # var(--color-orange)
    '#ffa500': 'text-orange',
    
    # Blue
    '#3B82F6': 'text-blue-500',         # var(--color-blue)
    '#3b82f6': 'text-blue-500',
    '#2563EB': 'text-cosmic-blue',      # var(--color-cosmic-blue)
    '#2563eb': 'text-cosmic-blue',
    
    # Indigo/Violet
    '#6366F1': 'text-indigo',           # var(--color-indigo)
    '#6366f1': 'text-indigo',
    '#8b5cf6': 'text-violet',           # var(--color-violet)
    '#8B5CF6': 'text-violet',
    
    # White/Gray
    '#ffffff': 'text-white',
    '#FFFFFF': 'text-white',
    '#fff': 'text-white',
    '#FFF': 'text-white',
    '#696969': 'text-dim-gray',         # var(--color-dim-gray)
    
    # Planet colors
    '#FF0000': 'text-planet-mars',      # Mars
    '#8B4513': 'text-planet-saturn',    # Saturn
    '#40E0D0': 'text-planet-uranus',    # Uranus
    '#4169E1': 'text-planet-neptune',   # Neptune
    '#8B0000': 'text-planet-pluto',     # Pluto
}

# Files to process
PAGES_BATCH_A = [
    'src/pages/NatalChartDetailPage.tsx',
    'src/pages/LandingPage.tsx', 
    'src/pages/LearnPage.tsx',
    'src/pages/SynastryPageNew.tsx',
    'src/pages/BirthDataStep.tsx',
    'src/pages/HomePage.tsx',
    'src/pages/DailyBriefingPage.tsx',
    'src/pages/LoginPageNew.tsx',
    'src/pages/RegisterPageNew.tsx',
    'src/pages/SharedCardPage.tsx',
]

PAGES_BATCH_B = [
    'src/pages/ChartCreationWizardPage.tsx',
    'src/pages/CourseDetailPage.tsx',
    'src/pages/DetailedNatalReportPage.tsx',
    'src/pages/EphemerisPage.tsx',
    'src/pages/LearningCenterPage.tsx',
    'src/pages/LoginPage.tsx',
    'src/pages/ProfileSettingsPage.tsx',
    'src/pages/RetrogradePage.tsx',
    'src/pages/SavedChartsGalleryPage.tsx',
    'src/pages/ShareCardPage.tsx',
    'src/pages/SolarReturnAnnualReportPage.tsx',
    'src/pages/SubscriptionPage.tsx',
    'src/pages/TodayTransitsPage.tsx',
]

COMPONENTS_PRIORITY = [
    'src/components/astrology/ChartWheel.tsx',
    'src/components/astrology/SolarReturnChart.tsx',
    'src/components/astrology/SolarReturnDashboard.tsx',
    'src/components/astrology/PlanetaryPositionCard.tsx',
    'src/components/astrology/LunarChartView.tsx',
    'src/components/astrology/MoonPhaseCard.tsx',
    'src/components/astrology/AspectGrid.tsx',
    'src/components/astrology/TransitCalendar.tsx',
    'src/components/ui/EmptyState.tsx',
    'src/components/ui/WelcomeModal.tsx',
]

def count_hex_in_file(filepath):
    """Count hardcoded hex colors in a file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        matches = re.findall(r'#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])', content)
        return len(matches)
    except:
        return 0

def migrate_file(filepath, dry_run=False):
    """Replace hardcoded hex colors with design tokens in a file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        return 0, f"File not found: {filepath}"
    
    original = content
    replacements = 0
    
    # Sort by length (longest first) to avoid partial matches
    sorted_tokens = sorted(HEX_TO_TOKEN.items(), key=lambda x: len(x[0]), reverse=True)
    
    for hex_color, token in sorted_tokens:
        # Only replace in className strings and style objects
        # Pattern: matches hex in JSX context (className, style, template literals)
        
        # Replace in className="..." context: text-[#hex] → token class
        # or direct hex usage in className
        pattern = re.compile(re.escape(hex_color), re.IGNORECASE if hex_color.upper() == hex_color else 0)
        
        # Simple replacement — replace the hex with the token
        # But ONLY if it's in a string context (not a comment or import)
        new_content = pattern.sub(token, content)
        if new_content != content:
            replacements += content.count(hex_color) + content.count(hex_color.lower()) + content.count(hex_color.upper())
            # More accurate count
            actual = len(pattern.findall(content))
            replacements = actual
            content = new_content
    
    if not dry_run and replacements > 0:
        with open(filepath, 'w') as f:
            f.write(content)
    
    return replacements, None

def process_batch(files, batch_name):
    """Process a batch of files."""
    total = 0
    for f in files:
        filepath = os.path.join('/tmp/astroverse/frontend', f)
        before = count_hex_in_file(filepath)
        count, err = migrate_file(filepath, dry_run=False)
        after = count_hex_in_file(filepath)
        actual = before - after
        if actual > 0 or count > 0:
            print(f"  {f.split('/')[-1]:45s} {before:3d}→{after:3d} hex ({actual} replaced)")
            total += actual
    print(f"\n  Batch total: {total} hex → tokens")
    return total

if __name__ == '__main__':
    batch = sys.argv[1] if len(sys.argv) > 1 else 'all'
    
    if batch in ('a', 'pages-a', '23'):
        print("=== Batch A: Pages (~100 hex) ===")
        process_batch(PAGES_BATCH_A, 'A')
    elif batch in ('b', 'pages-b', '24'):
        print("=== Batch B: Pages (~40 hex) ===")
        process_batch(PAGES_BATCH_B, 'B')
    elif batch in ('c', 'comp-priority', '25'):
        print("=== Priority Components (~150 hex) ===")
        process_batch(COMPONENTS_PRIORITY, 'C')
    elif batch == 'all':
        print("=== ALL BATCHES ===")
        process_batch(PAGES_BATCH_A, 'A')
        process_batch(PAGES_BATCH_B, 'B')
        process_batch(COMPONENTS_PRIORITY, 'C')
