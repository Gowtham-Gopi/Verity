import crypto from 'node:crypto';

// Secret key for JWT signing (HMAC SHA-256)
const JWT_SECRET = process.env.VERITY_JWT_SECRET || 'verity-quant-terminal-ultra-secure-hmac-sha256-key-2026';

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

export function createJWT(payload, expiresInSeconds = 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
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

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch (err) {
    return null;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'verity-salt-2026').digest('hex');
}

// In-memory demo users
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

export async function handleAuthRequest(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Support both Node HTTP incoming request and Web Request/Vercel Serverless
  let body = req.body;
  if (!body && typeof req.on === 'function') {
    body = await new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', chunk => { raw += chunk; });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on('error', reject);
    });
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {}
  }

  // Parse path
  const host = req.headers?.host || 'localhost';
  const url = req.url ? new URL(req.url, `http://${host}`) : { pathname: '' };
  const pathname = url.pathname;
  const method = req.method;

  try {
    // POST /api/auth/signup
    if (method === 'POST' && pathname.endsWith('/signup')) {
      const { name, email, password, desk, role } = body || {};
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
    if (method === 'POST' && pathname.endsWith('/login')) {
      const { email, password } = body || {};
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
    if (method === 'GET' && pathname.endsWith('/me')) {
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
        // If user is not found in memory (e.g. serverless instance restart), fallback to claims in token
        return res.end(JSON.stringify({
          success: true,
          user: {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            desk: payload.desk,
            clearance: payload.clearance || 'STANDARD'
          },
          claims: payload
        }));
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
    if (method === 'POST' && pathname.endsWith('/logout')) {
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
}

// Vite dev server plugin
export function authApiPlugin() {
  return {
    name: 'verity-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/auth')) {
          return next();
        }
        await handleAuthRequest(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/auth')) {
          return next();
        }
        await handleAuthRequest(req, res);
      });
    }
  };
}
