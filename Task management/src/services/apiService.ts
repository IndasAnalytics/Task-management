import axios from 'axios';
import { Task, User } from '../types';

// Use relative path for Vercel & Vite Proxy compatibility
const API_BASE = '/api';

// --- AUTHENTICATION ---
export const apiLogin = async (email: string, roleType: string, companyId?: string, password?: string) => {
    try {
        const res = await axios.post(`${API_BASE}/auth/login`, { 
            email, 
            password: password || '123456', 
            roleType 
        });
        return res.data;
    } catch (error) {
        console.error("Login Failed", error);
        return null;
    }
};

export const apiRegisterCompany = async (data: any) => {
    try {
        const res = await axios.post(`${API_BASE}/auth/register`, {
            ...data,
            password: data.password || '123456' 
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// --- DATA FETCHING ---
export const fetchTasks = async (token: string) => {
    // Placeholder for real task fetching
    // await axios.get(`${API_BASE}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
    return []; 
};

// --- AI SERVICE WRAPPERS ---
import { GoogleGenAI } from "@google/genai";
import { USERS, TASKS } from "../constants";

// Initialize Gemini (Handle missing key gracefully for UI)
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const isAiAvailable = () => !!ai;

// --- 1. AUTO-ASSIGN & SMART CREATE ---
export const getTaskSuggestions = async (description: string, title: string) => {
    if (!ai) {
        return {
            priority: 'Medium',
            estimatedHours: 4,
            suggestedAssigneeId: 'u3',
            reasoning: "Based on keywords 'printing' and 'urgent', assigned to Press department."
        };
    }

    const prompt = `
        You are an expert Print Production Manager AI.
        Analyze this task: Title: "${title}", Description: "${description}".
        
        Available Users:
        ${JSON.stringify(USERS.map(u => ({ id: u.id, name: u.fullName, role: u.role, dept: u.department })))}

        Recommend:
        1. The best TaskPriority (Low, Medium, High, Urgent).
        2. Estimated hours (number).
        3. The best User ID to assign to based on their department and role.
        4. A brief reasoning why.

        Return ONLY valid JSON: { "priority": "...", "estimatedHours": 0, "suggestedAssigneeId": "...", "reasoning": "..." }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("AI Error", e);
        return null;
    }
};

// --- 2. CHATBOT (RAG-Lite) ---
export const chatWithData = async (userQuery: string, contextTasks: Task[]) => {
    if (!ai) return "I'm in demo mode. Please add a valid API Key to enable my brain!";

    const taskSummary = contextTasks.map(t => 
        `ID:${t.id} Title:${t.title} Status:${t.status} Priority:${t.priority} Assigned:${t.assignedTo.join(',')} Due:${new Date(t.dueDate).toDateString()}`
    ).join('\n');

    const prompt = `
        You are "PrintBot", a helpful assistant for a printing company.
        
        Current System Data:
        Users: ${JSON.stringify(USERS.map(u => u.fullName))}
        Tasks:
        ${taskSummary}

        User Query: "${userQuery}"
    `;

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (e) {
        return "Sorry, I had trouble processing that request.";
    }
};

// --- 3. EMAIL GENERATOR ---
export const generateEmail = async (task: Task, type: 'assignment' | 'overdue' | 'reminder') => {
    if (!ai) return `Subject: Task Update\n\nPlease check task ${task.title}.`;

    const assignee = USERS.find(u => u.id === task.assignedTo[0]);
    
    const prompt = `
        Write a professional email for a printing company.
        Type: ${type}
        To: ${assignee?.fullName}
        Task: ${task.title}
        Due Date: ${new Date(task.dueDate).toDateString()}
        Context: ${task.description}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- 4. ARTWORK ANALYSIS ---
export const analyzeArtworkRisk = async (fileName: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const isProblematic = fileName.toLowerCase().includes('client') || fileName.toLowerCase().includes('v1');
    
    if (isProblematic) {
        return {
            hasIssues: true,
            issues: ['Low Resolution Images (150 DPI)', 'Missing Bleed (3mm required)', 'RGB Color Mode detected'],
            dpi: 150,
            bleedDetected: false,
            colorProfileMatch: false,
            recommendation: 'Reject artwork and request high-res PDF with bleed.'
        };
    }
    
    return {
        hasIssues: false,
        issues: [],
        dpi: 300,
        bleedDetected: true,
        colorProfileMatch: true,
        recommendation: 'Artwork looks good. Ready for plating.'
    };
};

// --- 5. DASHBOARD INSIGHTS ---
export const getDashboardInsights = async (tasks: Task[]) => {
    if (!ai) return ["Based on historical data, Press department is at 80% capacity.", "Task 'Annual Report' is at risk of delay."];

    const prompt = `
        Analyze these printing tasks and generate 3 bullet points of "Manager Insights".
        Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, due: t.dueDate, priority: t.priority })))}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text?.split('\n').filter(line => line.trim().length > 0) || [];
}