/**
 * Tests for Password Reset Service
 */

import * as PasswordResetService from '../../modules/auth/services/passwordReset.service';
import * as PasswordResetModel from '../../modules/auth/models/passwordReset.model';
import UserModel from '../../modules/users/models/user.model';
import { hashPassword } from '../../utils/helpers';
import { AppError } from '../../utils/appError';

// Mock dependencies
jest.mock('../../modules/users/models/user.model', () => ({
  __esModule: true,
  default: {
    findByEmail: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

jest.mock('../../modules/auth/models/passwordReset.model', () => ({
  createResetToken: jest.fn(),
  findResetToken: jest.fn(),
  markTokenUsed: jest.fn(),
  invalidateUserTokens: jest.fn(),
}));

jest.mock('../../utils/helpers', () => ({
  hashPassword: jest.fn(),
}));

jest.mock('../../services/email.service', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

describe('Password Reset Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPasswordReset', () => {
    it('should create reset token and send email for existing user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test' };
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (PasswordResetModel.invalidateUserTokens as jest.Mock).mockResolvedValue(0);
      (PasswordResetModel.createResetToken as jest.Mock).mockResolvedValue({});

      await PasswordResetService.requestPasswordReset('test@example.com');

      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(PasswordResetModel.invalidateUserTokens).toHaveBeenCalledWith('user-1');
      expect(PasswordResetModel.createResetToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
    });

    it('should return success without error for non-existent email', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        PasswordResetService.requestPasswordReset('nobody@example.com'),
      ).resolves.toBeUndefined();

      expect(PasswordResetModel.createResetToken).not.toHaveBeenCalled();
    });

    it('should invalidate previous tokens before creating new one', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test' };
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (PasswordResetModel.invalidateUserTokens as jest.Mock).mockResolvedValue(2);
      (PasswordResetModel.createResetToken as jest.Mock).mockResolvedValue({});

      await PasswordResetService.requestPasswordReset('test@example.com');

      expect(PasswordResetModel.invalidateUserTokens).toHaveBeenCalledWith('user-1');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockToken = {
        id: 'token-1',
        user_id: 'user-1',
        token: 'valid-token',
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      };

      (PasswordResetModel.findResetToken as jest.Mock).mockResolvedValue(mockToken);
      (hashPassword as jest.Mock).mockResolvedValue('new-hash');
      (UserModel.updatePassword as jest.Mock).mockResolvedValue(true);
      (PasswordResetModel.markTokenUsed as jest.Mock).mockResolvedValue(undefined);

      await PasswordResetService.resetPassword('valid-token', 'NewPass123!');

      expect(PasswordResetModel.findResetToken).toHaveBeenCalledWith('valid-token');
      expect(hashPassword).toHaveBeenCalledWith('NewPass123!');
      expect(UserModel.updatePassword).toHaveBeenCalledWith('user-1', 'new-hash');
      expect(PasswordResetModel.markTokenUsed).toHaveBeenCalledWith('token-1');
    });

    it('should throw 400 for invalid token', async () => {
      (PasswordResetModel.findResetToken as jest.Mock).mockResolvedValue(null);

      await expect(PasswordResetService.resetPassword('bad-token', 'NewPass123!')).rejects.toThrow(
        AppError,
      );

      try {
        await PasswordResetService.resetPassword('bad-token', 'NewPass123!');
      } catch (error) {
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it('should throw 400 for already-used token', async () => {
      const mockToken = {
        id: 'token-1',
        user_id: 'user-1',
        token: 'used-token',
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        used: true,
      };

      (PasswordResetModel.findResetToken as jest.Mock).mockResolvedValue(mockToken);

      await expect(PasswordResetService.resetPassword('used-token', 'NewPass123!')).rejects.toThrow(
        'This reset token has already been used',
      );
    });

    it('should throw 400 for expired token', async () => {
      const mockToken = {
        id: 'token-1',
        user_id: 'user-1',
        token: 'expired-token',
        expires_at: new Date(Date.now() - 1000),
        used: false,
      };

      (PasswordResetModel.findResetToken as jest.Mock).mockResolvedValue(mockToken);

      await expect(
        PasswordResetService.resetPassword('expired-token', 'NewPass123!'),
      ).rejects.toThrow('expired');
    });
  });
});
