import React from 'react';
import { Link } from 'react-router-dom';
import { PublicPageLayout } from '../components/PublicPageLayout';
import { staticPages } from '../data/staticPages';

import { Helmet } from 'react-helmet-async';

interface StaticPageProps {
  pageKey: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageKey }) => {
  const pageData = staticPages[pageKey];

  if (!pageData) {
    return (
      <PublicPageLayout>
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-slate-200 mb-6">
            The page you are looking for does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout hideAuthLinks>
      <Helmet>
        <title>{pageData.title} — AstroVerse</title>
        <meta name="description" content={pageData.description} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            {pageData.icon && (
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary" aria-hidden="true">
                {pageData.icon}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {pageData.title}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
            {pageData.description}
          </p>
          <div className="mt-6 h-px bg-white/[0.08]" />
        </header>

        <div className="space-y-8 sm:space-y-10">
          {pageData.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">
                {section.heading}
              </h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.08]">
          <Link
            to="/"
            className="text-sm text-violet-300 hover:text-violet-200 hover:underline transition-colors"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </PublicPageLayout>
  );
};

export default StaticPage;
