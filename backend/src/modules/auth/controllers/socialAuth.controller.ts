import { Request, Response } from 'express';
import { AppError } from '../../../utils/appError';
import UserModel from '../../users/models/user.model';
import {
  generateToken,
  generateRefreshToken,
} from '../../../middleware/auth';
import { sanitizeUser } from '../../../utils/helpers';
import * as RefreshTokenModel from '../models/refreshToken.model';
import { verifyFirebaseToken } from '../../../config/firebase-admin';
import logger from '../../../utils/logger';
import knex from '../../../config/database';

interface SocialLoginBody {
  idToken: string;
  provider: 'google';
}

/**
 * Social login — verify Firebase ID token, find or create user, return JWT
 */
export async function socialLogin(req: Request, res: Response): Promise<void> {
  const { idToken, provider } = req.body as SocialLoginBody;

  if (!idToken || !provider) {
    throw new AppError('idToken and provider are required', 400);
  }

  // Verify Firebase ID token
  const decoded = await verifyFirebaseToken(idToken);
  if (!decoded) {
    throw new AppError('Invalid social login token', 401);
  }

  // Extract user info from Firebase token
  const firebaseUid = decoded.uid;
  const email = decoded.email;
  const name = decoded.name || email?.split('@')[0] || 'User';
  const avatarUrl = decoded.picture || undefined;

  if (!email) {
    throw new AppError('Social account must have an email address', 400);
  }

  // Find existing user by firebase_uid or email
  let user = await UserModel.findByFirebaseUid(firebaseUid);

  if (!user) {
    // Check if email already registered (link accounts)
    user = await UserModel.findByEmail(email);

    if (user) {
      // Link Firebase to existing account
      await knex('users')
        .where({ id: user.id })
        .update({
          firebase_uid: firebaseUid,
          auth_provider: provider,
          avatar_url: avatarUrl || user.avatar_url,
          updated_at: new Date(),
        });

      user = await UserModel.findById(user.id);
      logger.info('Linked social account to existing user', { userId: user?.id, provider });
    } else {
      // Create new user
      user = await UserModel.create({
        name,
        email,
        password_hash: '',
        auth_provider: provider,
        firebase_uid: firebaseUid,
      });

      logger.info('Created new user via social login', { userId: user.id, provider });
    }
  }

  if (!user) {
    throw new AppError('Failed to create or find user', 500);
  }

  // Generate our JWT tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshTokenValue = generateRefreshToken(tokenPayload);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: req.get('user-agent'),
    ip_address: req.ip,
  });

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      accessToken,
    },
  });
}
