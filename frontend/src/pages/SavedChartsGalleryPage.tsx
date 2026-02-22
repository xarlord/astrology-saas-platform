/**
 * SavedChartsGalleryPage Component
 *
 * Gallery view of saved charts with:
 * - Sidebar navigation folders (All Charts, Personal, Clients, etc.)
 * - Actions bar (search, sort, grid/list view toggle)
 * - Gallery grid of chart cards
 * - Empty state
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCharts } from '../hooks/useCharts';
import { Button } from '../components/ui/Button';
import { ChartCard } from '../components/chart/ChartCard';
import type { Chart } from '../services/api.types';

type ViewMode = 'grid' | 'list';
type SortBy = 'dateAdded' | 'name' | 'sign';
type FilterFolder = 'all' | 'personal' | 'clients' | 'relationships' | 'favorites';

export const SavedChartsGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { charts, isLoading, deleteChart } = useCharts();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('dateAdded');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<FilterFolder>('all');

  // Filter charts by folder and search
  const filteredCharts = useMemo(() => {
    let filtered = [...charts];

    // Apply folder filter
    if (activeFolder !== 'all') {
      filtered = filtered.filter((chart) => {
        const tags = chart.tags ?? [];
        switch (activeFolder) {
          case 'personal':
            return tags.includes('Self') || tags.includes('Personal');
          case 'clients':
            return tags.includes('Client') || tags.includes('Clients');
          case 'relationships':
            return tags.includes('Family') || tags.includes('Friends') || tags.includes('Relationship');
          case 'favorites':
            return tags.includes('Favorite') || tags.includes('Default');
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chart) =>
          chart.name.toLowerCase().includes(query) ||
          (chart.birthData?.birthPlace?.toLowerCase().includes(query) ??
          chart.tags?.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sign': {
          const getSunSign = (chart: Chart) => {
            const sun = chart.positions?.find(p => p.name.toLowerCase() === 'sun');
            return sun?.sign ?? '';
          };
          const aSign = getSunSign(a);
          const bSign = getSunSign(b);
          return aSign.localeCompare(bSign);
        }
        case 'dateAdded':
        default:
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
    });

    return filtered;
  }, [charts, activeFolder, searchQuery, sortBy]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteChart(id);
    },
    [deleteChart]
  );

  const handleShare = useCallback((id: string) => {
    // Implement share functionality
    console.log('Share chart:', id);
  }, []);

  const folders = [
    { id: 'all' as FilterFolder, label: 'All Charts', icon: 'folder_shared' },
    { id: 'personal' as FilterFolder, label: 'Personal', icon: 'person' },
    { id: 'clients' as FilterFolder, label: 'Clients', icon: 'work' },
    { id: 'relationships' as FilterFolder, label: 'Relationships', icon: 'favorite' },
    { id: 'favorites' as FilterFolder, label: 'Favorites', icon: 'star' },
  ];

  const sortOptions = [
    { value: 'dateAdded' as SortBy, label: 'Date Added' },
    { value: 'name' as SortBy, label: 'A-Z' },
    { value: 'sign' as SortBy, label: 'Sign' },
  ];

  // Calculate storage usage
  const storageUsed = charts.length;
  const storageLimit = 100;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-card-dark/80 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-cosmic-blue rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">AstroVerse</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="/dashboard"
              className="hover:text-primary transition-colors text-slate-300"
            >
              Dashboard
            </a>
            <a className="hover:text-primary transition-colors text-slate-300">Horoscopes</a>
            <a className="text-primary">Saved Charts</a>
            <a
              href="/synastry"
              className="hover:text-primary transition-colors text-slate-300"
            >
              Compatibility
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="w-10 h-10 rounded-full border-2 border-primary/50 overflow-hidden cursor-pointer bg-primary/20 flex items-center justify-center"
              onClick={() => navigate('/profile')}
            >
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 max-w-[1440px] mx-auto px-6 lg:px-12 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 gap-8 sticky top-24 h-fit">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-4 mb-2">
              Library Folders
            </h3>
            <nav className="flex flex-col gap-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                    activeFolder === folder.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'
                  )}
                >
                  <span className="material-symbols-outlined text-xl">{folder.icon}</span>
                  <span className={clsx('font-medium', activeFolder === folder.id && 'font-semibold')}>
                    {folder.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Storage Usage */}
          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cosmic-blue/20 border border-primary/20">
            <p className="text-sm font-medium text-slate-200 mb-2">Storage Usage</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-primary to-cosmic-blue transition-all"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
              {storageUsed} of {storageLimit} Charts Saved
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gold text-3xl">
                  collections_bookmark
                </span>
                <h2 className="text-4xl font-bold tracking-tight text-slate-100">
                  My Cosmic Library
                </h2>
              </div>
              <p className="text-slate-400 text-lg">Manage and explore your collection of birth charts</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/charts/create')}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Add New Chart
            </Button>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
            <div className="flex-1 min-w-[300px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a chart..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-2.5 text-slate-200 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5">
                <span className="text-sm text-slate-400 font-medium whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-transparent border-none text-sm font-bold text-slate-200 focus:ring-0 p-0 pr-8 cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-slate-800 text-primary' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-slate-800 text-primary' : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <span className="material-symbols-outlined">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading your charts...</p>
              </div>
            </div>
          ) : filteredCharts.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-600">folder_open</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">No charts found</h3>
                <p className="text-slate-400 mb-6">
                  {searchQuery
                    ? `No charts match "${searchQuery}"`
                    : activeFolder !== 'all'
                    ? `No charts in ${folders.find((f) => f.id === activeFolder)?.label?.toLowerCase()}`
                    : 'Get started by creating your first birth chart'}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/charts/create')}
                  className="flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Your First Chart
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                'gap-6',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col'
              )}
            >
              {filteredCharts.map((chart) => (
                <ChartCard
                  key={chart.id}
                  chart={chart}
                  onDelete={(id) => { void handleDelete(id); }}
                  onShare={handleShare}
                  className={viewMode === 'list' ? 'w-full' : ''}
                />
              ))}

              {/* Add New Chart Card */}
              <button
                onClick={() => navigate('/charts/create')}
                className={clsx(
                  'group relative bg-transparent rounded-2xl border-2 border-dashed border-slate-700 p-6',
                  'flex flex-col items-center justify-center',
                  'hover:border-primary/50 hover:bg-primary/5 transition-all',
                  'cursor-pointer',
                  viewMode === 'list' ? 'w-full min-h-[200px]' : 'min-h-[320px]'
                )}
              >
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all mb-4">
                  <span className="material-symbols-outlined text-4xl">add</span>
                </div>
                <p className="text-slate-100 font-bold text-lg">Create New Chart</p>
                <p className="text-slate-500 text-sm mt-1 text-center max-w-[200px]">
                  Start a new cosmic journey with a birth chart
                </p>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedChartsGalleryPage;
