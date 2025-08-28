import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      const token = getTokenFromRequest(req);
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'No token provided' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      req.user = decoded;

      return handler(req);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
  };
};

export const withAdminAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return withAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req);
  });
};
