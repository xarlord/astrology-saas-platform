import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { staticPages } from '../data/staticPages';

interface StaticPageProps {
  pageKey: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageKey }) => {
  const pageData = staticPages[pageKey];

  if (!pageData) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-400 mb-6">
            The page you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {pageData.title}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            {pageData.description}
          </p>
          <div className="mt-6 h-px bg-white/[0.08]" />
        </header>

        <div className="space-y-10">
          {pageData.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-semibold text-white mb-3">
                {section.heading}
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-white/[0.08]">
          <Link
            to="/"
            className="text-sm text-violet-300 hover:text-violet-200 hover:underline transition-colors"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </AppLayout>
  );
};

export default StaticPage;
