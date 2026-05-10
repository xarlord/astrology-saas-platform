#!/usr/bin/env python3
"""Migrate Tailwind arbitrary hex values to semantic design tokens.

Replaces patterns like:
  bg-[#141627]        → bg-cosmic-card-solid
  bg-[#141627]/70     → bg-cosmic-card-solid/70
  text-[#6b3de1]      → text-primary
  via-[#0B0D17]/50    → via-cosmic-page/50
  ring-offset-[#141627] → ring-offset-cosmic-card-solid
"""
import re, os, sys

# Hex → Tailwind token mapping
HEX_MAP = {
    # BG surfaces
    '0B0D17': 'cosmic-page',
    '141627': 'cosmic-card-solid',
    '151725': 'cosmic-hover',
    '1e2136': 'cosmic-active',
    '3d3460': 'cosmic-border',
    
    # Primary
    '6b3de1': 'primary',
    '6B3DE1': 'primary',
    
    # Blue
    '2563EB': 'cosmic-blue',
    '3B82F6': 'blue-500',
    '3b82f6': 'blue-500',
    '38bdf8': 'blue-400',
    
    # Status
    'EF4444': 'status-error',
    'ef4444': 'status-error',
    '22c55e': 'status-success',
    '10B981': 'emerald-500',
    'fbbf24': 'status-warning',
    'FBBF24': 'status-warning',
    'F59E0B': 'amber-500',
    'f59e0b': 'amber-500',
    
    # Accent colors
    'FFD700': 'gold',
    'ffd700': 'gold',
    'FF69B4': 'pink-400',
    'ff69b4': 'pink-400',
    'C0C0C0': 'silver',
    'c0c0c0': 'silver',
    'FFA500': 'orange',
    'ffa500': 'orange',
    '6366F1': 'indigo-500',
    '6366f1': 'indigo-500',
    '8b5cf6': 'violet-500',
    '8B5CF6': 'violet-500',
    '696969': 'dim-gray',
    
    # Planet colors
    'FF0000': 'planet-mars',
    '8B4513': 'planet-saturn',
    '40E0D0': 'planet-uranus',
    '4169E1': 'planet-neptune',
    '8B0000': 'planet-pluto',
}

# Also handle direct hex in inline styles and other contexts
# Pattern: any Tailwind arbitrary value with hex
ARBITRARY_HEX = re.compile(r'(\w+-)?\[(#[0-9a-fA-F]{3,8})(/[\d.]+)?\]')

def replace_arbitrary_hex(match):
    """Replace a single Tailwind arbitrary hex value with a semantic token."""
    prefix = match.group(1) or ''  # e.g., 'bg-', 'text-', 'via-'
    hex_val = match.group(2).lstrip('#')  # e.g., '141627'
    opacity = match.group(3) or ''  # e.g., '/70'
    
    # Try case-insensitive lookup
    token = HEX_MAP.get(hex_val) or HEX_MAP.get(hex_val.upper()) or HEX_MAP.get(hex_val.lower())
    
    if token:
        return f'{prefix}{token}{opacity}'
    return match.group(0)  # No replacement found, keep original

def migrate_file(filepath):
    """Migrate a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
    except (OSError, ValueError):
        return 0
    
    new_content = ARBITRARY_HEX.sub(replace_arbitrary_hex, content)
    
    if new_content != content:
        count = sum(1 for _ in ARBITRARY_HEX.finditer(content))
        with open(filepath, 'w') as f:
            f.write(new_content)
        return count
    return 0

def main():
    frontend = '/tmp/astroverse/frontend'
    
    # All TSX files
    files = []
    for root, dirs, filenames in os.walk(os.path.join(frontend, 'src')):
        for fn in filenames:
            if fn.endswith('.tsx') or fn.endswith('.ts'):
                files.append(os.path.join(root, fn))
    
    total = 0
    changed = 0
    for f in sorted(files):
        count = migrate_file(f)
        if count > 0:
            rel = os.path.relpath(f, frontend)
            print(f"  {rel:55s} {count} replacements")
            total += count
            changed += 1
    
    print(f"\n  Total: {total} arbitrary hex values → tokens in {changed} files")

if __name__ == '__main__':
    main()
