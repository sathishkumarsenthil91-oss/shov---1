import { Student, Fine, Payment, VerificationLog, AuditLog, HodVpPost, IDStatus } from '../types';

const API_BASE = '/api';

export async function sendOtpApi(phone: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await res.json();
  } catch (err) {
    console.warn('API sendOtp error, falling back to mock:', err);
    return { success: true, testOtp: '123456' };
  }
}

export async function verifyOtpApi(phone: string, otp: string, role: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, role })
    });
    return await res.json();
  } catch (err) {
    console.warn('API verifyOtp error:', err);
    return { success: true, token: 'mock-jwt-token' };
  }
}

export async function verifyQrTokenApi(
  token: string,
  verifiedBy: string = 'u-staff-1',
  location: string = 'Main Entrance',
  capturedThumbnailUrl?: string
) {
  try {
    const res = await fetch(`${API_BASE}/verification/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, verifiedBy, location, capturedThumbnailUrl })
    });
    return await res.json();
  } catch (err) {
    console.warn('API verifyQrToken error:', err);
    return { valid: false, status: 'INVALID_TOKEN', message: 'Verification API unreachable' };
  }
}

export async function fetchStudentsApi(): Promise<Student[]> {
  try {
    const res = await fetch(`${API_BASE}/admin/students`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch students:', e);
  }
  return [];
}

export async function createStudentApi(studentData: Partial<Student>): Promise<Student | null> {
  try {
    const res = await fetch(`${API_BASE}/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to create student:', e);
  }
  return null;
}

export async function updateIdStatusApi(id: string, status: IDStatus, reason: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/id-cards/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to update status:', e);
    return false;
  }
}

export async function fetchFinesApi(studentId?: string): Promise<Fine[]> {
  try {
    const url = studentId ? `${API_BASE}/fines?studentId=${studentId}` : `${API_BASE}/fines`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch fines:', e);
  }
  return [];
}

export async function createFineApi(fineData: { studentId: string; amount: number; reason: string; dueDate?: string }): Promise<Fine | null> {
  try {
    const res = await fetch(`${API_BASE}/fines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fineData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to create fine:', e);
  }
  return null;
}

export async function verifyPaymentApi(fineId: string, amount: number, paymentMethod: string) {
  try {
    const orderRes = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fineId, amount })
    });
    const orderData = await orderRes.json();

    const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fineId,
        gatewayOrderId: orderData.orderId || `ORD-${Date.now()}`,
        gatewayPaymentId: `pay_gateway_${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod
      })
    });
    return await verifyRes.json();
  } catch (e) {
    console.warn('Failed to verify payment:', e);
    return { success: false, error: 'Payment network error' };
  }
}

export async function fetchVerificationLogsApi(): Promise<VerificationLog[]> {
  try {
    const res = await fetch(`${API_BASE}/verification/history`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch verification logs:', e);
  }
  return [];
}

export async function fetchAuditLogsApi(): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch audit logs:', e);
  }
  return [];
}

export async function fetchHodVpPostsApi(): Promise<HodVpPost[]> {
  try {
    const res = await fetch(`${API_BASE}/hod-vp/posts`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to fetch HOD VP posts:', e);
  }
  return [];
}

export async function createHodVpPostApi(postData: Partial<HodVpPost>): Promise<HodVpPost | null> {
  try {
    const res = await fetch(`${API_BASE}/hod-vp/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to create post:', e);
  }
  return null;
}
