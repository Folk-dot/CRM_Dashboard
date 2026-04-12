import jwt from 'jsonwebtoken';

/**
 * authenticate
 * Verifies the JWT from the Authorization header.
 * Attaches the decoded payload to req.user.
 * Usage: router.get('/protected', authenticate, controller)
 */
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        res.status(401).json({ error: message });
    }
};

/**
 * authorize(...roles)
 * Must be used AFTER authenticate.
 * Restricts a route to specific roles.
 *
 * Usage: router.delete('/:id', authenticate, authorize('admin'), controller)
 * Roles: 'admin' | 'doctor' | 'receptionist'
 */
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};
