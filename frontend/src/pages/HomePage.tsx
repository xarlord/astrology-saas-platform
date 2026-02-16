/**
 * Home Page Component
 */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-display font-bold mb-6">
            Discover Your Cosmic Blueprint
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Generate accurate natal charts, explore personality insights, and receive personalized forecasts
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/register" className="btn-primary bg-white text-primary-600 hover:bg-primary-50">
              Get Started Free
            </a>
            <a href="/login" className="btn-primary bg-transparent border-2 border-white hover:bg-white/10">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Natal Charts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                High-precision calculations using Swiss Ephemeris
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-bold mb-2">Personality Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Deep analysis of planetary positions and aspects
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-xl font-bold mb-2">Transit Forecasts</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time predictions with guidance and advice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2026 Astrology SaaS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
