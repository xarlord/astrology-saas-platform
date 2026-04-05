# [ADR-002] Astronomy Engine over Swiss Ephemeris

## Status

Accepted

## Context

AstroVerse requires real astronomical calculations for planetary positions, house cusps, and transit arcs. The two leading libraries are:

- **Swiss Ephemeris** (via `sweph` Node bindings) -- industry-standard for professional astrology, sub-arcsecond accuracy, but licensed AGPL with a $850 commercial license buyout.
- **Astronomy Engine** (MIT) -- pure JS/TypeScript library with approximately 1 arcminute accuracy, no native binary dependencies.

For natal chart interpretation and transit forecasting, 1 arcminute precision maps to roughly 4 seconds of birth-time uncertainty -- well within the tolerance of typical user-supplied birth data.

## Decision

Adopt **Astronomy Engine** (MIT license) as the primary calculation engine. Retain Swiss Ephemeris as an optional fallback via `swissEphemeris.service.ts` for users who require higher precision (future premium tier).

## Consequences

- **Positive**: Zero licensing cost (60x savings vs. Swiss Ephemeris commercial license). No native `.se1` data files to deploy. Simpler Docker images and CI pipeline. MIT license imposes no copyleft obligations.
- **Negative**: Lower positional accuracy (~1 arcminute vs. sub-arcsecond). Some advanced sidereal or harmonic techniques may need additional correction. Premium users expecting Swiss Ephemeris-grade precision will need the optional fallback path.

*Last updated: 2026-04-05*
