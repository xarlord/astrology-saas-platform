/**
 * Chart Create Page Component
 */

import { AppLayout } from '../components';

export default function ChartCreatePage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Natal Chart</h2>
      </div>

      <div className="max-w-2xl mx-auto card">
        <h3 className="text-xl font-bold mb-6">Birth Information</h3>

        <form className="space-y-6">
          <div>
            <label htmlFor="chart-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chart Name
            </label>
            <input
              id="chart-name"
              type="text"
              className="input"
              placeholder="My Natal Chart"
              defaultValue="Natal Chart"
            />
          </div>

          <div>
            <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Date
            </label>
            <input id="birth-date" type="date" className="input" required />
          </div>

          <div>
            <label htmlFor="birth-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Time
            </label>
            <input id="birth-time" type="time" className="input" required />
            <p className="mt-1 text-sm text-gray-500">
              Exact time needed for accurate house calculations
            </p>
          </div>

          <div>
            <label htmlFor="birth-place" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Birth Place
            </label>
            <input
              id="birth-place"
              type="text"
              className="input"
              placeholder="Search city or enter coordinates"
              required
            />
          </div>

          <div>
            <label htmlFor="house-system" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              House System
            </label>
            <select id="house-system" className="input">
              <option value="placidus">Placidus</option>
              <option value="koch">Koch</option>
              <option value="porphyry">Porphyry</option>
              <option value="whole">Whole Sign</option>
            </select>
          </div>

          <div>
            <label htmlFor="zodiac-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zodiac Type
            </label>
            <select id="zodiac-type" className="input">
              <option value="tropical">Tropical</option>
              <option value="sidereal">Sidereal (Fagan-Bradley)</option>
              <option value="sidereal-lahiri">Sidereal (Lahiri)</option>
            </select>
          </div>

          <button type="submit" className="w-full btn-primary">
            Generate Chart
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
