/**
 * Debug test for OpenAI service
 */

process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock('../../utils/logger', () => ({
  default: mockLogger,
  __esModule: true,
}));

const mockCreate = jest.fn().mockResolvedValue({
  choices: [{ message: { content: 'test response' } }],
});

const mockChat = {
  completions: {
    create: mockCreate,
  },
};

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: mockChat,
    })),
    __esModule: true,
  };
});

import openaiService from '../../modules/ai/services/openai.service';
import * as fs from 'fs';

describe('OpenAI Debug', () => {
  it('should call the API', async () => {
    const chartData = {
      planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
    };

    const result = await openaiService.generateNatalInterpretation(chartData);

    // Write debug info to file
    fs.writeFileSync(
      'C:\\Users\\plner\\MVP_Projects\\backend\\debug-output.txt',
      JSON.stringify({
        success: result.success,
        error: result.error,
        interpretation: result.interpretation,
        mockCalls: mockCreate.mock.calls.length,
        loggerErrors: mockLogger.error.mock.calls,
      }, null, 2)
    );

    expect(result.success).toBe(true);
  });
});
