import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userName) {
            req.userName = decoded.userName;
            req.role = decoded.role;
            next();
        } else {
            return res.status(403).json({
                message: "Invalid Token"
            });
        }
    } catch (err) {
        return res.status(403).json({
            message: err.message || "Invalid Token"
        });
    }
};

export default authMiddleware;
