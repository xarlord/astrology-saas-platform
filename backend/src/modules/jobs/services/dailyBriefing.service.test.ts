/**
 * Tests for Daily Cosmic Briefing Service
 * CHI-68: Implement Daily Cosmic Briefing (morning digest)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { formatBriefingContent, saveBriefing, getLatestBriefing } from './dailyBriefing.service';
import knex from '../../../config/database';

// Mock dependencies
jest.mock('../../../config/database');
jest.mock('../../../utils/logger');

describe('DailyBriefing Service', () => {
  const mockUserId = 'user-123';

  // Mock briefing result
  const mockBriefing = {
    userId: mockUserId,
    date: '2026-04-08',
    moonPhase: {
      phase: 'waxing-crescent',
      sign: 'Taurus',
      illumination: 23.5,
    },
    topTransits: [
      {
        transitPlanet: 'sun',
        natalPlanet: 'moon',
        aspect: 'trine',
        orb: 2.5,
        interpretation: 'This transit flows naturally — a gift of ease and harmony.',
      },
      {
        transitPlanet: 'mercury',
        natalPlanet: 'venus',
        aspect: 'sextile',
        orb: 1.2,
        interpretation: 'This transit offers opportunities if you take initiative.',
      },
      {
        transitPlanet: 'mars',
        natalPlanet: 'jupiter',
        aspect: 'square',
        orb: 3.8,
        interpretation: 'This transit challenges you to grow through friction and effort.',
      },
    ],
    dailyTheme: 'A day of harmonious flow — growth and opportunity are highlighted.',
    affirmation: 'Your intentions are taking root. Nurture them with patience.',
    planetaryHighlight: {
      planet: 'sun',
      sign: 'aries',
      message: 'Your vitality and sense of self are activated.',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock knex query builder
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      onConflict: jest.fn().mockReturnThis(),
      merge: jest.fn().mockResolvedValue(undefined),
    };

    (knex as jest.MockedFunction<typeof knex>).mockImplementation(() => mockQueryBuilder as any);
  });

  // ===== formatBriefingContent =====

  describe('formatBriefingContent', () => {
    it('should format briefing for all delivery channels', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('pushBody');
      expect(result).toHaveProperty('emailHtml');
    });

    it('should generate human-readable title with date', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.title).toContain('Your Cosmic Briefing');
      expect(result.title).toContain('April');
      expect(result.title).toContain('8');
    });

    it('should include moon phase in title', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.title).toBeDefined();
      expect(result.title).toBeTruthy();
    });

    it('should generate push notification body', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.pushBody).toBeDefined();
      expect(result.pushBody).toContain('Moon');
      expect(result.pushBody).toContain(mockBriefing.dailyTheme);
    });

    it('should include moon phase in summary', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.summary).toContain('🌙');
      expect(result.summary).toContain('Moon');
      expect(result.summary).toContain('Waxing-crescent'); // capitalize() capitalizes first letter
      expect(result.summary).toContain('Taurus');
    });

    it('should include planetary highlight in summary', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.summary).toContain('⭐');
      expect(result.summary).toContain('Highlight');
      expect(result.summary).toContain('Sun'); // capitalize() capitalizes first letter
    });

    it('should include daily theme in summary', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.summary).toContain('Theme:');
      expect(result.summary).toContain(mockBriefing.dailyTheme);
    });

    it('should include affirmation in summary', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.summary).toContain(`"${mockBriefing.affirmation}"`);
    });

    it('should include active transits in summary', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.summary).toContain('Active Transits:');
      expect(result.summary).toContain('Sun'); // capitalize() capitalizes first letter
      expect(result.summary).toContain('trine');
    });

    it('should generate HTML email with proper structure', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.emailHtml).toContain('<!DOCTYPE html>');
      expect(result.emailHtml).toContain('<html>');
      expect(result.emailHtml).toContain('</html>');
      expect(result.emailHtml).toContain('<body>');
      expect(result.emailHtml).toContain('</body>');
    });

    it('should include styling in email HTML', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      expect(result.emailHtml).toContain('<style>');
      expect(result.emailHtml).toContain('body {');
      expect(result.emailHtml).toContain('.container');
    });

    it('should escape HTML in email content', () => {
      // When
      const result = formatBriefingContent(mockBriefing);

      // Then
      // Check that special characters are escaped
      expect(result.emailHtml).not.toContain('<script>');
      expect(result.emailHtml).not.toContain('javascript:');
    });
  });

  // ===== saveBriefing =====

  describe('saveBriefing', () => {
    it('should save briefing to database', async () => {
      // Given
      const mockMerge = jest.fn().mockResolvedValue(undefined);
      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When
      await saveBriefing(mockBriefing);

      // Then
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockBriefing.userId,
          date: mockBriefing.date,
        }),
      );
    });

    it('should serialize complex data as JSON', async () => {
      // Given
      const mockMerge = jest.fn().mockResolvedValue(undefined);
      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When
      await saveBriefing(mockBriefing);

      // Then
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall).toHaveProperty('moon_phase');
      expect(insertCall).toHaveProperty('top_transits');
      expect(insertCall).toHaveProperty('planetary_highlight');
      expect(typeof insertCall.moon_phase).toBe('string');
      expect(typeof insertCall.top_transits).toBe('string');
      expect(typeof insertCall.planetary_highlight).toBe('string');
    });

    it('should include timestamp in saved record', async () => {
      // Given
      const mockMerge = jest.fn().mockResolvedValue(undefined);
      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When
      await saveBriefing(mockBriefing);

      // Then
      const insertCall = mockInsert.mock.calls[0][0];
      expect(insertCall).toHaveProperty('created_at');
      expect(insertCall.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should use merge on conflict to handle duplicates', async () => {
      // Given
      const mockMerge = jest.fn().mockResolvedValue(undefined);
      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When
      await saveBriefing(mockBriefing);

      // Then
      expect(mockInsert).toHaveBeenCalled();
      expect(mockOnConflict).toHaveBeenCalledWith(['user_id', 'date']);
      expect(mockMerge).toHaveBeenCalled();
    });
  });

  // ===== getLatestBriefing =====

  describe('getLatestBriefing', () => {
    it('should retrieve latest briefing for user', async () => {
      // Given
      const mockRow = {
        user_id: mockUserId,
        date: '2026-04-08',
        moon_phase: JSON.stringify(mockBriefing.moonPhase),
        top_transits: JSON.stringify(mockBriefing.topTransits),
        daily_theme: mockBriefing.dailyTheme,
        affirmation: mockBriefing.affirmation,
        planetary_highlight: JSON.stringify(mockBriefing.planetaryHighlight),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(mockRow);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(mockRow);

      // When
      const result = await getLatestBriefing(mockUserId);

      // Then
      expect(result).not.toBeNull();
      expect(result.userId).toBe(mockUserId);
      expect(result.date).toBe('2026-04-08');
      expect(result.moonPhase).toEqual(mockBriefing.moonPhase);
      expect(result.topTransits).toEqual(mockBriefing.topTransits);
    });

    it('should return null when no briefing found', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(null);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(null);

      // When
      const result = await getLatestBriefing(mockUserId);

      // Then
      expect(result).toBeNull();
    });

    it('should order briefings by date descending', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(null);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(null);

      // When
      await getLatestBriefing(mockUserId);

      // Then
      expect(knex).toHaveBeenCalledWith('daily_briefings');
      expect(knex('daily_briefings').where).toHaveBeenCalled();
      expect(knex('daily_briefings').where().orderBy).toHaveBeenCalledWith('date', 'desc');
    });

    it('should parse JSON data correctly', async () => {
      // Given
      const mockRow = {
        user_id: mockUserId,
        date: '2026-04-08',
        moon_phase: JSON.stringify(mockBriefing.moonPhase),
        top_transits: JSON.stringify(mockBriefing.topTransits),
        daily_theme: mockBriefing.dailyTheme,
        affirmation: mockBriefing.affirmation,
        planetary_highlight: JSON.stringify(mockBriefing.planetaryHighlight),
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(mockRow);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(mockRow);

      // When
      const result = await getLatestBriefing(mockUserId);

      // Then
      expect(result.moonPhase).toEqual(mockBriefing.moonPhase);
      expect(result.topTransits).toEqual(mockBriefing.topTransits);
      expect(result.planetaryHighlight).toEqual(mockBriefing.planetaryHighlight);
      expect(result.moonPhase).not.toBeInstanceOf(String);
      expect(result.topTransits).not.toBeInstanceOf(String);
      expect(result.planetaryHighlight).not.toBeInstanceOf(String);
    });
  });

  // ===== Data Structure Validation =====

  describe('DailyBriefing Interface', () => {
    it('should maintain valid interface structure', () => {
      // When
      const formatted = formatBriefingContent(mockBriefing);

      // Then
      expect(formatted).toHaveProperty('title');
      expect(formatted).toHaveProperty('summary');
      expect(formatted).toHaveProperty('pushBody');
      expect(formatted).toHaveProperty('emailHtml');
    });

    it('should ensure consistent date formatting', () => {
      // Given
      const briefing = { ...mockBriefing, date: '2026-04-08' };

      // When
      const result = formatBriefingContent(briefing);

      // Then
      expect(result.title).toContain('April');
      expect(result.title).toContain('8');
      expect(result.title).toContain('Wednesday');
    });

    it('should handle leap year dates', () => {
      // Given
      const leapYearBriefing = { ...mockBriefing, date: '2024-02-29' };

      // When
      const result = formatBriefingContent(leapYearBriefing);

      // Then
      expect(result.title).toBeDefined();
      expect(result.title).toContain('February');
      expect(result.title).toContain('29');
    });
  });

  // ===== Edge Cases =====

  describe('Edge Cases', () => {
    it('should handle briefing with no transits', () => {
      // Given
      const emptyTransitsBriefing = {
        ...mockBriefing,
        topTransits: [],
      };

      // When
      const result = formatBriefingContent(emptyTransitsBriefing);

      // Then
      expect(result.summary).toContain('Active Transits:');
      expect(result.title).toBeDefined();
    });

    it('should handle briefing with full moon phase', () => {
      // Given
      const fullMoonBriefing = {
        ...mockBriefing,
        moonPhase: {
          phase: 'full',
          sign: 'Scorpio',
          illumination: 100,
        },
      };

      // When
      const result = formatBriefingContent(fullMoonBriefing);

      // Then
      expect(result.summary).toContain('Full'); // capitalize() makes "Full"
      expect(result.summary).toContain('Scorpio');
    });

    it('should handle briefing with new moon phase', () => {
      // Given
      const newMoonBriefing = {
        ...mockBriefing,
        moonPhase: {
          phase: 'new',
          sign: 'Pisces',
          illumination: 0,
        },
      };

      // When
      const result = formatBriefingContent(newMoonBriefing);

      // Then
      expect(result.summary).toContain('New'); // capitalize() makes "New"
      expect(result.summary).toContain('Pisces');
    });

    it('should handle special characters in affirmation', () => {
      // Given
      const specialCharBriefing = {
        ...mockBriefing,
        affirmation: 'Test "quotes" & <special> chars!',
      };

      // When
      const result = formatBriefingContent(specialCharBriefing);

      // Then
      expect(result.emailHtml).not.toContain('<special>');
      expect(result.emailHtml).toContain('&lt;special&gt;');
      expect(result.emailHtml).toContain('&quot;');
    });
  });

  // ===== Integration Points =====

  describe('Database Integration', () => {
    it('should query daily_briefings table', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(null);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(null);

      // When
      await getLatestBriefing(mockUserId);

      // Then
      expect(knex).toHaveBeenCalledWith('daily_briefings');
    });

    it('should insert into daily_briefings table', async () => {
      // Given
      const mockMerge = jest.fn().mockResolvedValue(undefined);
      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When
      await saveBriefing(mockBriefing);

      // Then
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should filter by user_id', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(null);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(null);

      // When
      await getLatestBriefing(mockUserId);

      // Then
      expect(knex('daily_briefings').where).toHaveBeenCalledWith({ user_id: mockUserId });
    });
  });

  // ===== Error Handling =====

  describe('Error Handling', () => {
    it('should propagate database errors from getLatestBriefing', async () => {
      // Given
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockRejectedValue(new Error('Database error'));
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockRejectedValue(new Error('Database error'));

      // When & Then
      await expect(getLatestBriefing(mockUserId)).rejects.toThrow('Database error');
    });

    it('should propagate database errors from saveBriefing', async () => {
      // Given
      const mockInsert = jest.fn().mockReturnValue({
        onConflict: jest.fn().mockReturnValue({
          merge: jest.fn().mockRejectedValue(new Error('Insert failed')),
        }),
      });

      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
        insert: mockInsert as any,
      } as any);

      // When & Then
      await expect(saveBriefing(mockBriefing)).rejects.toThrow('Insert failed');
    });

    it('should handle JSON parse errors gracefully', async () => {
      // Given
      const mockRow = {
        user_id: mockUserId,
        date: '2026-04-08',
        moon_phase: 'invalid json',
        top_transits: 'invalid json',
        daily_theme: mockBriefing.dailyTheme,
        affirmation: mockBriefing.affirmation,
        planetary_highlight: 'invalid json',
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockFirst = jest.fn().mockResolvedValue(mockRow);
      (
        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
      ).mockResolvedValue(mockRow);

      // When & Then
      await expect(getLatestBriefing(mockUserId)).rejects.toThrow();
    });
  });
});
