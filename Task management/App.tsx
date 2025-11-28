import React, { useState, createContext, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, Outlet, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { USERS, TASKS, COMPANIES } from './constants';
import { User, Role, Task, TaskPriority, TaskStatus, JobType, ColorMode, WorkflowStage, Comment, AiArtworkAnalysis, Department, Company, SubscriptionPlan } from './types';
import { Card, Icon, Button, Modal, Input, Select, Textarea, DateInput, StatCard } from './components/ui';
import { TasksPerEmployeeChart, TaskStatusPieChart } from './components/charts';
import { getTaskSuggestions, chatWithData, analyzeArtworkRisk, generateEmail, getDashboardInsights, apiLogin, apiRegisterCompany } from './services/apiService';

// --- THEME ---
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// --- AUTHENTICATION ---
interface AuthContextType {
  user: User | null;
  companies: Company[];
  login: (email: string, roleType: 'superadmin' | 'client' | 'staff', companyId?: string, password?: string) => Promise<boolean>;
  registerCompany: (data: any) => Promise<boolean>;
  addStaff: (data: any) => boolean;
  updateCompanySubscription: (companyId: string, plan: SubscriptionPlan, status: 'Active' | 'Suspended') => void;
  logout: () => void;
  getCompanies: () => Company[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [localUsers, setLocalUsers] = useState<User[]>(USERS);
  const [localCompanies, setLocalCompanies] = useState<Company[]>(COMPANIES);

  const getCompanies = useCallback(() => localCompanies, [localCompanies]);

  const login = useCallback(async (email: string, roleType: 'superadmin' | 'client' | 'staff', companyId?: string, password?: string) => {
      // Try Real API first
      const apiUser = await apiLogin(email, roleType, companyId, password);
      
      if (apiUser) {
          setUser(apiUser);
          return true;
      }
      
      // Fallback to Mocks for Demo if API fails (e.g., no DB connected yet)
      const foundUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (foundUser) {
          if (roleType === 'superadmin' && foundUser.role !== Role.SuperAdmin) return false;
          if (roleType === 'client' && foundUser.role !== Role.CompanyAdmin) return false;
          if (roleType === 'staff') {
              if (foundUser.role !== Role.Manager && foundUser.role !== Role.Operator) return false;
              if (companyId && foundUser.companyId !== companyId) return false;
          }
          setUser(foundUser);
          return true;
      }
      return false;
  }, [localUsers]);

  // REGISTER A NEW CLIENT (COMPANY)
  const registerCompany = useCallback(async (data: any) => {
      try {
          await apiRegisterCompany(data);
          // After registration, auto login or force login
          return true;
      } catch (err) {
          // Fallback to local mock logic
          console.warn("API Register failed, using mock", err);
          const newCompanyId = 'c-' + Math.random().toString(36).substr(2, 9);
          const newCompany: Company = {
              id: newCompanyId,
              name: data.companyName,
              status: 'Active',
              subscription: {
                  plan: SubscriptionPlan.Basic,
                  startDate: new Date(),
                  status: 'Active'
              },
              createdAt: new Date()
          };
          const newUser: User = {
              id: 'u-' + Math.random().toString(36).substr(2, 9),
              fullName: data.fullName,
              email: data.email,
              mobile: data.mobile || '000-000-0000',
              role: Role.CompanyAdmin, 
              department: Department.Management,
              avatar: `https://i.pravatar.cc/150?u=${data.email}`,
              companyId: newCompanyId,
              companyName: data.companyName
          };
          setLocalCompanies(prev => [...prev, newCompany]);
          setLocalUsers(prev => [...prev, newUser]);
          setUser(newUser); 
          return true;
      }
  }, []);

  // CLIENT ADDS STAFF (Manager or Operator)
  const addStaff = useCallback((data: any) => {
      const newUser: User = {
          id: 'u-' + Math.random().toString(36).substr(2, 9),
          fullName: data.fullName,
          email: data.email,
          mobile: '000-000-0000',
          role: data.role, // Manager or Operator
          department: data.department,
          avatar: `https://i.pravatar.cc/150?u=${data.email}`,
          companyId: data.companyId,
          companyName: data.companyName
      };
      setLocalUsers(prev => [...prev, newUser]);
      return true;
  }, []);

  // SUPER ADMIN MANAGES SUBSCRIPTION
  const updateCompanySubscription = useCallback((companyId: string, plan: SubscriptionPlan, status: 'Active' | 'Suspended') => {
      setLocalCompanies(prev => prev.map(c => {
          if (c.id === companyId) {
              return {
                  ...c,
                  status: status,
                  subscription: {
                      ...c.subscription!,
                      plan: plan,
                      status: status
                  }
              }
          }
          return c;
      }));
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ 
      user, 
      companies: localCompanies,
      login, 
      registerCompany,
      addStaff,
      updateCompanySubscription,
      logout,
      getCompanies 
  }), [user, localCompanies, login, registerCompany, addStaff, updateCompanySubscription, logout, getCompanies]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// --- AI ASSISTANT ---
const AIAssistant = () => {
    // ... (Keeping existing AI Assistant code as is, it's good)
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: 'Hi! I am PrintBot 🤖. I can help you find tasks or suggest workflows.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);
        const response = await chatWithData(userMsg, TASKS);
        setMessages(prev => [...prev, { role: 'ai', text: response || "I'm thinking..." }]);
        setIsLoading(false);
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-lg z-50 hover:scale-105 animate-bounce-slow">
                {isOpen ? <Icon name="close" className="w-6 h-6" /> : <Icon name="sparkles" className="w-6 h-6" />}
            </button>
            {isOpen && (
                <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 z-50 flex flex-col h-[500px] animate-scale-in origin-bottom-right">
                    <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl flex items-center text-white">
                        <Icon name="robot" className="w-6 h-6 mr-2" />
                        <h3 className="font-bold">PrintBot AI</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-bl-none'}`}>{msg.text}</div>
                            </div>
                        ))}
                        {isLoading && <div className="text-gray-400 text-xs ml-4">Thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-2xl flex gap-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask AI..." className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl px-4 py-2 dark:text-white" />
                        <button onClick={handleSend} className="text-indigo-500 hover:text-indigo-600 p-2"><Icon name="rightArrow" className="w-6 h-6" /></button>
                    </div>
                </div>
            )}
        </>
    );
};


// --- LAYOUT COMPONENTS ---
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const getNavItems = () => {
      // 1. SUPER ADMIN NAV
      if (user?.role === Role.SuperAdmin) {
          return [
              { name: 'SAAS Dashboard', icon: 'dashboard', path: '/' },
              { name: 'Client Management', icon: 'management', path: '/management' },
              { name: 'Global Settings', icon: 'settings', path: '/settings' }
          ]
      }

      // 2. CLIENT (Company Admin) & STAFF NAV
      const baseItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/' },
        { name: 'Tasks', icon: 'tasks', path: '/tasks' },
        { name: 'Workflow', icon: 'workflow', path: '/workflow' },
        { name: 'Reports', icon: 'reports', path: '/reports' },
      ];

      // Client can manage their own staff
      if (user?.role === Role.CompanyAdmin) {
          return [...baseItems, { name: 'Staff & Users', icon: 'user', path: '/management' }];
      }

      // Manager can manage staff (optional, or just view)
      if (user?.role === Role.Manager) {
         return [...baseItems, { name: 'Staff View', icon: 'user', path: '/management' }];
      }

      return baseItems;
  };

  const navItems = getNavItems();

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200/80 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-200/80 dark:border-gray-700">
          <Icon name="tasks" className="w-8 h-8 text-primary animate-spin-slow" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">PrintFlow</h1>
        </div>
        <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{user?.role === Role.SuperAdmin ? 'SAAS Owner' : user?.companyName}</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.name} to={item.path} end={item.path === '/'} onClick={() => window.innerWidth < 768 && onClose()} className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-400 font-semibold translate-x-1' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1'}`}>
              <Icon name={item.icon} className="w-5 h-5 mr-3" /> {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200/80 dark:border-gray-700">
          <NavLink to="/settings" onClick={() => window.innerWidth < 768 && onClose()} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1">
              <Icon name="settings" className="w-5 h-5 mr-3" /> Settings
          </NavLink>
        </div>
      </div>
    </>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleStaffPortal = () => {
    // Save company context and go to staff login
    if (user?.companyId) {
        sessionStorage.setItem('printflow_company_context', JSON.stringify({ id: user.companyId, name: user.companyName }));
        logout();
        navigate('/auth/staff');
    }
  };
  
  const getTitle = () => {
      // ... (keeping existing logic)
      if (user?.role === Role.SuperAdmin) return "Super Admin Portal";
      return "Workspace";
  }

  return (
    <header className="h-16 md:h-20 bg-white dark:bg-gray-800 border-b border-gray-200/80 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="md:hidden mr-3 text-gray-500 p-2 rounded-md"><Icon name="menu" className="w-6 h-6" /></button>
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white animate-fade-in">{getTitle()}</h2>
      </div>
      <div className="flex items-center space-x-2 md:space-x-6">
        {(user?.role === Role.CompanyAdmin) && (
            <Button size="sm" variant="secondary" onClick={handleStaffPortal} className="hidden md:flex border border-gray-300 dark:border-gray-600">
                <Icon name="user" className="w-4 h-4 mr-2"/> Launch Staff Portal
            </Button>
        )}
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-6 h-6" /></button>
        <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-3 focus:outline-none">
              <img src={user?.avatar} alt={user?.fullName} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 dark:border-gray-600" />
              <div className="text-sm text-left hidden md:block">
                <div className="font-semibold text-gray-800 dark:text-white">{user?.fullName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</div>
              </div>
            </button>
             {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-20 py-1 animate-scale-in origin-top-right">
                    <button onClick={logout} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left">
                        <Icon name="logout" className="w-4 h-4 mr-2" /> Logout
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
        <AIAssistant />
      </div>
    </div>
  );
};

// --- LANDING PAGE (SAAS SALES FOCUS) ---
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl animate-pulse-slow"></div>
            </div>

            <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full relative z-10 animate-slide-up">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary text-white p-2 rounded-lg shadow-lg"><Icon name="tasks" className="w-6 h-6" /></div>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">PrintFlow</span>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => navigate('/auth/client')}>Client Login</Button>
                    <Button onClick={() => navigate('/auth/client?mode=register')} className="shadow-lg">Start Free Trial</Button>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center px-4 py-10 relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight animate-slide-up">
                        Manage Your Print Shop <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Like a Pro</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                        Assign tasks, track operators, and deliver on time. Register your company today and invite your team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-slide-up" style={{animationDelay: '0.3s'}}>
                        <Button onClick={() => navigate('/auth/client?mode=register')} size="lg" className="text-lg px-8 py-4 shadow-xl">Create Company Account</Button>
                    </div>
                </div>
            </main>
            
             <footer className="py-8 text-center relative z-10 border-t border-gray-200/50 dark:border-gray-800 mt-auto animate-fade-in">
                <div className="text-gray-400 text-sm mb-4">© 2025 PrintFlow SAAS.</div>
                <Link to="/auth/superadmin" className="text-xs text-gray-300 dark:text-gray-700 hover:text-gray-500 transition-colors">Super Admin Portal</Link>
            </footer>
        </div>
    )
}

// --- AUTH PAGE ---
const AuthPage = () => {
    const { type } = useParams<{type: 'superadmin' | 'client' | 'staff'}>();
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, registerCompany } = useAuth();
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [staffContext, setStaffContext] = useState<{id: string, name: string} | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('mode') === 'register') setIsRegister(true);
        if (type === 'staff') {
            const savedContext = sessionStorage.getItem('printflow_company_context');
            if (savedContext) setStaffContext(JSON.parse(savedContext));
            else navigate('/'); 
        }
    }, [location, type, navigate]);

    const roleTypeMap: Record<string, 'superadmin' | 'client' | 'staff'> = {
        'superadmin': 'superadmin',
        'client': 'client',
        'staff': 'staff'
    };

    const getDemoEmail = () => {
        if (type === 'superadmin') return 'master@printflow.com';
        if (type === 'client') return 'admin@printflow.com';
        if (type === 'staff') return 'emily.p@printflow.com';
        return '';
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // await new Promise(r => setTimeout(r, 600)); // Remove fake delay

        const role = roleTypeMap[type || 'staff'];

        try {
            let success = false;
            if (isRegister) {
                // REGISTRATION IS ONLY FOR NEW CLIENTS (COMPANIES)
                if (role !== 'client') throw new Error("Registration allowed for new companies only.");
                if (!email || !password || !fullName || !companyName) throw new Error("All fields required");
                
                success = await registerCompany({ email, fullName, companyName, password });
            } else {
                success = await login(email, role, staffContext?.id, password);
            }

            if (success) navigate('/dashboard');
            else setError('Invalid credentials or account suspended.');
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const config = {
        superadmin: { title: 'SAAS Owner Portal', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        client: { title: 'Client Login', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        staff: { title: 'Staff Workspace', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    }[type || 'staff'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl relative z-10 animate-scale-in border-t-4 border-primary">
                 <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide ${config.bg} ${config.color} border ${config.border}`}>{config.title}</div>
                    {type === 'staff' && staffContext ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Login to</h2>
                            <h3 className="text-lg font-medium text-primary mb-4">{staffContext.name}</h3>
                        </>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{isRegister ? 'Register Company' : 'Sign In'}</h2>
                    )}
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div className="animate-slide-up space-y-4">
                            <Input label="Your Name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} />
                            <Input label="Company Name" placeholder="My Print Shop LLC" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </div>
                    )}
                    <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    <Button className="w-full py-3 text-base shadow-md" disabled={loading}>{loading ? 'Processing...' : (isRegister ? 'Register Company' : 'Sign In')}</Button>
                </form>

                {!isRegister && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-xs text-gray-500">
                        <p className="font-bold mb-1 uppercase text-gray-400">Demo Credentials</p>
                        <div className="flex justify-between">
                            <span>Email: <span className="font-mono text-gray-800 dark:text-gray-200">{getDemoEmail()}</span></span>
                            <span>Pass: <span className="font-mono text-gray-800 dark:text-gray-200">123456</span></span>
                        </div>
                    </div>
                )}

                {type === 'client' && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isRegister ? "Already have an account? " : "New to PrintFlow? "}
                            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary hover:underline font-medium focus:outline-none">{isRegister ? "Log In" : "Start Free Trial"}</button>
                        </p>
                    </div>
                )}
                
                <div className="mt-6 text-center">
                     <Link to="/" className="text-xs text-gray-400 hover:text-gray-500 flex items-center justify-center"><Icon name="rightArrow" className="w-3 h-3 mr-1 rotate-180" /> Back to Home</Link>
                </div>
            </Card>
        </div>
    );
};


// --- SUPER ADMIN PORTAL (SAAS OWNER) ---
const SuperAdminDashboard = () => {
    const { companies, updateCompanySubscription, registerCompany } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // New Company Form
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [newClientCompany, setNewClientCompany] = useState('');

    const handleCreateClient = async () => {
        if(newClientName && newClientEmail && newClientCompany) {
            await registerCompany({ fullName: newClientName, email: newClientEmail, companyName: newClientCompany });
            setIsModalOpen(false);
        }
    };

    return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SAAS Client Management</h1>
                <p className="text-gray-500">Manage your subscriptions and clients.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-lg"><Icon name="add" className="w-4 h-4 mr-2"/> Add New Client</Button>
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard index={0} title="Total Clients" value={companies.length} icon="management" color="bg-primary" />
            <StatCard index={1} title="Active Subs" value={companies.filter(c => c.status === 'Active').length} icon="check" color="bg-success" />
            <StatCard index={2} title="Monthly Revenue" value="$12,450" icon="reports" color="bg-indigo-500" />
            <StatCard index={3} title="Pending" value={companies.filter(c => c.status === 'Pending').length} icon="clock" color="bg-warning" />
        </div>
        
        <Card className="p-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Client Directory</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Client Company</th>
                            <th className="px-6 py-3">Subscription Plan</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Renewal Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{company.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded border ${
                                        company.subscription?.plan === SubscriptionPlan.Enterprise ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        company.subscription?.plan === SubscriptionPlan.Pro ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>
                                        {company.subscription?.plan || 'Basic'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        company.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {company.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {company.subscription?.endDate ? new Date(company.subscription.endDate).toLocaleDateString() : 'Auto-Renew'}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {company.status === 'Active' ? (
                                        <Button size="sm" variant="danger" onClick={() => updateCompanySubscription(company.id, company.subscription?.plan || SubscriptionPlan.Basic, 'Suspended')}>Suspend</Button>
                                    ) : (
                                        <Button size="sm" className="bg-success text-white" onClick={() => updateCompanySubscription(company.id, company.subscription?.plan || SubscriptionPlan.Basic, 'Active')}>Activate</Button>
                                    )}
                                    <Button size="sm" variant="secondary">Edit Plan</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>

        {/* Add Client Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client Company">
             <div className="space-y-4">
                <Input label="Company Name" placeholder="Client Business Name" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} />
                <Input label="Admin Name" placeholder="Client Contact Name" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                <Input label="Admin Email" placeholder="client@email.com" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
                <div className="flex justify-end pt-4">
                    <Button onClick={handleCreateClient}>Create Client Account</Button>
                </div>
             </div>
        </Modal>
    </div>
    );
};

// --- COMPANY ADMIN: STAFF MANAGEMENT PAGE ---
const StaffManagementPage = () => {
    const { user, addStaff } = useAuth();
    // Only show users from MY company
    const companyUsers = USERS.filter(u => u.companyId === user?.companyId);
    
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState(Role.Operator);
    const [newDept, setNewDept] = useState(Department.Press);

    const handleAddStaff = () => {
        if(newName && newEmail) {
            addStaff({
                fullName: newName,
                email: newEmail,
                role: newRole,
                department: newDept,
                companyId: user?.companyId,
                companyName: user?.companyName
            });
            setIsAddOpen(false);
            setNewName(''); setNewEmail('');
        }
    };

    return (
        <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Staff Management</h2>
                <p className="text-sm text-gray-500">Add Managers and Operators to your workspace.</p>
            </div>
            <Button onClick={() => setIsAddOpen(true)}><Icon name="add" className="w-4 h-4 mr-2"/> Add User</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyUsers.map((u, idx) => (
            <Card key={u.id} className="p-5 text-center flex flex-col items-center relative group hover:border-primary transition-colors animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                <img src={u.avatar} alt={u.fullName} className="w-24 h-24 rounded-full mx-auto mb-4 group-hover:scale-105 transition-transform" />
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{u.fullName}</p>
                <p className="text-sm font-medium text-primary mb-1">{u.role}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.department} • {u.email}</p>
                <div className="mt-4 pt-4 border-t dark:border-gray-700 w-full">
                     <p className="text-sm dark:text-gray-300"><span className="font-semibold">{TASKS.filter(t => t.assignedTo.includes(u.id)).length}</span> active tasks</p>
                </div>
            </Card>
            ))}
        </div>

        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Staff Member">
            <div className="space-y-4">
                <Input label="Full Name" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input label="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <Select label="Role" value={newRole} onChange={e => setNewRole(e.target.value as Role)}>
                    <option value={Role.Manager}>Manager (Can assign tasks)</option>
                    <option value={Role.Operator}>Operator (Can perform tasks)</option>
                </Select>
                <Select label="Department" value={newDept} onChange={e => setNewDept(e.target.value as Department)}>
                    {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleAddStaff}>Create User</Button>
                </div>
            </div>
        </Modal>
        </div>
    );
};

// --- EXISTING DASHBOARDS (Updated with Correct Data) ---
const CompanyAdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const companyTasks = TASKS.filter(t => t.companyId === user?.companyId);
    const { theme } = useTheme();

    const handleStaffLogin = () => {
        if (user?.companyId) {
            sessionStorage.setItem('printflow_company_context', JSON.stringify({ id: user.companyId, name: user.companyName }));
            logout();
            navigate('/auth/staff');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-blue-800 dark:text-blue-200">Admin Workspace: {user?.companyName}</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Manage your staff and company workflow.</p>
                </div>
                <Button onClick={handleStaffLogin} className="shadow-lg"><Icon name="user" className="w-4 h-4 mr-2" /> Launch Staff Portal</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard index={0} title="Total Tasks" value={companyTasks.length} icon="tasks" color="bg-primary" />
                <StatCard index={1} title="Completed" value={companyTasks.filter(t => t.status === TaskStatus.Done).length} icon="check" color="bg-success" />
                <StatCard index={2} title="Staff Members" value={USERS.filter(u => u.companyId === user?.companyId).length} icon="user" color="bg-warning" />
                <StatCard index={3} title="On Hold" value={companyTasks.filter(t => t.status === TaskStatus.OnHold).length} icon="clock" color="bg-danger" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Staff Workload</h3>
                    <TasksPerEmployeeChart tasks={companyTasks} users={USERS.filter(u => u.companyId === user?.companyId)} isDark={theme === 'dark'} />
                </Card>
                <Card className="p-6">
                     <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white">Task Status</h3>
                     <TaskStatusPieChart tasks={companyTasks} isDark={theme === 'dark'} />
                </Card>
            </div>
        </div>
    );
};

const StaffDashboard = () => {
    const { user } = useAuth();
    // Managers see all company tasks, Operators see only assigned
    const visibleTasks = user?.role === Role.Manager 
        ? TASKS.filter(t => t.companyId === user.companyId) 
        : TASKS.filter(t => t.assignedTo.includes(user!.id) && t.companyId === user?.companyId);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
             <h3 className="font-bold text-green-800 dark:text-green-200">{user?.role} Workspace: {user?.companyName}</h3>
             <p className="text-sm text-green-600 dark:text-green-400">Welcome back, {user?.fullName}.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard index={0} title="My Tasks" value={visibleTasks.length} icon="tasks" color="bg-primary" />
            <StatCard index={1} title="Pending" value={visibleTasks.filter(t => t.status !== TaskStatus.Done).length} icon="clock" color="bg-warning" />
            <StatCard index={2} title="Completed" value={visibleTasks.filter(t => t.status === TaskStatus.Done).length} icon="check" color="bg-success" />
        </div>
        <div>
           <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Current Task List</h3>
           <div className="space-y-3">
                {visibleTasks.slice(0, 5).map((task, idx) => (
                     <Card key={task.id} className="p-4 flex justify-between items-center animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                            <span className="text-xs text-gray-500">{task.status} • {task.priority}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => {}}><Icon name="rightArrow" className="w-4 h-4"/></Button>
                     </Card>
                ))}
           </div>
        </div>
       </div>
    );
};

// --- APP ROUTES ---
const AppRoutes = () => {
    const { user } = useAuth();
    
    // Public Flow
    if (!user) {
        return (
            <HashRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth/:type" element={<AuthPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        )
    }

    // Authenticated Flow
    return (
        <HashRouter>
             <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={
                         user?.role === Role.SuperAdmin ? <SuperAdminDashboard /> :
                         user?.role === Role.CompanyAdmin ? <CompanyAdminDashboard /> :
                         <StaffDashboard />
                    } />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    
                    <Route path="/management" element={
                         user?.role === Role.SuperAdmin ? <SuperAdminDashboard /> : 
                         user?.role === Role.CompanyAdmin ? <StaffManagementPage /> :
                         <Navigate to="/" replace />
                    } />
                    
                    {/* Placeholder routes for links in sidebar */}
                    <Route path="/tasks" element={<StaffDashboard />} />
                    <Route path="/workflow" element={
                        <div className="p-8 text-center text-gray-500">
                            <h2 className="text-2xl font-bold mb-2">Workflow Builder</h2>
                            <p>Coming Soon in Pro Plan</p>
                        </div>
                    } />
                    <Route path="/reports" element={
                         <div className="p-8 text-center text-gray-500">
                            <h2 className="text-2xl font-bold mb-2">Advanced Reports</h2>
                            <p>Coming Soon in Enterprise Plan</p>
                        </div>
                    } />
                    <Route path="/settings" element={
                         <div className="p-8 text-center text-gray-500">
                            <h2 className="text-2xl font-bold mb-2">Settings</h2>
                            <p>Manage your account preferences here.</p>
                        </div>
                    } />
                </Route>
             </Routes>
        </HashRouter>
    )
}

const App = () => (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
);

export default App;