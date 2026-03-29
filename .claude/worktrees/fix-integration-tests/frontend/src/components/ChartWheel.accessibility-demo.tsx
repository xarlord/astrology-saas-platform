/**
 * ChartWheel Accessibility Demo
 *
 * This page demonstrates all accessibility features of the ChartWheel component.
 * Test with screen readers and keyboard navigation.
 */

import { useState } from 'react';
import { ChartWheel, ChartWheelLegend, ChartData } from './ChartWheel';

// Sample chart data for demonstration
const demoChartData: ChartData = {
  planets: [
    {
      planet: 'sun',
      sign: 'aries',
      degree: 15,
      minute: 30,
      second: 0,
      house: 1,
      retrograde: false,
      latitude: 0,
      longitude: 15.5,
      speed: 1,
    },
    {
      planet: 'moon',
      sign: 'taurus',
      degree: 20,
      minute: 45,
      second: 0,
      house: 2,
      retrograde: false,
      latitude: 5,
      longitude: 50.75,
      speed: 12,
    },
    {
      planet: 'mercury',
      sign: 'aries',
      degree: 5,
      minute: 15,
      second: 0,
      house: 1,
      retrograde: true,
      latitude: -2,
      longitude: 5.25,
      speed: -1,
    },
    {
      planet: 'venus',
      sign: 'pisces',
      degree: 28,
      minute: 10,
      second: 0,
      house: 12,
      retrograde: false,
      latitude: 1,
      longitude: 358.17,
      speed: 1.2,
    },
    {
      planet: 'mars',
      sign: 'gemini',
      degree: 12,
      minute: 30,
      second: 0,
      house: 3,
      retrograde: false,
      latitude: 2,
      longitude: 72.5,
      speed: 0.8,
    },
  ],
  houses: [
    { house: 1, sign: 'aries', degree: 0, minute: 0, second: 0 },
    { house: 2, sign: 'taurus', degree: 30, minute: 0, second: 0 },
    { house: 3, sign: 'gemini', degree: 60, minute: 0, second: 0 },
    { house: 4, sign: 'cancer', degree: 90, minute: 0, second: 0 },
    { house: 5, sign: 'leo', degree: 120, minute: 0, second: 0 },
    { house: 6, sign: 'virgo', degree: 150, minute: 0, second: 0 },
    { house: 7, sign: 'libra', degree: 180, minute: 0, second: 0 },
    { house: 8, sign: 'scorpio', degree: 210, minute: 0, second: 0 },
    { house: 9, sign: 'sagittarius', degree: 240, minute: 0, second: 0 },
    { house: 10, sign: 'capricorn', degree: 270, minute: 0, second: 0 },
    { house: 11, sign: 'aquarius', degree: 300, minute: 0, second: 0 },
    { house: 12, sign: 'pisces', degree: 330, minute: 0, second: 0 },
  ],
  aspects: [
    {
      planet1: 'sun',
      planet2: 'moon',
      type: 'trine',
      degree: 120,
      minute: 0,
      orb: 5,
      applying: true,
      separating: false,
    },
    {
      planet1: 'mercury',
      planet2: 'mars',
      type: 'sextile',
      degree: 60,
      minute: 0,
      orb: 3,
      applying: true,
      separating: false,
    },
    {
      planet1: 'venus',
      planet2: 'mars',
      type: 'square',
      degree: 90,
      minute: 0,
      orb: 2,
      applying: false,
      separating: true,
    },
  ],
};

export function ChartWheelAccessibilityDemo() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ChartWheel Accessibility Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Demonstrating WCAG 2.1 AA compliance for astrological chart visualization
          </p>
        </header>

        {/* Accessibility Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How to Test Accessibility
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Screen Reader Testing
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <strong>NVDA/JAWS:</strong> Navigate with arrow keys, listen to announcements
                </li>
                <li>
                  <strong>VoiceOver:</strong> Swipe right/left to navigate through elements
                </li>
                <li>
                  <strong>TalkBack:</strong> Swipe to explore, double-tap to activate
                </li>
                <li className="text-sm italic">
                  Look for "Sun in aries at 15°30' in House 1" style announcements
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Keyboard Navigation Testing
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <strong>Tab:</strong> Move focus between planets and aspects
                </li>
                <li>
                  <strong>Enter/Space:</strong> Activate selected element
                </li>
                <li>
                  <strong>Shift+Tab:</strong> Navigate backwards
                </li>
                <li className="text-sm italic">
                  Watch for visible focus indicators on planet circles and aspect lines
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Interactive Controls
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isInteractive}
                onChange={(e) => setIsInteractive(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Enable Interaction</span>
            </label>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isInteractive
              ? 'Interactive mode: Tab to navigate planets and aspects, press Enter/Space to click'
              : 'Static mode: Chart is display-only'}
          </p>
        </div>

        {/* Chart Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Astrological Chart Wheel
          </h2>

          {selectedPlanet && (
            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-indigo-900 dark:text-indigo-300">
                Selected: <strong>{selectedPlanet}</strong>
              </p>
            </div>
          )}

          {selectedAspect && (
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-purple-900 dark:text-purple-300">
                Aspect: <strong>{selectedAspect}</strong>
              </p>
            </div>
          )}

          <ChartWheel
            data={demoChartData}
            size={600}
            interactive={isInteractive}
            onPlanetClick={(planet) => {
              setSelectedPlanet(`Planet: ${planet}`);
              setTimeout(() => setSelectedPlanet(null), 3000);
            }}
            onAspectClick={(aspect) => {
              setSelectedAspect(
                `Aspect: ${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.degree}°${aspect.minute}')`
              );
              setTimeout(() => setSelectedAspect(null), 3000);
            }}
          />
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Chart Legend
          </h2>
          <ChartWheelLegend />
        </div>

        {/* Accessibility Features Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Accessibility Features Implemented
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                WCAG 2.1 AA Compliance
              </h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>✓ role="img" on SVG element</li>
                <li>✓ Descriptive aria-label for chart</li>
                <li>✓ aria-describedby linking to description</li>
                <li>✓ Text-based alternative (sr-only)</li>
                <li>✓ Keyboard accessible (tabindex, Enter/Space)</li>
                <li>✓ Semantic HTML structure</li>
                <li>✓ ARIA labels on all interactive elements</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Screen Reader Support
              </h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>✓ NVDA compatible</li>
                <li>✓ JAWS compatible</li>
                <li>✓ VoiceOver compatible</li>
                <li>✓ TalkBack compatible</li>
                <li>✓ Planet announcements with position details</li>
                <li>✓ Aspect announcements with both planets</li>
                <li>✓ Zodiac sign announcements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            ChartWheel Component - WCAG 2.1 AA Compliant |{' '}
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              WCAG Guidelines
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
