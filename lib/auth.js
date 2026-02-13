import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function verifyAuth(request) {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}
