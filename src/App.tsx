import React, { useState, useEffect } from 'react';
import { api, User, ODRequest } from './services/api';
import { LogOut, User as UserIcon, FileText, CheckCircle, XCircle, Clock, Plus, Shield, Users, BarChart, Edit, Save, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [department, setDepartment] = useState('cse');
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

  const departments = ['cse', 'cyber security', 'iot', 'csd', 'bmi', 'ece', 'eee'];
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
          department: role === 'student' ? department : undefined,
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
            {authMode === 'signup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Department</label>
                      <select 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Year</label>
                      <select 
                        value={year} 
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>{y.replace('-', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
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
        {user.role === 'admin' && <AdminDashboard user={user} />}
      </main>
    </div>
  );
}

function StudentDashboard({ user }: { user: User }) {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    department: user.department || 'cse',
    year: user.year || 'first-year',
    date: '',
    ongoing_time: '',
    arrival_time: '',
    reason: '',
    proof: null as File | null
  });

  const departments = ['cse', 'cyber security', 'iot', 'csd', 'bmi', 'ece', 'eee'];
  const years = ['first-year', 'second-year', 'third-year', 'final-year'];

  const fetchRequests = async () => {
    const data = await api.getODRequests(user.id, 'student');
    setRequests(data);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('student_id', user.id);
    data.append('student_name', user.name);
    data.append('department', formData.department);
    data.append('year', formData.year);
    data.append('date', formData.date);
    data.append('ongoing_time', formData.ongoing_time);
    data.append('arrival_time', formData.arrival_time);
    data.append('reason', formData.reason);
    if (formData.proof) data.append('proof', formData.proof);

    await api.applyOD(data);
    setShowForm(false);
    fetchRequests();
    setFormData({ 
      department: user.department || 'cse', 
      year: user.year || 'first-year', 
      date: '', 
      ongoing_time: '', 
      arrival_time: '', 
      reason: '', 
      proof: null 
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
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
                  <td className="px-6 py-4 text-sm text-stone-600">{req.ongoing_time || '-'}</td>
                  <td className="px-6 py-4 text-sm text-stone-600">{req.arrival_time || '-'}</td>
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
                      <select 
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full p-2 rounded border border-stone-300 focus:border-blue-500 outline-none transition-all"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept.toUpperCase()}</option>
                        ))}
                      </select>
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
    const data = await api.getODRequests(undefined, 'faculty');
    setRequests(data);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!selectedReq) return;
    await api.updateODStatus(selectedReq.id, status, remarks);
    setSelectedReq(null);
    setRemarks('');
    fetchRequests();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900">Faculty Panel</h2>
        <p className="text-stone-500">Review and manage student OD applications</p>
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
                  <p className="text-sm"><span className="font-semibold">Ongoing:</span> {selectedReq.ongoing_time || '-'}</p>
                  <p className="text-sm"><span className="font-semibold">Arrival:</span> {selectedReq.arrival_time || '-'}</p>
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
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ODRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [uData, rData] = await Promise.all([
        api.getAllUsers(),
        api.getODRequests()
      ]);
      setUsers(uData);
      setRequests(rData);
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-stone-900">Admin Control Center</h2>
        <p className="text-stone-500">System-wide overview and user management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value={users.length} color="blue" />
        <StatCard icon={<FileText className="text-stone-500" />} label="Total ODs" value={requests.length} color="stone" />
        <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Approved" value={requests.filter(r => r.status === 'Approved').length} color="emerald" />
        <StatCard icon={<Clock className="text-amber-500" />} label="Pending" value={requests.filter(r => r.status === 'Pending').length} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-bold text-stone-900">Recent Users</h3>
            <button className="text-xs text-emerald-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-stone-100">
            {users.slice(0, 5).map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{u.name}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-stone-100 rounded-md text-stone-500">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-bold text-stone-900">Recent OD Requests</h3>
            <button className="text-xs text-emerald-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-stone-100">
            {requests.slice(0, 5).map(r => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{r.student_name}</p>
                  <p className="text-xs text-stone-500">{r.date} • {r.department}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
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
