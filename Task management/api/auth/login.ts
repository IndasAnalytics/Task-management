import { getDb } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, roleType } = req.body;

  try {
    const pool = await getDb();
    
    // Find User
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Role Check
    if (roleType === 'superadmin' && user.Role !== 'SuperAdmin') return res.status(403).json({ error: 'Access Denied' });
    if (roleType === 'client' && user.Role !== 'CompanyAdmin') return res.status(403).json({ error: 'Access Denied' });

    // Company Status Check (if not superadmin)
    if (user.CompanyId) {
        const companyRes = await pool.request()
            .input('id', sql.NVarChar, user.CompanyId)
            .query('SELECT Status, Name FROM Companies WHERE Id = @id');
        const company = companyRes.recordset[0];
        
        if (company && company.Status === 'Suspended') {
             return res.status(403).json({ error: 'Account Suspended. Contact Support.' });
        }
        user.CompanyName = company ? company.Name : '';
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.Id, role: user.Role, companyId: user.CompanyId },
      process.env.JWT_SECRET || 'default_secret_change_me',
      { expiresIn: '1d' }
    );

    // Return User Data (Sanitized)
    const { PasswordHash, ...userData } = user;
    
    // Map DB columns to Frontend Types
    const frontendUser = {
        id: userData.Id,
        fullName: userData.FullName,
        email: userData.Email,
        role: userData.Role,
        companyId: userData.CompanyId,
        companyName: userData.CompanyName,
        department: userData.Department,
        avatar: userData.Avatar || `https://i.pravatar.cc/150?u=${userData.Email}`,
        token
    };

    res.status(200).json(frontendUser);
  } catch (err: any) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}