/**
 * Analysis Page Component
 */

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href={`/charts/${'chartId'}`} className="text-primary-600 hover:text-primary-700">
            ← Back to Chart
          </a>
          <h1 className="text-2xl font-bold mt-4">Personality Analysis</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">Analysis content loading...</p>
        </div>
      </main>
    </div>
  );
}
