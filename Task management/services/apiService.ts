import axios from 'axios';
import { Task, User } from '../types';

// In Vercel, API routes are served from the same origin
const API_BASE = '/api';

// --- AUTHENTICATION ---
export const apiLogin = async (email: string, roleType: string, companyId?: string, password?: string) => {
    try {
        // Send a default password for the mock flow if not provided
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
            password: '123456' // Default for demo
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};

// --- DATA FETCHING (Replacements for Mocks) ---
export const fetchTasks = async (token: string) => {
    // This calls a new endpoint we would create: /api/tasks
    // For now, in transition, we might still return Mocks if backend fails
    // But this is where the logic lives.
    return []; 
};

// --- AI SERVICE WRAPPERS ---
import { GoogleGenAI } from "@google/genai";
import { USERS, TASKS } from "../constants";

// Initialize Gemini
// Note: In a real production app, this key comes from process.env.API_KEY
// We handle the case where it might be missing for the UI to not crash.
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Helper to check if AI is available
export const isAiAvailable = () => !!ai;

// --- 1. AUTO-ASSIGN & SMART CREATE ---
export const getTaskSuggestions = async (description: string, title: string) => {
    if (!ai) {
        // Fallback/Mock for demo if no key
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

    // Simplify context to save tokens
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

        Answer the user's question naturally. If they ask to create a task, extract the details and say "I recommend creating a task...".
        If they ask about status, look up the ID or Title.
        Keep it professional but friendly.
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
        
        Keep it concise. Format with 'Subject: ...' then the body.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- 4. ARTWORK ANALYSIS (Mocking Vision capability for Demo) ---
export const analyzeArtworkRisk = async (fileName: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

    const isProblematic = fileName.toLowerCase().includes('client') || fileName.toLowerCase().includes('v1');
    
    if (isProblematic) {
        return {
            hasIssues: true,
            issues: ['Low Resolution Images (150 DPI)', 'Missing Bleed (3mm required)', 'RGB Color Mode detected (Converting to CMYK may shift colors)'],
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
    if (!ai) return ["Based on historical data, Press department is at 80% capacity.", "Task 'Annual Report' is at risk of delay due to missing paper stock."];

    const prompt = `
        Analyze these printing tasks and generate 3 bullet points of "Manager Insights".
        Focus on potential delays, bottlenecks, or anomalies.
        
        Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, due: t.dueDate, priority: t.priority })))}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text?.split('\n').filter(line => line.trim().length > 0) || [];
}