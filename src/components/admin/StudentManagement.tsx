import React, { useState, useEffect } from 'react';
import { Student, IDStatus } from '../../types';
import { INITIAL_STUDENTS, INITIAL_DEPARTMENTS } from '../../data/mockData';
import { fetchStudentsApi, createStudentApi } from '../../services/api';
import { IDStatusModal } from './IDStatusModal';
import { ImageLightbox } from '../common/ImageLightbox';
import { LiveCameraCaptureModal } from '../common/LiveCameraCaptureModal';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldAlert, 
  QrCode, 
  UserCheck, 
  X, 
  Sparkles,
  Filter,
  Maximize2,
  Camera,
  CheckCircle2
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const { addNotification } = useAuth();
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    photoUrl: string;
    title: string;
    subtitle?: string;
    badge?: string;
    status?: string;
    details?: { label: string; value: string }[];
  }>({
    isOpen: false,
    photoUrl: '',
    title: ''
  });

  // Live Camera capture state
  const [showLiveCaptureModal, setShowLiveCaptureModal] = useState(false);
  const [targetStudentForCamera, setTargetStudentForCamera] = useState<Student | null>(null);

  const openPhotoLightbox = (st: Student) => {
    setLightboxData({
      isOpen: true,
      photoUrl: st.photoUrl,
      title: st.name,
      subtitle: `REG: ${st.registerNumber} | ID: ${st.studentIdNumber}`,
      badge: st.departmentName,
      status: st.status,
      details: [
        { label: 'Register Number', value: st.registerNumber },
        { label: 'Course & Year', value: `${st.course} (${st.year} Yr)` },
        { label: 'Blood Group', value: st.bloodGroup || 'O+' },
        { label: 'College Email', value: st.collegeEmail }
      ]
    });
  };
  
  // Selected student for ID status modal
  const [selectedStudentForStatus, setSelectedStudentForStatus] = useState<Student | null>(null);

  // Add New Student Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRegNo, setNewRegNo] = useState('');
  const [newDepartment, setNewDepartment] = useState(INITIAL_DEPARTMENTS[0].name);
  const [newCourse, setNewCourse] = useState('B.Tech Artificial Intelligence');
  const [newYear, setNewYear] = useState(1);
  const [newPhotoUrl, setNewPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(term) ||
      s.registerNumber.toLowerCase().includes(term) ||
      s.studentIdNumber.toLowerCase().includes(term) ||
      s.departmentName.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const handleStatusUpdateSuccess = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    addNotification(
      'Student Status Updated',
      `ID status for ${updatedStudent.name} set to ${updatedStudent.status}`,
      'info'
    );
  };

  const handleCaptureForNewStudent = (photoDataUrl: string) => {
    setNewPhotoUrl(photoDataUrl);
    addNotification('Biometric Photo Added', 'Live snapshot attached to student enrollment.', 'success');
  };

  const handleCaptureForExistingStudent = (photoDataUrl: string) => {
    if (targetStudentForCamera) {
      setStudents(prev => prev.map(s => s.id === targetStudentForCamera.id ? { ...s, photoUrl: photoDataUrl } : s));
      addNotification('ID Card Photo Updated', `New biometric photo applied for ${targetStudentForCamera.name}`, 'success');
      setTargetStudentForCamera(null);
    }
  };

  const handleAddStudentSubmit = async () => {
    if (!newName || !newRegNo) {
      addNotification('Required Fields Missing', 'Please enter full name and register number.', 'warning');
      return;
    }

    const dept = INITIAL_DEPARTMENTS.find(d => d.name === newDepartment) || INITIAL_DEPARTMENTS[0];
    const newStudentData = {
      registerNumber: newRegNo.toUpperCase(),
      name: newName,
      photoUrl: newPhotoUrl,
      departmentId: dept.id,
      departmentName: dept.name,
      course: newCourse,
      year: newYear,
      collegeEmail: `${newRegNo.toLowerCase()}@shov.edu`,
      phoneNumber: '+91 98451 00000',
      status: 'ACTIVE' as IDStatus,
      validUntil: '2028-06-30',
      address: 'Campus Hostel Block C',
      bloodGroup: 'B+'
    };

    const created = await createStudentApi(newStudentData);
    setStudents(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewRegNo('');
    addNotification('Student Enrolled', `Digital ID successfully minted for ${created.name} (${created.registerNumber})`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        photoUrl={lightboxData.photoUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        badge={lightboxData.badge}
        status={lightboxData.status}
        details={lightboxData.details}
      />

      {/* Live Camera Snapshot Modal */}
      <LiveCameraCaptureModal
        isOpen={showLiveCaptureModal}
        onClose={() => {
          setShowLiveCaptureModal(false);
          setTargetStudentForCamera(null);
        }}
        onCapture={targetStudentForCamera ? handleCaptureForExistingStudent : handleCaptureForNewStudent}
        title={targetStudentForCamera ? `Update Biometric Photo (${targetStudentForCamera.name})` : "Enrollment Photo Capture"}
        subtitle="Ensure student face aligns with the biometric guidelines"
      />

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Student Registry & Digital ID Governance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {students.length} students enrolled • Real-time status toggles & digital card minting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetStudentForCamera(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
          />
        </div>

      </div>

      {/* Student Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
              <th className="pb-3">Student Name</th>
              <th className="pb-3">Register No</th>
              <th className="pb-3">Department & Course</th>
              <th className="pb-3">Issued / Valid Until</th>
              <th className="pb-3">ID Card Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group/pic flex-shrink-0">
                      <button
                        onClick={() => openPhotoLightbox(s)}
                        className="relative cursor-pointer block"
                        title="Inspect HD Photo"
                      >
                        <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/20 group-hover/pic:ring-blue-500 transition-all" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/pic:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* Take Live Photo Button for Student */}
                      <button
                        onClick={() => {
                          setTargetStudentForCamera(s);
                          setShowLiveCaptureModal(true);
                        }}
                        className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 text-cyan-400 hover:text-white border border-slate-700 hover:bg-blue-600 shadow-md cursor-pointer transition-all"
                        title="Take Live Camera ID Photo"
                      >
                        <Camera className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.collegeEmail}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{s.registerNumber}</td>
                <td className="py-3">
                  <span className="font-semibold block">{s.departmentName}</span>
                  <span className="text-[10px] text-slate-400">{s.course} • Year {s.year}</span>
                </td>
                <td className="py-3 text-slate-400 font-mono text-[11px]">
                  {s.issuedAt} → <span className="text-emerald-400 font-bold">{s.validUntil}</span>
                </td>
                <td className="py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    s.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      : s.status === 'SUSPENDED'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : s.status === 'BANNED'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                      : 'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => setSelectedStudentForStatus(s)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Manage Status</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ID Status Management Modal */}
      {selectedStudentForStatus && (
        <IDStatusModal
          student={selectedStudentForStatus}
          isOpen={!!selectedStudentForStatus}
          onClose={() => setSelectedStudentForStatus(null)}
          onStatusUpdated={handleStatusUpdateSuccess}
        />
      )}

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-blue-500">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enroll New Student & Generate Digital ID
              </h3>
            </div>

            {/* Photo Preview & Live Camera Snap */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <img
                src={newPhotoUrl}
                alt="Enrollment Preview"
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Student Biometric Photo</p>
                <p className="text-[10px] text-slate-400 mb-2">Capture live webcam snapshot or use default avatar</p>
                <button
                  type="button"
                  onClick={() => setShowLiveCaptureModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer hover:bg-blue-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Live Photo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Register Number</label>
                <input
                  type="text"
                  placeholder="23CS045"
                  value={newRegNo}
                  onChange={(e) => setNewRegNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none"
                >
                  {INITIAL_DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudentSubmit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Create Digital ID & Enroll
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
