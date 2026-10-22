import crypto from 'node:crypto';

// Secret key for JWT signing (HMAC SHA-256)
const JWT_SECRET = process.env.VERITY_JWT_SECRET || 'verity-quant-terminal-ultra-secure-hmac-sha256-key-2026';

// Base64Url helpers
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Generate JWT token
export function createJWT(payload, expiresInSeconds = 86400) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: 'verity-intelligence-terminal'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

// Verify JWT token
export function verifyJWT(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// In-memory user database with seed accounts
const users = [
  {
    id: 'usr_citadel_01',
    name: 'Marcus Vance',
    email: 'trader@verity.quant',
    passwordHash: hashPassword('password123'),
    role: 'Managing Director, Quantitative Alpha',
    desk: 'Hedge Fund PM',
    clearance: 'LEVEL_4_EXECUTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_jane_02',
    name: 'Elena Rostova',
    email: 'elena.r@sigma-cap.com',
    passwordHash: hashPassword('sigma2026!'),
    role: 'Senior Options Market Maker',
    desk: 'Vol Arb Desk',
    clearance: 'LEVEL_3_QUANT',
    createdAt: new Date().toISOString()
  }
];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'verity-salt-2026').digest('hex');
}

// Helper to parse JSON body from incoming Node HTTP request
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Vite plugin providing /api/auth endpoints
export function authApiPlugin() {
  return {
    name: 'verity-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only intercept /api/auth routes
        if (!req.url.startsWith('/api/auth')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        try {
          // POST /api/auth/signup
          if (req.method === 'POST' && pathname === '/api/auth/signup') {
            const { name, email, password, desk, role } = await parseJsonBody(req);

            if (!email || !password || !name) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Name, email, and password are required.' }));
            }

            const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
              res.statusCode = 409;
              return res.end(JSON.stringify({ error: 'An account with this email already exists.' }));
            }

            const newUser = {
              id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              name,
              email,
              passwordHash: hashPassword(password),
              role: role || 'Member',
              desk: desk || 'General',
              clearance: 'STANDARD',
              createdAt: new Date().toISOString()
            };

            users.push(newUser);

            const token = createJWT({
              sub: newUser.id,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              desk: newUser.desk
            });

            const { passwordHash, ...userResponse } = newUser;
            res.statusCode = 201;
            return res.end(JSON.stringify({
              success: true,
              message: 'Account created successfully.',
              token,
              user: userResponse
            }));
          }

          // POST /api/auth/login
          if (req.method === 'POST' && pathname === '/api/auth/login') {
            const { email, password } = await parseJsonBody(req);

            if (!email || !password) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Email and password are required.' }));
            }

            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!user || user.passwordHash !== hashPassword(password)) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Invalid email or password.' }));
            }

            const token = createJWT({
              sub: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              desk: user.desk
            });

            const { passwordHash, ...userResponse } = user;
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Logged in successfully.',
              token,
              user: userResponse
            }));
          }

          // GET /api/auth/me
          if (req.method === 'GET' && pathname === '/api/auth/me') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'Missing or malformed Authorization header.' }));
            }

            const token = authHeader.split(' ')[1];
            const payload = verifyJWT(token);

            if (!payload) {
              res.statusCode = 401;
              return res.end(JSON.stringify({ error: 'JWT token invalid, expired, or signature verification failed.' }));
            }

            const user = users.find(u => u.id === payload.sub);
            if (!user) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ error: 'User associated with token no longer exists.' }));
            }

            const { passwordHash, ...userResponse } = user;
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              user: userResponse,
              claims: payload
            }));
          }

          // POST /api/auth/logout
          if (req.method === 'POST' && pathname === '/api/auth/logout') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, message: 'Session revoked.' }));
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Auth route not found.' }));
        } catch (err) {
          console.error('[Verity Auth Server Error]:', err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal auth service exception: ' + err.message }));
        }
      });
    }
  };
}
