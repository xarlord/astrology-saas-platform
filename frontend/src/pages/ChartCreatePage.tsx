/**
 * Chart Create Page Component
 */

export default function ChartCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold mt-4">Create Natal Chart</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto card">
          <h2 className="text-xl font-bold mb-6">Birth Information</h2>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="My Natal Chart"
                defaultValue="Natal Chart"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birth Date
              </label>
              <input type="date" className="input" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birth Time
              </label>
              <input type="time" className="input" required />
              <p className="mt-1 text-sm text-gray-500">
                Exact time needed for accurate house calculations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birth Place
              </label>
              <input
                type="text"
                className="input"
                placeholder="Search city or enter coordinates"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                House System
              </label>
              <select className="input">
                <option value="placidus">Placidus</option>
                <option value="koch">Koch</option>
                <option value="porphyry">Porphyry</option>
                <option value="whole">Whole Sign</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zodiac Type
              </label>
              <select className="input">
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
      </main>
    </div>
  );
}
