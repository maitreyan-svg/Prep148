import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, verifyPassword } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '15mb' }));

  // Helper middleware to extract Bearer auth token
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const user = db.validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Session invalid or expired. Please sign in again.' });
    }

    (req as any).user = user;
    (req as any).token = token;
    next();
  };

  // Optional auth middleware (for public endpoints that can be personalized if logged in)
  const optionalAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      const user = db.validateSession(token);
      if (user) {
        (req as any).user = user;
        (req as any).token = token;
      }
    }
    next();
  };

  // ==================== AUTHENTICATION API ====================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Check username availability
  app.get('/api/auth/check-username', (req, res) => {
    const username = (req.query.u as string || '').trim().toLowerCase();
    if (!username || username.length < 3) {
      return res.json({ available: false, message: 'Username must be at least 3 characters.' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.json({ available: false, message: 'Only letters, numbers, and underscores are allowed.' });
    }
    const existing = db.findUserByUsername(username);
    res.json({ available: !existing });
  });

  // Sign up / Register
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { username, email, name, password, targetDailyHours, targetPercentile, quote, isPublic, initialData } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
      }

      if (username.length < 3 || username.length > 25) {
        return res.status(400).json({ error: 'Username must be between 3 and 25 characters.' });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const { user, token } = db.createUser({
        username,
        email,
        name: name || username,
        password,
        targetDailyHours: Number(targetDailyHours) || 10,
        targetPercentile: targetPercentile || '95+ Percentile (AIR < 10,000)',
        quote: quote || '148 Days. 1 Goal. AIR Under 10,000 (95+ Percentile).',
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        initialData,
      });

      const userData = db.getUserData(user.id);

      res.status(201).json({
        user: db.getSanitizedAccount(user),
        token,
        data: userData,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Sign in / Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password are required.' });
      }

      const cleanIdentifier = identifier.trim().toLowerCase();
      let user = db.findUserByUsername(cleanIdentifier);
      if (!user) {
        user = db.findUserByEmail(cleanIdentifier);
      }

      if (!user) {
        return res.status(401).json({ error: 'No account found with this username or email.' });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = db.createSession(user.id);
      const userData = db.getUserData(user.id);

      res.json({
        user: db.getSanitizedAccount(user),
        token,
        data: userData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  });

  // Get current user session info
  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const userData = db.getUserData(user.id);
    res.json({
      user: db.getSanitizedAccount(user),
      data: userData,
    });
  });

  // Log out
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      db.deleteSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Forgot password - Request reset token
  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { emailOrUsername } = req.body;
      if (!emailOrUsername) {
        return res.status(400).json({ error: 'Please provide your registered email or username.' });
      }

      const clean = emailOrUsername.trim().toLowerCase();
      let user = db.findUserByEmail(clean);
      if (!user) {
        user = db.findUserByUsername(clean);
      }

      if (!user) {
        return res.status(404).json({ error: 'No account found with that email or username.' });
      }

      // Generate secure 6-digit or hex reset code
      const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A1B2C3D4"
      const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

      db.updateUser(user.id, {
        resetToken,
        resetTokenExpiry,
      });

      // In this environment, we return the reset code directly so the user can seamlessly reset their password
      res.json({
        success: true,
        message: `Password reset code generated for ${user.username}.`,
        resetCode: resetToken,
        instructions: `Enter reset code "${resetToken}" along with your new password.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Forgot password failed.' });
    }
  });

  // Reset password
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { resetCode, newPassword } = req.body;
      if (!resetCode || !newPassword) {
        return res.status(400).json({ error: 'Reset code and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const user = db.findUserByResetToken(resetCode.trim().toUpperCase());
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset code. Please request a new code.' });
      }

      const { hash, salt } = hashPassword(newPassword);
      db.updateUser(user.id, {
        passwordHash: hash,
        salt: salt,
        resetToken: undefined,
        resetTokenExpiry: undefined,
      });

      res.json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Reset password failed.' });
    }
  });

  // ==================== USER PROFILE & SETTINGS API ====================

  // Update profile details
  app.put('/api/user/profile', authMiddleware, (req, res) => {
    try {
      const user = (req as any).user;
      const { name, username, quote, targetDailyHours, targetPercentile, avatar } = req.body;

      const updated = db.updateUser(user.id, {
        name,
        username,
        quote,
        targetDailyHours: targetDailyHours !== undefined ? Number(targetDailyHours) : undefined,
        targetPercentile,
        avatar,
      });

      res.json({
        user: db.getSanitizedAccount(updated),
        message: 'Profile updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // Update privacy & public toggle settings
  app.put('/api/user/settings', authMiddleware, (req, res) => {
    try {
      const user = (req as any).user;
      const { isPublic, privacySettings } = req.body;

      const updated = db.updateUser(user.id, {
        isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined,
        privacySettings: privacySettings ? privacySettings : undefined,
      });

      res.json({
        user: db.getSanitizedAccount(updated),
        message: 'Privacy settings updated successfully.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update settings.' });
    }
  });

  // Change password
  app.put('/api/user/change-password', authMiddleware, (req, res) => {
    try {
      const user = (req as any).user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }

      if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const { hash, salt } = hashPassword(newPassword);
      db.updateUser(user.id, { passwordHash: hash, salt: salt });

      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to change password.' });
    }
  });

  // ==================== USER TARGET 148 DATA API ====================

  // Get user data
  app.get('/api/user/data', authMiddleware, (req, res) => {
    const user = (req as any).user;
    const data = db.getUserData(user.id);
    res.json({ data });
  });

  // Save/Sync user Target 148 data
  app.put('/api/user/data', authMiddleware, (req, res) => {
    try {
      const user = (req as any).user;
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'Data payload is required.' });
      }

      db.saveUserData(user.id, data);
      res.json({ success: true, message: 'Data saved and synced to database.', timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save data.' });
    }
  });

  // ==================== PUBLIC COMMUNITY, SEARCH & COMPARE API ====================

  // Search public users
  app.get('/api/public/search', (req, res) => {
    const q = (req.query.q as string || '').trim();
    const results = db.searchPublicUsers(q);
    res.json({ results });
  });

  // Get single public user profile
  app.get('/api/public/user/:username', (req, res) => {
    const username = req.params.username;
    const profile = db.getPublicUserProfile(username);

    if (!profile) {
      return res.status(404).json({ error: `Public profile for @${username} not found or user is private.` });
    }

    res.json({ profile });
  });

  // Public leaderboard
  app.get('/api/public/leaderboard', (req, res) => {
    const sortBy = (req.query.sortBy as any) || 'progress';
    const leaderboard = db.getPublicLeaderboard(sortBy);
    res.json({ leaderboard });
  });

  // Public side-by-side compare
  app.get('/api/public/compare', (req, res) => {
    const u1 = req.query.u1 as string;
    const u2 = req.query.u2 as string;

    if (!u1 || !u2) {
      return res.status(400).json({ error: 'Both u1 and u2 query parameters are required for comparison.' });
    }

    const profile1 = db.getPublicUserProfile(u1);
    const profile2 = db.getPublicUserProfile(u2);

    if (!profile1) {
      return res.status(404).json({ error: `User @${u1} not found or has private profile.` });
    }
    if (!profile2) {
      return res.status(404).json({ error: `User @${u2} not found or has private profile.` });
    }

    res.json({
      user1: profile1,
      user2: profile2,
    });
  });

  // Catch-all 404 for unhandled API requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found.` });
  });

  // ==================== VITE & STATIC FILES SERVING ====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JEE Mission 148 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
