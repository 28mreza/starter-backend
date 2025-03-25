import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const SECRET_KEY = process.env.JWT_SECRET as string

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization header missing'
    })
  }

  try {
    jwt.verify(authHeader, SECRET_KEY, (err, decoded) => {
      if (err) {
          console.error('Token invalid:', err.message)
          res.status(400).json({
            message: 'Invalid token.'
          })
      } else {
        next()
      }
    })
  } catch (ex) {
    res.status(400).json({
      message: 'Invalid token.'
    })
  }
}
