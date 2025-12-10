import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided', success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.id) {
            // ensure req.body exists before assigning
            if (!req.body) req.body = {};
            // keep backwards compatibility: controllers expect `req.body.userId`
            req.body.userId = decoded.id;
            // also attach directly on req for convenience
            req.userId = decoded.id;
        } else {
            return res.status(401).json({ message: 'Unauthorized: Invalid token', success: false });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message, success: false });
    }
}

export default userAuth;