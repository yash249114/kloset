import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Mock authentication - in production, this would validate against a database
    // For demo purposes, accept any valid email/password combination
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      role: 'renter' as const,
      trust_score: 95,
      kyc_status: 'verified' as const,
      wallet_balance: 0,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    // Generate mock JWT tokens
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
      btoa(JSON.stringify({ sub: mockUser.id, email: mockUser.email, role: mockUser.role, exp: Date.now() + 3600000 })) +
      '.mock_signature_' + Math.random().toString(36).substr(2, 9);
    
    const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify({ sub: mockUser.id, type: 'refresh', exp: Date.now() + 604800000 })) +
      '.mock_refresh_' + Math.random().toString(36).substr(2, 9);

    return NextResponse.json({
      data: {
        user: mockUser,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
