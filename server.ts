import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_STUDENTS, 
  INITIAL_USERS, 
  INITIAL_FINES, 
  INITIAL_PAYMENTS, 
  INITIAL_VERIFICATION_LOGS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_HOD_VP_POSTS 
} from './src/data/mockData';
import { Student, Fine, Payment, VerificationLog, AuditLog, HodVpPost, IDStatus } from './src/types';

// In-memory data store for backend state
let studentsData: Student[] = [...INITIAL_STUDENTS];
let finesData: Fine[] = [...INITIAL_FINES];
let paymentsData: Payment[] = [...INITIAL_PAYMENTS];
let verificationLogsData: VerificationLog[] = [...INITIAL_VERIFICATION_LOGS];
let auditLogsData: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let hodVpPostsData: HodVpPost[] = [...INITIAL_HOD_VP_POSTS];

// OTP store
const activeOtps: Record<string, string> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SHOV College Digital ID Backend', timestamp: new Date().toISOString() });
  });

  // Auth Endpoints
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    // Fixed test OTP '123456' or random 6 digits
    const otpCode = '123456';
    activeOtps[phone] = otpCode;
    console.log(`[AUTH] Sent OTP ${otpCode} to ${phone}`);
    return res.json({ success: true, message: 'OTP sent successfully', testOtp: otpCode });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, otp, role = 'STUDENT' } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    if (otp !== '123456' && activeOtps[phone] !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP code' });
    }

    // Assign mock user based on role or phone
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[2];
    delete activeOtps[phone];

    return res.json({
      success: true,
      token: `shov-jwt-mock-${Date.now()}`,
      user
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const { role = 'STUDENT' } = req.body;
    const user = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[2];
    return res.json({
      success: true,
      token: `shov-jwt-google-${Date.now()}`,
      user
    });
  });

  // Verification API (QR scan)
  app.post('/api/verification/qr', (req, res) => {
    const { token, verifiedBy = 'u-staff-1', location = 'Security Gatehouse #1', capturedThumbnailUrl } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'QR Secure Token is required' });
    }

    // Find student by secure token or student register number
    const student = studentsData.find(s => 
      s.qrSecureToken === token || 
      s.registerNumber.toLowerCase() === token.toLowerCase() ||
      s.studentIdNumber.toLowerCase() === token.toLowerCase()
    );

    if (!student) {
      const invalidLog: VerificationLog = {
        id: `ver-${Date.now()}`,
        studentId: 'UNKNOWN',
        registerNumber: 'UNKNOWN',
        studentName: 'Unrecognized Token',
        departmentName: 'N/A',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        capturedThumbnailUrl: capturedThumbnailUrl || undefined,
        verifiedBy,
        verifierName: 'Officer Marcus Vance',
        result: 'INVALID_TOKEN',
        scanStatus: 'INVALID_TOKEN',
        scanEvent: 'Unrecognized Token Verification',
        location,
        timestamp: new Date().toLocaleString(),
        notes: 'Access Denied - Token signature invalid'
      };
      verificationLogsData.unshift(invalidLog);
      return res.status(404).json({ valid: false, status: 'INVALID_TOKEN', message: 'Digital ID not found in system database' });
    }

    const isLate = new Date().getHours() >= 21 || new Date().getHours() < 6;
    let scanStatus: 'SUCCESS' | 'DENIED' | 'LATE' | 'EXPIRED' | 'SUSPENDED' | 'BANNED' | 'INACTIVE' = 'SUCCESS';
    if (student.status === 'ACTIVE') {
      scanStatus = isLate ? 'LATE' : 'SUCCESS';
    } else if (student.status === 'EXPIRED') {
      scanStatus = 'EXPIRED';
    } else if (student.status === 'SUSPENDED') {
      scanStatus = 'SUSPENDED';
    } else if (student.status === 'BANNED') {
      scanStatus = 'BANNED';
    } else {
      scanStatus = 'DENIED';
    }

    // Log verification with optional live-captured thumbnail at moment of scan
    const log: VerificationLog = {
      id: `ver-${Date.now()}`,
      studentId: student.id,
      registerNumber: student.registerNumber,
      studentName: student.name,
      departmentName: student.departmentName,
      photoUrl: student.photoUrl,
      capturedThumbnailUrl: capturedThumbnailUrl || student.photoUrl,
      verifiedBy,
      verifierName: 'Officer Marcus Vance',
      result: student.status,
      scanStatus: scanStatus,
      scanEvent: scanStatus === 'LATE' ? 'Late Gate Pass Scan' : `${location} ID Check`,
      location,
      timestamp: new Date().toLocaleString(),
      notes: student.status === 'ACTIVE' 
        ? (isLate ? 'Late Gate Entry Flagged' : 'Access Granted - Valid Digital ID') 
        : `Access Denied - Student ID status is ${student.status}`
    };
    verificationLogsData.unshift(log);

    const isValid = student.status === 'ACTIVE';

    return res.json({
      valid: isValid,
      status: student.status,
      student: {
        id: student.id,
        name: student.name,
        registerNumber: student.registerNumber,
        photoUrl: student.photoUrl,
        departmentName: student.departmentName,
        course: student.course,
        year: student.year,
        validUntil: student.validUntil,
        status: student.status
      },
      message: isValid ? 'Valid Digital ID Verified' : `ID Access Denied: Status is ${student.status}`
    });
  });

  app.get('/api/verification/history', (req, res) => {
    return res.json(verificationLogsData);
  });

  // Students Admin APIs
  app.get('/api/admin/students', (req, res) => {
    return res.json(studentsData);
  });

  app.post('/api/admin/students', (req, res) => {
    const newStudent: Student = {
      id: `st-${Date.now()}`,
      registerNumber: req.body.registerNumber || `23CS${Math.floor(100 + Math.random() * 900)}`,
      studentIdNumber: `SHOV-2023-${req.body.registerNumber || 'CS-99'}`,
      name: req.body.name,
      photoUrl: req.body.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      departmentId: req.body.departmentId || 'dept-cs',
      departmentName: req.body.departmentName || 'Computer Science & Engineering',
      course: req.body.course || 'B.Tech',
      year: Number(req.body.year) || 1,
      collegeEmail: req.body.collegeEmail || `${req.body.name.toLowerCase().replace(/\s+/g, '.')}@student.college.edu`,
      phoneNumber: req.body.phoneNumber || '+91 98765 12345',
      status: 'ACTIVE',
      validUntil: '2027-05-31',
      issuedAt: new Date().toISOString().split('T')[0],
      qrSecureToken: `SHOV-SEC-TOK-${Math.floor(1000 + Math.random() * 9000)}-${req.body.registerNumber || 'NEW'}`
    };

    studentsData.unshift(newStudent);

    // Audit log
    auditLogsData.unshift({
      id: `aud-${Date.now()}`,
      userId: req.body.adminId || 'u-admin-1',
      userName: 'Dr. Robert Harrison',
      userRole: 'ADMIN',
      action: 'CREATE_STUDENT',
      entityType: 'STUDENT',
      entityId: newStudent.id,
      newValue: `${newStudent.name} (${newStudent.registerNumber})`,
      reason: 'New student enrollment',
      ipAddress: '192.168.1.1',
      createdAt: new Date().toLocaleString()
    });

    return res.status(201).json(newStudent);
  });

  app.patch('/api/admin/id-cards/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, reason, adminId = 'u-admin-1' } = req.body as { status: IDStatus; reason: string; adminId: string };

    const student = studentsData.find(s => s.id === id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const oldStatus = student.status;
    student.status = status;

    // Audit Log Creation
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: adminId,
      userName: 'Dr. Robert Harrison',
      userRole: 'ADMIN',
      action: 'ID_STATUS_CHANGE',
      entityType: 'STUDENT',
      entityId: student.id,
      oldValue: oldStatus,
      newValue: status,
      reason: reason || 'Administrative action',
      ipAddress: '192.168.1.1',
      createdAt: new Date().toLocaleString()
    };
    auditLogsData.unshift(audit);

    return res.json({ success: true, student, audit });
  });

  // Fine Management APIs
  app.get('/api/fines', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      return res.json(finesData.filter(f => f.studentId === studentId));
    }
    return res.json(finesData);
  });

  app.post('/api/fines', (req, res) => {
    const { studentId, amount, reason, dueDate } = req.body;
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const newFine: Fine = {
      id: `fn-${Date.now()}`,
      fineNumber: `FN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      studentName: student.name,
      registerNumber: student.registerNumber,
      amount: Number(amount),
      reason,
      dueDate: dueDate || '2026-08-31',
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    finesData.unshift(newFine);

    auditLogsData.unshift({
      id: `aud-${Date.now()}`,
      userId: 'u-admin-1',
      userName: 'Dr. Robert Harrison',
      userRole: 'ADMIN',
      action: 'FINE_CREATED',
      entityType: 'FINE',
      entityId: newFine.id,
      newValue: `₹${newFine.amount} for ${student.registerNumber}`,
      reason,
      ipAddress: '192.168.1.1',
      createdAt: new Date().toLocaleString()
    });

    return res.status(201).json(newFine);
  });

  app.patch('/api/fines/:id/waive', (req, res) => {
    const { id } = req.params;
    const fine = finesData.find(f => f.id === id);
    if (!fine) return res.status(404).json({ error: 'Fine record not found' });

    fine.status = 'WAIVED';

    auditLogsData.unshift({
      id: `aud-${Date.now()}`,
      userId: 'u-admin-1',
      userName: 'Dr. Robert Harrison',
      userRole: 'ADMIN',
      action: 'FINE_WAIVED',
      entityType: 'FINE',
      entityId: fine.id,
      oldValue: 'PENDING',
      newValue: 'WAIVED',
      reason: req.body.reason || 'Waived by Dean approval',
      ipAddress: '192.168.1.1',
      createdAt: new Date().toLocaleString()
    });

    return res.json({ success: true, fine });
  });

  // Payment Verification API
  app.post('/api/payments/create-order', (req, res) => {
    const { fineId, amount } = req.body;
    const fine = finesData.find(f => f.id === fineId);
    if (!fine) return res.status(404).json({ error: 'Fine not found' });

    const orderId = `ORD-SHOV-${Date.now()}`;
    return res.json({
      orderId,
      amount: fine.amount,
      currency: 'INR',
      fineNumber: fine.fineNumber,
      studentName: fine.studentName
    });
  });

  app.post('/api/payments/verify', (req, res) => {
    const { gatewayOrderId, gatewayPaymentId, fineId, paymentMethod = 'UPI' } = req.body;
    
    const fine = finesData.find(f => f.id === fineId);
    if (!fine) {
      return res.status(400).json({ error: 'Invalid Fine Reference' });
    }

    if (fine.status === 'PAID') {
      return res.status(400).json({ error: 'Fine has already been paid' });
    }

    // Backend verification complete -> mark PAID
    fine.status = 'PAID';
    fine.paidAt = new Date().toLocaleString();
    fine.paymentRef = gatewayPaymentId || `PAY-VERIFIED-${Date.now()}`;

    const paymentRecord: Payment = {
      id: `pay-${Date.now()}`,
      fineId: fine.id,
      studentId: fine.studentId,
      studentName: fine.studentName,
      amount: fine.amount,
      gatewayOrderId,
      gatewayPaymentId: fine.paymentRef,
      paymentMethod,
      status: 'SUCCESS',
      createdAt: new Date().toLocaleString(),
      paidAt: new Date().toLocaleString()
    };

    paymentsData.unshift(paymentRecord);

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: paymentRecord,
      fine
    });
  });

  // Audit Logs Endpoint
  app.get('/api/audit-logs', (req, res) => {
    return res.json(auditLogsData);
  });

  // HOD & VP Section Endpoints
  app.get('/api/hod-vp/posts', (req, res) => {
    return res.json(hodVpPostsData);
  });

  app.post('/api/hod-vp/posts', (req, res) => {
    const newPost: HodVpPost = {
      id: `post-${Date.now()}`,
      authorName: req.body.authorName || 'Dr. Elizabeth Montgomery',
      authorRole: req.body.authorRole || 'VICE_PRINCIPAL',
      department: req.body.department,
      authorPhotoUrl: req.body.authorPhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      title: req.body.title,
      content: req.body.content,
      photoUrl: req.body.photoUrl,
      attachmentName: req.body.attachmentName,
      isConfidential: true,
      likesCount: 0,
      createdAt: new Date().toLocaleString()
    };

    hodVpPostsData.unshift(newPost);
    return res.status(201).json(newPost);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHOV DIGITAL ID] Server running on http://localhost:${PORT}`);
  });
}

startServer();
