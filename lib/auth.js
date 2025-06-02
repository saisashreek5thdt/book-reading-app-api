// lib/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}