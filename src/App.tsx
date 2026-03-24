import React, { useState, useEffect } from 'react';
import { api, User, ODRequest } from './services/api';
import { LogOut, User as UserIcon, FileText, CheckCircle, XCircle, Clock, Plus, Shield, Users, BarChart, Edit, Save, Eye, EyeOff, ChevronRight, X, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTime = (time: string | null) => {
  if (!time) return '-';
  try {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } catch (e) {
    return time;
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('first-year');
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editYear, setEditYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [profileError, setProfileError] = useState('');

  const departments = ['CSE', 'CYBER SECURITY', 'IOT', 'CSD', 'BMI', 'ECE', 'EEE'];
  const years = ['first-year', 'second-year', 'third-year', 'final-year'];

  useEffect(() => {
    const savedUser = localStorage.getItem('od_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      let userData;
      if (authMode === 'login') {
        userData = await api.login({ email, password });
      } else {
        userData = await api.register({ 
          name, 
          email, 
          password, 
          role, 
          department: (role === 'student' || role === 'faculty') ? department : undefined,
          year: role === 'student' ? year : undefined
        });
      }
      setUser(userData);
      localStorage.setItem('od_user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('od_user');
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setProfileError('');
    try {
      const updatedUser = await api.updateProfile(user.id, { 
        email: editEmail, 
        password: editPassword,
        department: editDepartment,
        year: editYear
      });
      setUser(updatedUser);
      localStorage.setItem('od_user', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message);
    }
  };

  useEffect(() => {
    if (showProfile && user) {
      setEditEmail(user.email);
      setEditPassword(user.password || '');
      setEditDepartment(user.department || '');
      setEditYear(user.year || '');
      setIsEditingProfile(false);
      setShowPassword(false);
      setProfileError('');
    }
  }, [showProfile, user]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-black/5"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-stone-900">Student OD Portal</h1>
          <p className="text-stone-500 text-center mb-8">Manage your on-duty requests efficiently</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Department</label>
                  <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase"
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Year</label>
                    <select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all capitalize"
                      required
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y.replace('-', ' ')}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showAuthPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showAuthPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white p-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="w-full mt-6 text-stone-500 text-sm hover:text-emerald-600 transition-colors"
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-stone-900 text-lg">OD Portal</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:bg-stone-50 p-1 rounded-xl transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold text-sm">
              {user.name[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-stone-900 leading-tight">{user.name}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">{user.role}</p>
                {user.role === 'student' && user.year && (
                  <>
                    <span className="text-[10px] text-stone-300">•</span>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                      {user.year.replace('-', ' ')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 bg-emerald-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Student OD Portal</h3>
                </div>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-3xl border-4 border-white shadow-md mb-3">
                    {user.name[0]}
                  </div>
                  <h4 className="text-xl font-bold text-stone-900">{user.name}</h4>
                  <p className="text-sm text-stone-500 capitalize">{user.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-semibold text-stone-500">Name:</span>
                    <span className="col-span-2 text-sm text-stone-900 font-medium">{user.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-semibold text-stone-500">Email:</span>
                    <div className="col-span-2">
                      {isEditingProfile ? (
                        <input 
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2 text-sm rounded border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      ) : (
                        <span className="text-sm text-stone-900 font-medium">{user.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm font-semibold text-stone-500">Password:</span>
                    <div className="col-span-2 relative">
                      {isEditingProfile ? (
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full p-2 pr-10 text-sm rounded border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-900 font-medium">
                            {showPassword ? user.password : "••••••••"}
                          </span>
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-stone-400 hover:text-stone-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.role === 'student' && (
                    <>
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <span className="text-sm font-semibold text-stone-500">Department:</span>
                        <div className="col-span-2">
                          {isEditingProfile ? (
                            <select 
                              value={editDepartment}
                              onChange={(e) => setEditDepartment(e.target.value)}
                              className="w-full p-2 text-sm rounded border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                            >
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-stone-900 font-medium uppercase">{user.department || '-'}</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <span className="text-sm font-semibold text-stone-500">Year:</span>
                        <div className="col-span-2">
                          {isEditingProfile ? (
                            <select 
                              value={editYear}
                              onChange={(e) => setEditYear(e.target.value)}
                              className="w-full p-2 text-sm rounded border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none capitalize"
                            >
                              {years.map(y => (
                                <option key={y} value={y}>{y.replace('-', ' ')}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-stone-900 font-medium capitalize">
                              {user.year ? (user.year.includes('-') ? user.year.replace('-', ' ') : user.year) : '-'}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {profileError && <p className="text-red-500 text-xs text-center">{profileError}</p>}

                <div className="flex gap-3 mt-8">
                  {isEditingProfile ? (
                    <>
                      <button 
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleUpdateProfile}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-semibold hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit size={18} />
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => setShowProfile(false)}
                        className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-all"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {user.role === 'student' && <StudentDashboard user={user} />}
        {user.role === 'faculty' && <FacultyDashboard user={user} />}
        {user.role === 'admin' && user.email === 'admin@example.com' && <AdminDashboard user={user} />}
        {user.role === 'admin' && user.email !== 'admin@example.com' && (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-900">Access Denied</h2>
            <p className="text-stone-500">Only the primary administrator can access this panel.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StudentDashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const prevRequestsRef = React.useRef<ODRequest[]>([]);
  const [formData, setFormData] = useState({
    department: user.department || 'CSE',
    year: user.year || 'first-year',
    date: '',
    ongoing_time: '',
    arrival_time: '',
    reason: '',
    proof: null as File | null
  });

  const departments = ['CSE', 'CYBER SECURITY', 'IOT', 'CSD', 'BMI', 'ECE', 'EEE'];
  const years = ['first-year', 'second-year', 'third-year', 'final-year'];

  const fetchRequests = async () => {
    const data = await api.getODRequests(user.id, 'student');
    
    // Check for status changes to show notifications
    if (prevRequestsRef.current.length > 0) {
      data.forEach(newReq => {
        const oldReq = prevRequestsRef.current.find(r => r.id === newReq.id);
        if (oldReq && oldReq.status === 'Pending' && newReq.status !== 'Pending') {
          setNotification({
            message: `Your OD request for ${newReq.date} has been ${newReq.status.toLowerCase()}!`,
            type: newReq.status === 'Approved' ? 'success' : 'error'
          });
          // Auto-hide notification after 10 seconds
          setTimeout(() => setNotification(null), 10000);
        }
      });
    }
    
    prevRequestsRef.current = data;
    setRequests(data);
  };

  useEffect(() => { 
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('student_id', user.id);
    data.append('student_name', user.name);
    data.append('department', user.department || 'CSE');
    data.append('year', formData.year);
    data.append('date', formData.date);
    data.append('ongoing_time', formData.ongoing_time);
    data.append('arrival_time', formData.arrival_time);
    data.append('reason', formData.reason);
    if (formData.proof) data.append('proof', formData.proof);

    try {
      await api.applyOD(data);
      setShowForm(false);
      setNotification({
        message: 'Your OD request has been submitted successfully and sent to faculty!',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 5000);
      fetchRequests();
      setFormData({ 
        department: user.department || 'CSE', 
        year: user.year || 'first-year', 
        date: '', 
        ongoing_time: '', 
        arrival_time: '', 
        reason: '', 
        proof: null 
      });
    } catch (err: any) {
      setNotification({
        message: err.message || 'Failed to submit request. Please try again.',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "mb-6 p-4 rounded-xl border flex items-center justify-between shadow-lg",
              notification.type === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <p className="font-bold">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-600">
              <XCircle size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Welcome, {user.name}</h2>
          <p className="text-stone-500 uppercase text-xs font-bold tracking-widest mt-1">
            {user.department} • {user.year}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Clock className="text-amber-500" />} label="Pending" value={requests.filter(r => r.status === 'Pending').length} color="amber" />
        <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Approved" value={requests.filter(r => r.status === 'Approved').length} color="emerald" />
        <StatCard icon={<XCircle className="text-red-500" />} label="Rejected" value={requests.filter(r => r.status === 'Rejected').length} color="red" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="font-bold text-stone-900">Your OD History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Dept</th>
                <th className="px-6 py-4 font-semibold">Year</th>
                <th className="px-6 py-4 font-semibold">Ongoing</th>
                <th className="px-6 py-4 font-semibold">Arrival</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-stone-900 font-medium">{req.date}</td>
                  <td className="px-6 py-4 text-sm text-stone-600 uppercase">{req.department}</td>
                  <td className="px-6 py-4 text-sm text-stone-600 capitalize">{req.year}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{formatTime(req.ongoing_time)}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{formatTime(req.arrival_time)}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{req.reason}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500 italic">{req.remarks || '-'}</td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-400">No requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-stone-200 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-2xl font-bold text-center text-[#1e3a5f]">Apply On-Duty (OD) Request</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Name:</label>
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        disabled
                        value={user.name}
                        className="w-full p-2 rounded border border-stone-300 bg-stone-50 text-stone-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Department Field */}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Department:</label>
                    <div className="col-span-2">
                      <input 
                        type="text" 
                        disabled
                        value={user.department?.toUpperCase() || 'CSE'}
                        className="w-full p-2 rounded border border-stone-300 bg-stone-50 text-stone-500 outline-none uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* Year Field */}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Year:</label>
                    <div className="col-span-2">
                      <select 
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none transition-all"
                      >
                        {years.map(y => (
                          <option key={y} value={y}>{y.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Field */}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Date:</label>
                    <div className="col-span-2">
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Time Fields */}
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Ongoing Time:</label>
                    <div className="col-span-2">
                      <input 
                        type="time" 
                        required
                        value={formData.ongoing_time}
                        onChange={(e) => setFormData({...formData, ongoing_time: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-sm font-semibold text-stone-600">Arrival Time:</label>
                    <div className="col-span-2">
                      <input 
                        type="time" 
                        required
                        value={formData.arrival_time}
                        onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Reason Field */}
                  <div className="grid grid-cols-3 items-start gap-4">
                    <label className="text-sm font-semibold text-stone-600 pt-2">Reason:</label>
                    <div className="col-span-2">
                      <textarea 
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none h-32 resize-none"
                        placeholder="Attending Technical Workshop"
                      />
                    </div>
                  </div>

                  {/* Proof Field */}
                  <div className="grid grid-cols-3 items-start gap-4">
                    <label className="text-sm font-semibold text-stone-600 pt-1">Upload Proof:</label>
                    <div className="col-span-2">
                      <div className="flex flex-col gap-2">
                        <input 
                          type="file" 
                          id="proof-upload"
                          className="hidden"
                          onChange={(e) => setFormData({...formData, proof: e.target.files?.[0] || null})}
                        />
                        <div className="flex items-center gap-3">
                          <label 
                            htmlFor="proof-upload"
                            className="px-4 py-1.5 bg-stone-100 border border-stone-300 rounded text-sm font-medium cursor-pointer hover:bg-stone-200 transition-all"
                          >
                            Choose File
                          </label>
                          <span className="text-sm text-stone-500">
                            {formData.proof ? formData.proof.name : 'No file chosen'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400">Upload PDF or Image (optional)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6 border-t border-stone-100">
                  <button 
                    type="submit"
                    className="px-10 py-2 bg-[#2563eb] text-white rounded font-semibold hover:bg-blue-700 transition-all shadow-sm"
                  >
                    Submit Request
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-10 py-2 bg-white border border-stone-300 text-stone-600 rounded font-semibold hover:bg-stone-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FacultyDashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<ODRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  const fetchRequests = async () => {
    const data = await api.getODRequests(undefined, 'faculty', user.department);
    setRequests(data);
  };

  useEffect(() => { 
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selectedReq) return;
    await api.updateODStatus(selectedReq.id, status, remarks);
    setSelectedReq(null);
    setRemarks('');
    fetchRequests();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Faculty Panel</h2>
          <p className="text-stone-500">Review and manage student OD applications</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Monitoring Department</p>
          <p className="text-lg font-black text-emerald-900 uppercase">{user.department}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Dept</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900">{req.student_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{req.department}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{req.date}</td>
                  <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">{req.reason}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'Pending' ? (
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="text-emerald-600 font-semibold text-sm hover:underline"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-stone-400 text-sm">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-black/5"
            >
              <h3 className="text-xl font-bold mb-4 text-stone-900">Review Request</h3>
              <div className="space-y-3 mb-6 p-4 bg-stone-50 rounded-xl">
                <p className="text-sm"><span className="font-semibold">Student:</span> {selectedReq.student_name}</p>
                <p className="text-sm"><span className="font-semibold">Department:</span> {selectedReq.department.toUpperCase()}</p>
                <p className="text-sm"><span className="font-semibold">Year:</span> <span className="capitalize">{selectedReq.year}</span></p>
                <p className="text-sm"><span className="font-semibold">Date:</span> {selectedReq.date}</p>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-sm"><span className="font-semibold">Ongoing:</span> {formatTime(selectedReq.ongoing_time)}</p>
                  <p className="text-sm"><span className="font-semibold">Arrival:</span> {formatTime(selectedReq.arrival_time)}</p>
                </div>
                <p className="text-sm"><span className="font-semibold">Reason:</span> {selectedReq.reason}</p>
                {selectedReq.proof_file && (
                  <a 
                    href={`/uploads/${selectedReq.proof_file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    View Proof Document
                  </a>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-1">Remarks</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add a reason for approval/rejection..."
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleAction('Rejected')}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-100 transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction('Approved')}
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminDashboard({ user }: { user: User }) {
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<ODRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'requests'>('overview');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDept, setEditDept] = useState('');

  const fetchData = async () => {
    try {
      const [sData, rData] = await Promise.all([
        api.getAdminStats(),
        api.getODRequests()
      ]);
      setStats(sData);
      setRequests(rData);
      if (selectedReq) {
        const updated = rData.find(r => r.id === selectedReq.id);
        if (updated) setSelectedReq(updated);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleEditFaculty = (f: any) => {
    setEditingFaculty(f);
    setEditName(f.name);
    setEditEmail(f.email);
    setEditDept(f.department);
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return;
    try {
      await api.updateProfile(editingFaculty.id.toString(), { 
        name: editName, 
        email: editEmail, 
        department: editDept 
      });
      setEditingFaculty(null);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    try {
      await api.deleteUser(id.toString());
      setShowDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const departments = Array.from(new Set(requests.map(r => r.department)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-stone-900 tracking-tight">ADMIN PANEL</h2>
          <p className="text-stone-500 font-medium">System Monitoring & Departmental Overview</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          {(['overview', 'faculty', 'requests'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider",
                activeTab === tab 
                  ? "bg-white text-stone-900 shadow-sm" 
                  : "text-stone-500 hover:text-stone-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={<Users className="text-blue-600" />} label="Total Students" value={stats.totalStudents} color="blue" />
            <StatCard icon={<FileText className="text-stone-600" />} label="Total Requests" value={stats.odStats.total || 0} color="stone" />
            <StatCard icon={<CheckCircle className="text-emerald-600" />} label="Approved" value={stats.odStats.approved || 0} color="emerald" />
            <StatCard icon={<Clock className="text-amber-600" />} label="Pending" value={stats.odStats.pending || 0} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="p-8 border-b border-stone-100">
                <h3 className="text-xl font-bold text-stone-900">Departmental Distribution</h3>
                <p className="text-sm text-stone-500">OD requests organized by department</p>
              </div>
              <div className="p-8 space-y-8">
                {departments.length > 0 ? departments.map(dept => {
                  const deptReqs = requests.filter(r => r.department === dept);
                  const approved = deptReqs.filter(r => r.status === 'Approved').length;
                  return (
                    <div key={dept} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-black uppercase tracking-widest text-stone-900">{dept}</span>
                        <span className="text-xs font-bold text-stone-500">{approved} / {deptReqs.length} Approved</span>
                      </div>
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000" 
                          style={{ width: `${(approved / deptReqs.length) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-amber-400 transition-all duration-1000" 
                          style={{ width: `${(deptReqs.filter(r => r.status === 'Pending').length / deptReqs.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-20 text-center text-stone-400 font-medium">No departmental data available</div>
                )}
              </div>
            </div>

            <div className="bg-stone-900 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">System Health</h3>
                <p className="text-stone-400 text-sm mb-8">Real-time status of the OD portal services</p>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-300">Database Connection</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-300">File Storage Service</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-300">Auth Provider</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  </div>
                </div>
              </div>
              <div className="pt-8 mt-8 border-t border-stone-800">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-black mb-1">Last Updated</p>
                <p className="text-xs font-mono text-stone-300">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'faculty' && stats && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <div className="p-8 border-b border-stone-100">
            <h3 className="text-xl font-bold text-stone-900">Faculty Login Statistics</h3>
            <p className="text-sm text-stone-500">Monitoring faculty engagement and activity</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Faculty Member</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5">Login Count</th>
                  <th className="px-8 py-5">Last Login</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.facultyStats.map((f: any) => (
                  <tr key={f.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-stone-900">{f.name}</div>
                      <div className="text-xs text-stone-500">{f.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black uppercase tracking-wider text-stone-600 bg-stone-100 px-3 py-1 rounded-lg">
                        {f.department}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm font-bold text-stone-900">
                      {f.login_count || 0}
                    </td>
                    <td className="px-8 py-6 text-sm text-stone-500">
                      {f.last_login ? new Date(f.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          f.last_login && (new Date().getTime() - new Date(f.last_login).getTime() < 300000) 
                            ? "bg-emerald-500" 
                            : "bg-stone-300"
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {f.last_login && (new Date().getTime() - new Date(f.last_login).getTime() < 300000) ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditFaculty(f)}
                          className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
                          title="Edit Faculty"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(f.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'requests' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {/* Filters */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-wrap gap-6 items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Filter Department:</span>
              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold text-stone-900 outline-none focus:ring-2 focus:ring-stone-900 uppercase"
              >
                <option value="all">All Departments</option>
                {Array.from(new Set(requests.map(r => r.department))).map((dept: string) => (
                  <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Filter Status:</span>
              <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                      filterStatus === status 
                        ? "bg-white text-stone-900 shadow-sm" 
                        : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-stone-400">
              Showing {requests.filter(r => {
                const matchDept = filterDepartment === 'all' || r.department === filterDepartment;
                const matchStatus = filterStatus === 'all' || r.status === filterStatus;
                return matchDept && matchStatus;
              }).length} of {requests.length} Requests
            </div>
          </div>

          <div className="flex overflow-x-auto pb-6 gap-8 snap-x scrollbar-hide">
            {(filterDepartment === 'all' ? Array.from(new Set(requests.map(r => r.department))) : [filterDepartment]).map((dept: string) => {
              const deptRequests = requests.filter(r => 
                r.department === dept && 
                (filterStatus === 'all' || r.status === filterStatus)
              );
              
              if (deptRequests.length === 0) return null;

              return (
                <div key={dept} className="min-w-[400px] max-w-[500px] flex-shrink-0 snap-start bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-widest text-white">{dept} Dept</h3>
                    <span className="text-[10px] font-black text-stone-400 px-3 py-1 bg-white/10 rounded-full border border-white/10 uppercase">
                      {deptRequests.length} Reqs
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
                    {deptRequests.map(r => (
                      <div 
                        key={r.id} 
                        className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedReq(r)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-200 transition-all">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 text-sm">{r.student_name}</p>
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">ID: {r.student_id} • {r.date} • {r.year.replace('-', ' ')} • {formatTime(r.ongoing_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={r.status} />
                          <ChevronRight className="text-stone-300 group-hover:text-stone-900 transition-all" size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {requests.length > 0 && (filterDepartment === 'all' ? Array.from(new Set(requests.map(r => r.department))) : [filterDepartment]).every(dept => 
              requests.filter(r => r.department === dept && (filterStatus === 'all' || r.status === filterStatus)).length === 0
            ) && (
              <div className="bg-white rounded-3xl p-20 text-center border border-stone-200 w-full">
                <FileText size={48} className="mx-auto text-stone-200 mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest">No requests match your filters</p>
              </div>
            )}
            
            {requests.length === 0 && (
              <div className="bg-white rounded-3xl p-20 text-center border border-stone-200 w-full">
                <FileText size={48} className="mx-auto text-stone-200 mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest">No OD requests found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden"
            >
              <div className="relative h-48 bg-stone-900 p-10 flex items-end justify-between">
                <div className="absolute top-6 right-6">
                  <button 
                    onClick={() => setSelectedReq(null)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase">{selectedReq.student_name}</h3>
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mt-1">
                    ID: {selectedReq.student_id} • {selectedReq.department} • {selectedReq.year.replace('-', ' ')}
                  </p>
                </div>
                <StatusBadge status={selectedReq.status} />
              </div>
              
              <div className="p-10">
                <div className="grid grid-cols-2 gap-10 mb-10">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-2">Student ID</p>
                      <p className="text-lg font-bold text-stone-900">{selectedReq.student_id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-2">Request Date</p>
                      <p className="text-lg font-bold text-stone-900">{selectedReq.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-2">Time Slot</p>
                      <p className="text-lg font-bold text-stone-900">
                        {formatTime(selectedReq.ongoing_time)} to {formatTime(selectedReq.arrival_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-2">Reason</p>
                      <p className="text-sm text-stone-600 leading-relaxed font-medium">{selectedReq.reason}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-3">Proof Document</p>
                      {selectedReq.proof_file ? (
                        <div className="group relative rounded-2xl overflow-hidden border border-stone-200 aspect-video bg-stone-50">
                          {selectedReq.proof_file.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={`/uploads/${selectedReq.proof_file}`} 
                              alt="Proof" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <FileText size={40} />
                            </div>
                          )}
                          <a 
                            href={`/uploads/${selectedReq.proof_file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold text-sm backdrop-blur-[2px]"
                          >
                            View Full Document
                          </a>
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-stone-200 p-6 text-center text-stone-400 text-xs font-bold uppercase tracking-widest">
                          No proof uploaded
                        </div>
                      )}
                    </div>
                    {selectedReq.remarks && (
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] mb-2">Faculty Remarks</p>
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic text-sm text-stone-600">
                          "{selectedReq.remarks}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedReq(null)}
                  className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {editingFaculty && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-black/5"
            >
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Edit Faculty</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-900 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-900 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Department</label>
                  <select 
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full p-4 bg-stone-50 rounded-2xl border-none focus:ring-2 focus:ring-stone-900 outline-none font-medium appearance-none uppercase"
                  >
                    {['CSE', 'CYBER SECURITY', 'IOT', 'CSD', 'BMI', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingFaculty(null)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateFaculty}
                  className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-black/5 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">Delete Faculty?</h3>
              <p className="text-stone-500 mb-8">This action cannot be undone. All data associated with this faculty member will be removed.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteFaculty(showDeleteConfirm)}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
    blue: "bg-blue-50 border-blue-100",
    stone: "bg-stone-50 border-stone-100"
  };

  return (
    <div className={cn("p-6 rounded-2xl border transition-all hover:shadow-md", colors[color])}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-sm font-medium text-stone-600">{label}</span>
      </div>
      <div className="text-3xl font-bold text-stone-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected: "bg-red-50 text-red-700 border-red-100"
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", styles[status])}>
      {status}
    </span>
  );
}
