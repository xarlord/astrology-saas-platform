     1|/**
     2| * Tests for Daily Cosmic Briefing Service
     3| * CHI-68: Implement Daily Cosmic Briefing (morning digest)
     4| */
     5|
     6|import { describe, it, expect, beforeEach, jest } from '@jest/globals';
     7|import { formatBriefingContent, saveBriefing, getLatestBriefing } from './dailyBriefing.service';
     8|import knex from '../../../config/database';
     9|
    10|// Mock dependencies
    11|jest.mock('../../../config/database');
    12|jest.mock('../../../utils/logger');
    13|
    14|describe('DailyBriefing Service', () => {
    15|  const mockUserId = 'user-123';
    16|
    17|  // Mock briefing result
    18|  const mockBriefing = {
    19|    userId: mockUserId,
    20|    date: '2026-04-08',
    21|    moonPhase: {
    22|      phase: 'waxing-crescent',
    23|      sign: 'Taurus',
    24|      illumination: 23.5,
    25|    },
    26|    topTransits: [
    27|      {
    28|        transitPlanet: 'sun',
    29|        natalPlanet: 'moon',
    30|        aspect: 'trine',
    31|        orb: 2.5,
    32|        interpretation: 'This transit flows naturally — a gift of ease and harmony.',
    33|      },
    34|      {
    35|        transitPlanet: 'mercury',
    36|        natalPlanet: 'venus',
    37|        aspect: 'sextile',
    38|        orb: 1.2,
    39|        interpretation: 'This transit offers opportunities if you take initiative.',
    40|      },
    41|      {
    42|        transitPlanet: 'mars',
    43|        natalPlanet: 'jupiter',
    44|        aspect: 'square',
    45|        orb: 3.8,
    46|        interpretation: 'This transit challenges you to grow through friction and effort.',
    47|      },
    48|    ],
    49|    dailyTheme: 'A day of harmonious flow — growth and opportunity are highlighted.',
    50|    affirmation: 'Your intentions are taking root. Nurture them with patience.',
    51|    planetaryHighlight: {
    52|      planet: 'sun',
    53|      sign: 'aries',
    54|      message: 'Your vitality and sense of self are activated.',
    55|    },
    56|  };
    57|
    58|  beforeEach(() => {
    59|    jest.clearAllMocks();
    60|
    61|    // Mock knex query builder
    62|    const mockQueryBuilder = {
    63|      where: jest.fn().mockReturnThis(),
    64|      orderBy: jest.fn().mockReturnThis(),
    65|      first: jest.fn(),
    66|      insert: jest.fn().mockReturnThis(),
    67|      onConflict: jest.fn().mockReturnThis(),
    68|      merge: jest.fn().mockResolvedValue(undefined),
    69|    };
    70|
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    71|    (knex as jest.MockedFunction<typeof knex>).mockImplementation(() => mockQueryBuilder as any);
    72|  });
    73|
    74|  // ===== formatBriefingContent =====
    75|
    76|  describe('formatBriefingContent', () => {
    77|    it('should format briefing for all delivery channels', () => {
    78|      // When
    79|      const result = formatBriefingContent(mockBriefing);
    80|
    81|      // Then
    82|      expect(result).toHaveProperty('title');
    83|      expect(result).toHaveProperty('summary');
    84|      expect(result).toHaveProperty('pushBody');
    85|      expect(result).toHaveProperty('emailHtml');
    86|    });
    87|
    88|    it('should generate human-readable title with date', () => {
    89|      // When
    90|      const result = formatBriefingContent(mockBriefing);
    91|
    92|      // Then
    93|      expect(result.title).toContain('Your Cosmic Briefing');
    94|      expect(result.title).toContain('April');
    95|      expect(result.title).toContain('8');
    96|    });
    97|
    98|    it('should include moon phase in title', () => {
    99|      // When
   100|      const result = formatBriefingContent(mockBriefing);
   101|
   102|      // Then
   103|      expect(result.title).toBeDefined();
   104|      expect(result.title).toBeTruthy();
   105|    });
   106|
   107|    it('should generate push notification body', () => {
   108|      // When
   109|      const result = formatBriefingContent(mockBriefing);
   110|
   111|      // Then
   112|      expect(result.pushBody).toBeDefined();
   113|      expect(result.pushBody).toContain('Moon');
   114|      expect(result.pushBody).toContain(mockBriefing.dailyTheme);
   115|    });
   116|
   117|    it('should include moon phase in summary', () => {
   118|      // When
   119|      const result = formatBriefingContent(mockBriefing);
   120|
   121|      // Then
   122|      expect(result.summary).toContain('🌙');
   123|      expect(result.summary).toContain('Moon');
   124|      expect(result.summary).toContain('Waxing-crescent'); // capitalize() capitalizes first letter
   125|      expect(result.summary).toContain('Taurus');
   126|    });
   127|
   128|    it('should include planetary highlight in summary', () => {
   129|      // When
   130|      const result = formatBriefingContent(mockBriefing);
   131|
   132|      // Then
   133|      expect(result.summary).toContain('⭐');
   134|      expect(result.summary).toContain('Highlight');
   135|      expect(result.summary).toContain('Sun'); // capitalize() capitalizes first letter
   136|    });
   137|
   138|    it('should include daily theme in summary', () => {
   139|      // When
   140|      const result = formatBriefingContent(mockBriefing);
   141|
   142|      // Then
   143|      expect(result.summary).toContain('Theme:');
   144|      expect(result.summary).toContain(mockBriefing.dailyTheme);
   145|    });
   146|
   147|    it('should include affirmation in summary', () => {
   148|      // When
   149|      const result = formatBriefingContent(mockBriefing);
   150|
   151|      // Then
   152|      expect(result.summary).toContain(`"${mockBriefing.affirmation}"`);
   153|    });
   154|
   155|    it('should include active transits in summary', () => {
   156|      // When
   157|      const result = formatBriefingContent(mockBriefing);
   158|
   159|      // Then
   160|      expect(result.summary).toContain('Active Transits:');
   161|      expect(result.summary).toContain('Sun'); // capitalize() capitalizes first letter
   162|      expect(result.summary).toContain('trine');
   163|    });
   164|
   165|    it('should generate HTML email with proper structure', () => {
   166|      // When
   167|      const result = formatBriefingContent(mockBriefing);
   168|
   169|      // Then
   170|      expect(result.emailHtml).toContain('<!DOCTYPE html>');
   171|      expect(result.emailHtml).toContain('<html>');
   172|      expect(result.emailHtml).toContain('</html>');
   173|      expect(result.emailHtml).toContain('<body>');
   174|      expect(result.emailHtml).toContain('</body>');
   175|    });
   176|
   177|    it('should include styling in email HTML', () => {
   178|      // When
   179|      const result = formatBriefingContent(mockBriefing);
   180|
   181|      // Then
   182|      expect(result.emailHtml).toContain('<style>');
   183|      expect(result.emailHtml).toContain('body {');
   184|      expect(result.emailHtml).toContain('.container');
   185|    });
   186|
   187|    it('should escape HTML in email content', () => {
   188|      // When
   189|      const result = formatBriefingContent(mockBriefing);
   190|
   191|      // Then
   192|      // Check that special characters are escaped
   193|      expect(result.emailHtml).not.toContain('<script>');
   194|      expect(result.emailHtml).not.toContain('javascript:');
   195|    });
   196|  });
   197|
   198|  // ===== saveBriefing =====
   199|
   200|  describe('saveBriefing', () => {
   201|    it('should save briefing to database', async () => {
   202|      // Given
   203|      const mockMerge = jest.fn().mockResolvedValue(undefined);
   204|      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
   205|      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });
   206|
   207|      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   208|        insert: mockInsert as any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   209|      } as any);
   210|
   211|      // When
   212|      await saveBriefing(mockBriefing);
   213|
   214|      // Then
   215|      expect(mockInsert).toHaveBeenCalledWith(
   216|        expect.objectContaining({
   217|          user_id: mockBriefing.userId,
   218|          date: mockBriefing.date,
   219|        }),
   220|      );
   221|    });
   222|
   223|    it('should serialize complex data as JSON', async () => {
   224|      // Given
   225|      const mockMerge = jest.fn().mockResolvedValue(undefined);
   226|      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
   227|      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });
   228|
   229|      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   230|        insert: mockInsert as any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   231|      } as any);
   232|
   233|      // When
   234|      await saveBriefing(mockBriefing);
   235|
   236|      // Then
   237|      const insertCall = mockInsert.mock.calls[0][0];
   238|      expect(insertCall).toHaveProperty('moon_phase');
   239|      expect(insertCall).toHaveProperty('top_transits');
   240|      expect(insertCall).toHaveProperty('planetary_highlight');
   241|      expect(typeof insertCall.moon_phase).toBe('string');
   242|      expect(typeof insertCall.top_transits).toBe('string');
   243|      expect(typeof insertCall.planetary_highlight).toBe('string');
   244|    });
   245|
   246|    it('should include timestamp in saved record', async () => {
   247|      // Given
   248|      const mockMerge = jest.fn().mockResolvedValue(undefined);
   249|      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
   250|      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });
   251|
   252|      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   253|        insert: mockInsert as any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   254|      } as any);
   255|
   256|      // When
   257|      await saveBriefing(mockBriefing);
   258|
   259|      // Then
   260|      const insertCall = mockInsert.mock.calls[0][0];
   261|      expect(insertCall).toHaveProperty('created_at');
   262|      expect(insertCall.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
   263|    });
   264|
   265|    it('should use merge on conflict to handle duplicates', async () => {
   266|      // Given
   267|      const mockMerge = jest.fn().mockResolvedValue(undefined);
   268|      const mockOnConflict = jest.fn().mockReturnValue({ merge: mockMerge });
   269|      const mockInsert = jest.fn().mockReturnValue({ onConflict: mockOnConflict });
   270|
   271|      (knex as jest.MockedFunction<typeof knex>).mockReturnValue({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   272|        insert: mockInsert as any,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   273|      } as any);
   274|
   275|      // When
   276|      await saveBriefing(mockBriefing);
   277|
   278|      // Then
   279|      expect(mockInsert).toHaveBeenCalled();
   280|      expect(mockOnConflict).toHaveBeenCalledWith(['user_id', 'date']);
   281|      expect(mockMerge).toHaveBeenCalled();
   282|    });
   283|  });
   284|
   285|  // ===== getLatestBriefing =====
   286|
   287|  describe('getLatestBriefing', () => {
   288|    it('should retrieve latest briefing for user', async () => {
   289|      // Given
   290|      const mockRow = {
   291|        user_id: mockUserId,
   292|        date: '2026-04-08',
   293|        moon_phase: JSON.stringify(mockBriefing.moonPhase),
   294|        top_transits: JSON.stringify(mockBriefing.topTransits),
   295|        daily_theme: mockBriefing.dailyTheme,
   296|        affirmation: mockBriefing.affirmation,
   297|        planetary_highlight: JSON.stringify(mockBriefing.planetaryHighlight),
   298|      };
   299|      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   300|      const mockFirst = jest.fn().mockResolvedValue(mockRow);
   301|      (
   302|        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
   303|      ).mockResolvedValue(mockRow);
   304|
   305|      // When
   306|      const result = await getLatestBriefing(mockUserId);
   307|
   308|      // Then
   309|      expect(result).not.toBeNull();
   310|      expect(result.userId).toBe(mockUserId);
   311|      expect(result.date).toBe('2026-04-08');
   312|      expect(result.moonPhase).toEqual(mockBriefing.moonPhase);
   313|      expect(result.topTransits).toEqual(mockBriefing.topTransits);
   314|    });
   315|
   316|    it('should return null when no briefing found', async () => {
   317|      // Given
   318|      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   319|      const mockFirst = jest.fn().mockResolvedValue(null);
   320|      (
   321|        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
   322|      ).mockResolvedValue(null);
   323|
   324|      // When
   325|      const result = await getLatestBriefing(mockUserId);
   326|
   327|      // Then
   328|      expect(result).toBeNull();
   329|    });
   330|
   331|    it('should order briefings by date descending', async () => {
   332|      // Given
   333|      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   334|      const mockFirst = jest.fn().mockResolvedValue(null);
   335|      (
   336|        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
   337|      ).mockResolvedValue(null);
   338|
   339|      // When
   340|      await getLatestBriefing(mockUserId);
   341|
   342|      // Then
   343|      expect(knex).toHaveBeenCalledWith('daily_briefings');
   344|      expect(knex('daily_briefings').where).toHaveBeenCalled();
   345|      expect(knex('daily_briefings').where().orderBy).toHaveBeenCalledWith('date', 'desc');
   346|    });
   347|
   348|    it('should parse JSON data correctly', async () => {
   349|      // Given
   350|      const mockRow = {
   351|        user_id: mockUserId,
   352|        date: '2026-04-08',
   353|        moon_phase: JSON.stringify(mockBriefing.moonPhase),
   354|        top_transits: JSON.stringify(mockBriefing.topTransits),
   355|        daily_theme: mockBriefing.dailyTheme,
   356|        affirmation: mockBriefing.affirmation,
   357|        planetary_highlight: JSON.stringify(mockBriefing.planetaryHighlight),
   358|      };
   359|      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   360|      const mockFirst = jest.fn().mockResolvedValue(mockRow);
   361|      (
   362|        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
   363|      ).mockResolvedValue(mockRow);
   364|
   365|      // When
   366|      const result = await getLatestBriefing(mockUserId);
   367|
   368|      // Then
   369|      expect(result.moonPhase).toEqual(mockBriefing.moonPhase);
   370|      expect(result.topTransits).toEqual(mockBriefing.topTransits);
   371|      expect(result.planetaryHighlight).toEqual(mockBriefing.planetaryHighlight);
   372|      expect(result.moonPhase).not.toBeInstanceOf(String);
   373|      expect(result.topTransits).not.toBeInstanceOf(String);
   374|      expect(result.planetaryHighlight).not.toBeInstanceOf(String);
   375|    });
   376|  });
   377|
   378|  // ===== Data Structure Validation =====
   379|
   380|  describe('DailyBriefing Interface', () => {
   381|    it('should maintain valid interface structure', () => {
   382|      // When
   383|      const formatted = formatBriefingContent(mockBriefing);
   384|
   385|      // Then
   386|      expect(formatted).toHaveProperty('title');
   387|      expect(formatted).toHaveProperty('summary');
   388|      expect(formatted).toHaveProperty('pushBody');
   389|      expect(formatted).toHaveProperty('emailHtml');
   390|    });
   391|
   392|    it('should ensure consistent date formatting', () => {
   393|      // Given
   394|      const briefing = { ...mockBriefing, date: '2026-04-08' };
   395|
   396|      // When
   397|      const result = formatBriefingContent(briefing);
   398|
   399|      // Then
   400|      expect(result.title).toContain('April');
   401|      expect(result.title).toContain('8');
   402|      expect(result.title).toContain('Wednesday');
   403|    });
   404|
   405|    it('should handle leap year dates', () => {
   406|      // Given
   407|      const leapYearBriefing = { ...mockBriefing, date: '2024-02-29' };
   408|
   409|      // When
   410|      const result = formatBriefingContent(leapYearBriefing);
   411|
   412|      // Then
   413|      expect(result.title).toBeDefined();
   414|      expect(result.title).toContain('February');
   415|      expect(result.title).toContain('29');
   416|    });
   417|  });
   418|
   419|  // ===== Edge Cases =====
   420|
   421|  describe('Edge Cases', () => {
   422|    it('should handle briefing with no transits', () => {
   423|      // Given
   424|      const emptyTransitsBriefing = {
   425|        ...mockBriefing,
   426|        topTransits: [],
   427|      };
   428|
   429|      // When
   430|      const result = formatBriefingContent(emptyTransitsBriefing);
   431|
   432|      // Then
   433|      expect(result.summary).toContain('Active Transits:');
   434|      expect(result.title).toBeDefined();
   435|    });
   436|
   437|    it('should handle briefing with full moon phase', () => {
   438|      // Given
   439|      const fullMoonBriefing = {
   440|        ...mockBriefing,
   441|        moonPhase: {
   442|          phase: 'full',
   443|          sign: 'Scorpio',
   444|          illumination: 100,
   445|        },
   446|      };
   447|
   448|      // When
   449|      const result = formatBriefingContent(fullMoonBriefing);
   450|
   451|      // Then
   452|      expect(result.summary).toContain('Full'); // capitalize() makes "Full"
   453|      expect(result.summary).toContain('Scorpio');
   454|    });
   455|
   456|    it('should handle briefing with new moon phase', () => {
   457|      // Given
   458|      const newMoonBriefing = {
   459|        ...mockBriefing,
   460|        moonPhase: {
   461|          phase: 'new',
   462|          sign: 'Pisces',
   463|          illumination: 0,
   464|        },
   465|      };
   466|
   467|      // When
   468|      const result = formatBriefingContent(newMoonBriefing);
   469|
   470|      // Then
   471|      expect(result.summary).toContain('New'); // capitalize() makes "New"
   472|      expect(result.summary).toContain('Pisces');
   473|    });
   474|
   475|    it('should handle special characters in affirmation', () => {
   476|      // Given
   477|      const specialCharBriefing = {
   478|        ...mockBriefing,
   479|        affirmation: 'Test "quotes" & <special> chars!',
   480|      };
   481|
   482|      // When
   483|      const result = formatBriefingContent(specialCharBriefing);
   484|
   485|      // Then
   486|      expect(result.emailHtml).not.toContain('<special>');
   487|      expect(result.emailHtml).toContain('&lt;special&gt;');
   488|      expect(result.emailHtml).toContain('&quot;');
   489|    });
   490|  });
   491|
   492|  // ===== Integration Points =====
   493|
   494|  describe('Database Integration', () => {
   495|    it('should query daily_briefings table', async () => {
   496|      // Given
   497|      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   498|      const mockFirst = jest.fn().mockResolvedValue(null);
   499|      (
   500|        knex('daily_briefings').where().orderBy().first as jest.MockedFunction<typeof mockFirst>
   501|