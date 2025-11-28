import { getDb } from '../db';
import bcrypt from 'bcryptjs';
import sql from 'mssql';
import crypto from 'crypto';
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

  const { fullName, email, password, companyName } = req.body;

  try {
    const pool = await getDb();
    const transaction = new sql.Transaction(pool);
    
    await transaction.begin();

    try {
        // 1. Check if email exists
        const userCheck = await transaction.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT Id FROM Users WHERE Email = @email');
        
        if (userCheck.recordset.length > 0) {
            throw new Error('User already exists');
        }

        // 2. Create Company
        const companyId = crypto.randomUUID();
        await transaction.request()
            .input('id', sql.NVarChar, companyId)
            .input('name', sql.NVarChar, companyName)
            .query("INSERT INTO Companies (Id, Name, Status, PlanName) VALUES (@id, @name, 'Active', 'Basic')");

        // 3. Create Admin User
        const userId = crypto.randomUUID();
        // Provide default password if missing (though frontend should enforce it)
        const passToHash = password || '123456';
        const hashedPassword = await bcrypt.hash(passToHash, 10);
        
        await transaction.request()
            .input('id', sql.NVarChar, userId)
            .input('companyId', sql.NVarChar, companyId)
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`INSERT INTO Users (Id, CompanyId, FullName, Email, PasswordHash, Role, Department) 
                    VALUES (@id, @companyId, @fullName, @email, @password, 'CompanyAdmin', 'Management')`);

        await transaction.commit();

        res.status(201).json({ success: true, message: 'Company Registered' });

    } catch (err: any) {
        await transaction.rollback();
        throw err; // Re-throw to catch block below
    }
  } catch (err: any) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
}