import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JWTPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key-change-this-in-production';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-change-this-in-production';
  private static readonly ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 days

  /**
   * Generate access token
   */
  static generateAccessToken(userId: number, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'access'
    };

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET as any, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'ivendor-api',
      audience: 'ivendor-client'
    } as any) as string;
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: number, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET as any, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'ivendor-api',
      audience: 'ivendor-client'
    } as any) as string;
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(userId: number, email: string): TokenResponse {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId, email);

    // Get expiry time in seconds
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - decoded.iat;

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET as any, {
        issuer: 'ivendor-api',
        audience: 'ivendor-client'
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET as any, {
        issuer: 'ivendor-api',
        audience: 'ivendor-client'
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Generate unique token string for refresh token storage
   */
  static generateUniqueToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}
