const API_URL = '';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  year?: string;
}

export interface ODRequest {
  id: number;
  student_id: string;
  student_name: string;
  department: string;
  year: string;
  date: string;
  ongoing_time: string | null;
  arrival_time: string | null;
  reason: string;
  proof_file: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks: string | null;
  created_at: string;
}

export const api = {
  async register(data: any): Promise<User> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },

  async login(data: any): Promise<User> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Invalid email or password');
    }
    return res.json();
  },

  async getUser(id: string): Promise<User | null> {
    const res = await fetch(`${API_URL}/api/users/${id}`);
    return res.json();
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/api/admin/users`);
    return res.json();
  },

  async applyOD(formData: FormData) {
    const res = await fetch(`${API_URL}/api/od`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit OD request');
    }
    return res.json();
  },

  async getODRequests(student_id?: string, role?: string, department?: string): Promise<ODRequest[]> {
    const params = new URLSearchParams();
    if (student_id) params.append('student_id', student_id);
    if (role) params.append('role', role);
    if (department) params.append('department', department);
    const res = await fetch(`${API_URL}/api/od?${params.toString()}`);
    return res.json();
  },

  async getAdminStats(): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/stats`);
    return res.json();
  },

  async updateODStatus(id: number, status: string, remarks: string) {
    const res = await fetch(`${API_URL}/api/od/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  async updateProfile(id: string, data: { name?: string; email: string; password?: string; department?: string; year?: string }): Promise<User> {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Update failed');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Delete failed');
    }
  }
};
