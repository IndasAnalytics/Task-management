
export enum Role {
  Master = 'Master',
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
  SuperAdmin = 'Super Admin',
  CompanyAdmin = 'Company Admin',
  Operator = 'Operator',
}

export enum Department {
  PrePress = 'Pre-Press',
  Press = 'Press',
  PostPress = 'Post-Press',
  Sales = 'Sales',
  Management = 'Management',
}

export enum SubscriptionPlan {
  Basic = 'Basic',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

export interface Subscription {
  plan: SubscriptionPlan;
  startDate: Date;
  endDate?: Date;
  status: 'Active' | 'Suspended' | 'Cancelled';
}

export interface Company {
  id: string;
  name: string;
  status: 'Active' | 'Pending' | 'Suspended';
  subscription?: Subscription;
  plan?: string; // Kept for legacy compatibility if needed, but subscription object is preferred
  createdAt: Date;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  department: Department;
  avatar: string;
  companyId: string; // Link to Company
  companyName?: string; // Display helper
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum TaskStatus {
  New = 'New',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  AwaitingApproval = 'Done – Waiting for Approval',
  Done = 'Done',
  Overdue = 'Overdue',
  Rejected = 'Rejected',
}

export enum JobType {
  Offset = 'Offset',
  Flexo = 'Flexo',
  Digital = 'Digital',
  Screen = 'Screen',
}

export enum ColorMode {
  CMYK = 'CMYK',
  Spot = 'Spot',
  RGB = 'RGB',
}

export enum WorkflowStage {
    PrePress = 'Pre-Press',
    Press = 'Press',
    PostPress = 'Post-Press',
}

export interface PrintingDetails {
  jobType: JobType;
  paperType: string;
  gsm: number;
  colorMode: ColorMode;
  numberOfPages: number;
  plateCount: number;
  machineName: string;
  finishing: string[];
  jobTicketNumber: string;
  proofRequired: boolean;
  artworkVersion: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'ai' | 'psd' | 'jpeg' | 'png';
  uploadedAt: Date;
  version: number;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
}

export interface AiArtworkAnalysis {
    hasIssues: boolean;
    issues: string[];
    dpi: number;
    bleedDetected: boolean;
    colorProfileMatch: boolean;
    recommendation: string;
}

export interface Task {
  id: string;
  companyId: string; // Strict data isolation
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  createdAt: Date;
  estimatedHours: number;
  actualHours?: number;
  assignedTo: string[];
  createdBy: string;
  printingDetails: PrintingDetails;
  attachments: Attachment[];
  comments: Comment[];
  activityLog: ActivityLog[];
  workflowStage: WorkflowStage;
  aiAnalysis?: AiArtworkAnalysis;
}