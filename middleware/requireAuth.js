import jwt from 'jsonwebtoken';

export default function requireAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
