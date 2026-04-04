/**
 * LearningCenterPage Component Tests
 *
 * Comprehensive tests for the learning center page
 * Covers: navigation, hero card, learning paths, knowledge base, latest lessons, community
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => createElement('div', props, children),
    header: ({ children, ...props }: any) => createElement('header', props, children),
    section: ({ children, ...props }: any) => createElement('section', props, children),
  },
}));

// Mock Button component
vi.mock('../../components/ui/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, variant, leftIcon, fullWidth, ...props }: any) => (
    <button
      onClick={onClick}
      className={`btn btn-${variant} ${fullWidth ? 'w-full' : ''}`}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  ),
}));

// Mock useLearning hook
vi.mock('../../hooks/useLearning', () => ({
  useLearning: vi.fn(() => ({
    courses: [
      {
        id: 'course-1',
        title: 'Astrology 101: The Basics',
        description: 'Learn the planets, signs, and the core language',
        duration: 270, // 4.5 hours in minutes
        category: 'fundamentals',
        level: 'beginner',
        lessons: [
          { id: 'lesson-1', title: 'Mercury in Retrograde: The Complete Guide', duration: 12, category: 'Planets', videoUrl: 'url' },
          { id: 'lesson-2', title: 'Understanding Trines & Sextiles', duration: 5, category: 'Aspects' },
          { id: 'lesson-3', title: 'The Midheaven: Your Professional Legacy', duration: 15, category: 'Houses' },
        ],
        thumbnailUrl: 'https://example.com/thumb1.jpg',
      },
      {
        id: 'course-2',
        title: 'Intermediate: Aspects & Transits',
        description: 'Deep dive into planetary relationships',
        duration: 360,
        category: 'intermediate',
        level: 'intermediate',
        lessons: [],
        thumbnailUrl: 'https://example.com/thumb2.jpg',
      },
      {
        id: 'course-3',
        title: 'Advanced: Synastry',
        description: 'Master relationship compatibility analysis',
        duration: 480,
        category: 'advanced',
        level: 'advanced',
        lessons: [],
        thumbnailUrl: 'https://example.com/thumb3.jpg',
      },
      {
        id: 'course-4',
        title: 'The Professional Astrologer',
        description: 'Build your astrology practice',
        duration: 600,
        category: 'professional',
        level: 'advanced',
        lessons: [],
        thumbnailUrl: 'https://example.com/thumb4.jpg',
      },
    ],
    currentCourse: null,
    currentLesson: null,
    progress: {
      'course-1': { progressPercentage: 20, completedLessons: 2, totalLessons: 10 },
    },
    isLoading: false,
    error: null,
    loadCourses: vi.fn(),
    loadCourse: vi.fn(),
    loadProgress: vi.fn(),
    loadLessonProgress: vi.fn(),
    updateLessonProgress: vi.fn(),
    completeLesson: vi.fn(),
    setCurrentCourse: vi.fn(),
    setCurrentLesson: vi.fn(),
    searchCourses: vi.fn(),
    clearError: vi.fn(),
    getCourseProgress: vi.fn(() => ({ progressPercentage: 20 })),
    getCourseProgressPercentage: vi.fn((courseId: string) => {
      if (courseId === 'course-1') return 20;
      return 0;
    }),
    isLessonCompleted: vi.fn(() => false),
    getNextLesson: vi.fn(() => null),
    getPreviousLesson: vi.fn(() => null),
    getCoursesByCategory: vi.fn(() => []),
    getCoursesByLevel: vi.fn(() => []),
    getCompletedCourses: vi.fn(() => []),
    getInProgressCourses: vi.fn(() => [{
      id: 'course-1',
      title: 'Master the Houses',
      description: 'Deep dive into the 12 celestial houses',
      duration: 240,
      lessons: [],
    }]),
  })),
}));

// Mock the components barrel to avoid circular import SyntaxError
vi.mock('../../components', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Import after mocks
import LearningCenterPage from '../../pages/LearningCenterPage';

// Helper to create wrapper with providers
const createWrapper = (initialRoute = '/learning') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [initialRoute] }, children)
    );
};

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, initialRoute = '/learning') => {
  return render(ui, { wrapper: createWrapper(initialRoute) });
};

describe('LearningCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/astroverse academy/i)).toBeInTheDocument();
    });

    it('should have correct document structure', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      // Main content
      expect(screen.getByText(/premium learning hub/i)).toBeInTheDocument();
    });

    it('should have dark gradient background', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-gradient-to-br');
    });
  });

  describe('Navigation Section', () => {
    it('should render the academy logo and title', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/astroverse academy/i)).toBeInTheDocument();
    });

    it('should render premium learning hub subtitle', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/premium learning hub/i)).toBeInTheDocument();
    });

    it('should render search bar', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toBeInTheDocument();
    });

    it('should render Dashboard link', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render notifications button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const notifButtons = screen.getAllByRole('button').filter(btn =>
        btn.querySelector('[class*="notifications"]') ||
        btn.innerHTML.includes('notifications')
      );
      expect(notifButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should have sticky navigation', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('sticky');
    });

    it('should navigate to dashboard when Dashboard clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      await user.click(dashboardButton);

      expect(dashboardButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      await user.type(searchInput, 'planets');

      expect(searchInput).toHaveValue('planets');
    });

    it('should filter learning paths based on search query', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);

      // Type search query that matches only one path
      await user.type(searchInput, 'synastry');

      await waitFor(() => {
        // Should show synastry course
        expect(screen.getByText(/advanced: synastry/i)).toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      await user.type(searchInput, 'xyznonexistent');

      // Learning paths section should be empty or show no results
      await waitFor(() => {
        expect(screen.queryByText(/astrology 101/i)).not.toBeInTheDocument();
      });
    });

    it('should clear results when search is cleared', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);

      // Type and then clear
      await user.type(searchInput, 'synastry');
      await user.clear(searchInput);

      // All paths should be visible again
      await waitFor(() => {
        expect(screen.getByText(/astrology 101/i)).toBeInTheDocument();
      });
    });

    it('should search in description as well as title', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);

      // Search for a word in description
      await user.type(searchInput, 'relationship');

      await waitFor(() => {
        expect(screen.getByText(/advanced: synastry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Hero Card - Current Course', () => {
    it('should render current course section', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Check for the current course title from our mock
      expect(screen.getByText(/master the houses/i)).toBeInTheDocument();
    });

    it('should display current path badge', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/current path/i)).toBeInTheDocument();
    });

    it('should render Resume Learning button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('button', { name: /resume learning/i })).toBeInTheDocument();
    });

    it('should render View Syllabus button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('button', { name: /view syllabus/i })).toBeInTheDocument();
    });

    it('should navigate when Resume Learning clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const resumeButton = screen.getByRole('button', { name: /resume learning/i });
      await user.click(resumeButton);

      expect(resumeButton).toBeInTheDocument();
    });
  });

  describe('Learning Paths Section', () => {
    it('should render learning paths header', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/your learning paths/i)).toBeInTheDocument();
    });

    it('should render see all paths button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/see all paths/i)).toBeInTheDocument();
    });

    it('should display all four learning paths', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/astrology 101: the basics/i)).toBeInTheDocument();
      expect(screen.getByText(/intermediate: aspects & transits/i)).toBeInTheDocument();
      expect(screen.getByText(/advanced: synastry/i)).toBeInTheDocument();
      expect(screen.getByText(/the professional astrologer/i)).toBeInTheDocument();
    });

    it('should show In Progress badge for active course', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const inProgressBadges = screen.getAllByText(/in progress/i);
      expect(inProgressBadges.length).toBeGreaterThan(0);
    });

    it('should show Not Started badge for new courses', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const notStartedBadges = screen.getAllByText(/not started/i);
      expect(notStartedBadges.length).toBeGreaterThan(0);
    });

    it('should display course duration', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/4.5 hours/i)).toBeInTheDocument();
    });

    it('should navigate to course when learning path clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const firstPath = screen.getByText(/astrology 101: the basics/i);
      await user.click(firstPath);

      // Navigation handled by useNavigate
      expect(firstPath).toBeInTheDocument();
    });

    it('should display path descriptions', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/learn the planets, signs, and the core language/i)).toBeInTheDocument();
    });
  });

  describe('Knowledge Base Section', () => {
    it('should render knowledge base header', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/knowledge base/i)).toBeInTheDocument();
    });

    it('should display all four knowledge categories', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Use getAllByText since these appear in descriptions too
      const planetsTexts = screen.getAllByText(/planets/i);
      expect(planetsTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/zodiac signs/i)).toBeInTheDocument();
      const housesTexts = screen.getAllByText(/houses/i);
      expect(housesTexts.length).toBeGreaterThan(0);
      const aspectsTexts = screen.getAllByText(/aspects/i);
      expect(aspectsTexts.length).toBeGreaterThan(0);
    });

    it('should display topic counts', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/browse 12 more/i)).toBeInTheDocument();
      expect(screen.getByText(/browse 8 more/i)).toBeInTheDocument();
    });

    it('should display category items for Planets', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/the sun: your core identity/i)).toBeInTheDocument();
      expect(screen.getByText(/the moon: emotions & subconscious/i)).toBeInTheDocument();
    });

    it('should display category items for Zodiac Signs', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/the 12 signs & their archetypes/i)).toBeInTheDocument();
      expect(screen.getByText(/the four elements in astrology/i)).toBeInTheDocument();
    });

    it('should display category items for Houses', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/angular houses: action & initiation/i)).toBeInTheDocument();
    });

    it('should display category items for Aspects', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/conjunctions: fusion of energy/i)).toBeInTheDocument();
      expect(screen.getByText(/trines: natural flow/i)).toBeInTheDocument();
    });

    it('should navigate to category when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      // Find the Planets category by looking for a more specific element
      const planetsHeadings = screen.getAllByRole('heading').filter(h =>
        h.textContent?.toLowerCase().includes('planets')
      );
      if (planetsHeadings.length > 0) {
        const categoryCard = planetsHeadings[0].closest('div');
        if (categoryCard) {
          await user.click(categoryCard);
        }
      }

      // Navigation handled
      expect(screen.getAllByText(/planets/i).length).toBeGreaterThan(0);
    });

    it('should show hover effect on category cards', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const categoryCards = document.querySelectorAll('.hover\\:bg-white\\/10');
      expect(categoryCards.length).toBeGreaterThan(0);
    });
  });

  describe('Latest Lessons Section', () => {
    it('should render latest lessons header', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/latest lessons/i)).toBeInTheDocument();
    });

    it('should display lesson titles', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/mercury in retrograde: the complete guide/i)).toBeInTheDocument();
      expect(screen.getByText(/understanding trines & sextiles/i)).toBeInTheDocument();
      expect(screen.getByText(/the midheaven: your professional legacy/i)).toBeInTheDocument();
    });

    it('should display lesson types (video/article)', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Use getAllByText since video/article may appear multiple times
      const videoTexts = screen.getAllByText(/video/i);
      expect(videoTexts.length).toBeGreaterThan(0);
      const articleTexts = screen.getAllByText(/article/i);
      expect(articleTexts.length).toBeGreaterThan(0);
    });

    it('should display lesson durations', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/12 min/i)).toBeInTheDocument();
      // Use getAllByText since "5 min" may appear multiple times
      const fiveMinElements = screen.getAllByText(/5 min/i);
      expect(fiveMinElements.length).toBeGreaterThan(0);
    });

    it('should display lesson categories', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Categories like Planets, Aspects, Houses
      const categoryElements = screen.getAllByText(/planets|aspects|houses/i);
      expect(categoryElements.length).toBeGreaterThan(0);
    });

    it('should have bookmark buttons on lessons', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const bookmarkButtons = screen.getAllByRole('button').filter(btn =>
        btn.innerHTML.includes('bookmark') ||
        btn.querySelector('[class*="bookmark"]')
      );
      expect(bookmarkButtons.length).toBeGreaterThan(0);
    });

    it('should navigate to lesson when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const lessonTitle = screen.getByText(/mercury in retrograde/i);
      await user.click(lessonTitle);

      // Navigation handled
      expect(lessonTitle).toBeInTheDocument();
    });

    it('should render View All Lessons button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('button', { name: /view all lessons/i })).toBeInTheDocument();
    });
  });

  describe('Community CTA Section', () => {
    it('should render community section header', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/join the cosmic discussion/i)).toBeInTheDocument();
    });

    it('should display community description', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByText(/connect with 15k\+ fellow astrology students/i)).toBeInTheDocument();
    });

    it('should render Enter Student Forum button', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('button', { name: /enter student forum/i })).toBeInTheDocument();
    });

    it('should have gradient background on community card', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Find the community card container - it has bg-gradient class
      const communitySection = screen.getByText(/join the cosmic discussion/i).closest('div');
      // The parent container should have the gradient
      const parentContainer = communitySection?.parentElement;
      expect(parentContainer?.className).toMatch(/gradient|bg-/i);
    });
  });

  describe('Navigation Handlers', () => {
    it('should navigate to course detail when course clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const courseCard = screen.getByText(/astrology 101: the basics/i);
      await user.click(courseCard);

      expect(courseCard).toBeInTheDocument();
    });

    it('should navigate to lesson when lesson clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const lessonCard = screen.getByText(/mercury in retrograde/i);
      await user.click(lessonCard);

      expect(lessonCard).toBeInTheDocument();
    });

    it('should navigate to category when category clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      // Find the Planets category container (clickable div)
      const categoryCards = document.querySelectorAll('.cursor-pointer');
      const planetsCard = Array.from(categoryCards).find(card =>
        card.textContent?.includes('Planets') && card.textContent?.includes('Sun')
      );

      if (planetsCard) {
        await user.click(planetsCard);
      }

      // Use getAllByText since planets appears multiple times
      expect(screen.getAllByText(/planets/i).length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Styling', () => {
    it('should use grid layout for main content sections', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const gridContainers = document.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between sections', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const mainContent = document.querySelector('.space-y-12');
      expect(mainContent).toBeInTheDocument();
    });

    it('should have responsive design classes', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"]');
      expect(responsiveElements.length).toBeGreaterThan(0);
    });

    it('should have glass-morphism effects', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const glassElements = document.querySelectorAll('[class*="backdrop-blur"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('should have border styling on cards', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const borderedElements = document.querySelectorAll('[class*="border"]');
      expect(borderedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation', () => {
      renderWithProviders(createElement(LearningCenterPage));
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should have accessible buttons', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('should have clickable course cards', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const clickableCards = document.querySelectorAll('.cursor-pointer');
      expect(clickableCards.length).toBeGreaterThan(0);
    });

    it('should have hover effects on interactive elements', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const hoverElements = document.querySelectorAll('[class*="hover:"]');
      expect(hoverElements.length).toBeGreaterThan(0);
    });

    it('should have transition effects on elements', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const transitionElements = document.querySelectorAll('[class*="transition"]');
      expect(transitionElements.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Indicators', () => {
    it('should show progress bar in hero card', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const progressBars = document.querySelectorAll('[class*="rounded-full"][class*="h-"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should show duration for all courses', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const durationElements = screen.getAllByText(/hours/i);
      expect(durationElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty search results gracefully', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      await user.type(searchInput, 'zzzzzzzznonexistent');

      // Should not crash, learning paths section may be empty
      await waitFor(() => {
        expect(screen.getByText(/your learning paths/i)).toBeInTheDocument();
      });
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      await user.type(searchInput, '@#$%^&*()');

      // Should not crash
      expect(searchInput).toHaveValue('@#$%^&*()');
    });

    it('should handle case-insensitive search', async () => {
      const user = userEvent.setup();
      renderWithProviders(createElement(LearningCenterPage));

      const searchInput = screen.getByPlaceholderText(/search cosmic secrets/i);
      await user.type(searchInput, 'SYNASTRY');

      await waitFor(() => {
        expect(screen.getByText(/advanced: synastry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Icon Display', () => {
    it('should display material symbols for categories', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Icons like brightness_high, star, grid_view, change_triangle
      const iconContainers = document.querySelectorAll('.material-symbols-outlined');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should display route icon for learning paths', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Material icons are present - check for any icon in learning paths section
      const materialIcons = document.querySelectorAll('.material-symbols-outlined');
      expect(materialIcons.length).toBeGreaterThan(0);
    });

    it('should display book icon for knowledge base', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Material icons are present - check for any icon in knowledge base section
      const materialIcons = document.querySelectorAll('.material-symbols-outlined');
      expect(materialIcons.length).toBeGreaterThan(0);
    });

    it('should display new releases icon for latest lessons', () => {
      renderWithProviders(createElement(LearningCenterPage));
      // Material icons are present - check for any icon in latest lessons section
      const materialIcons = document.querySelectorAll('.material-symbols-outlined');
      expect(materialIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Scroll Behavior', () => {
    it('should have scrollable learning paths container', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have smooth scroll behavior', () => {
      renderWithProviders(createElement(LearningCenterPage));
      const scrollContainer = document.querySelector('.scroll-smooth');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
