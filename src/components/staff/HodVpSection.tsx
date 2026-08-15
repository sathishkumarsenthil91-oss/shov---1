import React, { useState, useEffect } from 'react';
import { HodVpPost, Department } from '../../types';
import { INITIAL_HOD_VP_POSTS, INITIAL_DEPARTMENTS } from '../../data/mockData';
import { fetchHodVpPostsApi, createHodVpPostApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ImageLightbox } from '../common/ImageLightbox';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon, 
  FileText, 
  Lock, 
  Plus, 
  Heart, 
  Share2, 
  MessageSquare,
  Building2,
  UserCheck,
  Send,
  Maximize2,
  X
} from 'lucide-react';

export const HodVpSection: React.FC = () => {
  const { user, role, addNotification } = useAuth();
  const [posts, setPosts] = useState<HodVpPost[]>(INITIAL_HOD_VP_POSTS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [activeTab, setActiveTab] = useState<'POSTS' | 'HOD_GALLERY'>('POSTS');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

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

  const openLightbox = (photoUrl: string, title: string, subtitle?: string, badge?: string, status?: string, details?: { label: string; value: string }[]) => {
    setLightboxData({
      isOpen: true,
      photoUrl,
      title,
      subtitle,
      badge,
      status,
      details
    });
  };

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPhotoUrl, setPostPhotoUrl] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800');
  const [postDepartment, setPostDepartment] = useState('Computer Science & Engineering');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await fetchHodVpPostsApi();
    if (data.length > 0) {
      setPosts(data);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
  };

  const handleCreatePost = async () => {
    if (!postTitle || !postContent) return;
    setIsSubmitting(true);

    const newPostData: Partial<HodVpPost> = {
      authorName: user?.name || 'Dr. Aris Thorne',
      authorRole: role === 'ADMIN' ? 'VICE_PRINCIPAL' : 'HOD',
      department: postDepartment,
      authorPhotoUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
      title: postTitle,
      content: postContent,
      photoUrl: postPhotoUrl,
      isConfidential: true,
      likesCount: 1
    };

    const created = await createHodVpPostApi(newPostData);
    setIsSubmitting(false);

    if (created) {
      setPosts(prev => [created, ...prev]);
    } else {
      setPosts(prev => [{
        id: `post-${Date.now()}`,
        authorName: newPostData.authorName!,
        authorRole: newPostData.authorRole!,
        department: newPostData.department,
        authorPhotoUrl: newPostData.authorPhotoUrl!,
        title: newPostData.title!,
        content: newPostData.content!,
        photoUrl: newPostData.photoUrl,
        isConfidential: true,
        likesCount: 1,
        createdAt: new Date().toLocaleString()
      }, ...prev]);
    }

    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
    addNotification('HOD Announcement Published', 'Post broadcasted to Faculty & Staff network', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
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

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL HOD & VP NETWORK</span>
          </div>
          <h1 className="text-2xl font-black text-white">Vice Principal & HOD Photo & Circular Feed</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Restricted communication hub for Vice Principals, Heads of Departments, Faculty Councils, and Security Leads to share confidential updates, department photo highlights, and official circulars.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New HOD / Staff Post</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('POSTS')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'POSTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Official Feed & Photos ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HOD_GALLERY')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'HOD_GALLERY'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Vice Principal & HOD Directory ({departments.length + 1})</span>
          </button>
        </div>
      </div>

      {/* POSTS FEED TAB */}
      {activeTab === 'POSTS' && (
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4"
            >
              {/* Author Info */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openLightbox(post.authorPhotoUrl, post.authorName, post.authorRole, post.department, 'FACULTY AUTHOR')}
                    className="relative group cursor-pointer flex-shrink-0"
                    title="Inspect HD Author Photo"
                  >
                    <img
                      src={post.authorPhotoUrl}
                      alt={post.authorName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{post.authorName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        post.authorRole === 'VICE_PRINCIPAL' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30' 
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {post.authorRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {post.department || 'Executive Leadership'} • {post.createdAt}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3 text-blue-500" /> Faculty & Staff Only
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{post.title}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>
              </div>

              {/* Photo Share Attachment */}
              {post.photoUrl && (
                <div 
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 shadow-lg cursor-pointer group"
                  onClick={() => openLightbox(post.photoUrl!, post.title, `Published by ${post.authorName}`, post.department, 'ATTACHMENT PHOTO')}
                  title="Click to view full screen"
                >
                  <img
                    src={post.photoUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                    <Maximize2 className="w-5 h-5" />
                    <span>Click for Full Resolution Photo</span>
                  </div>
                </div>
              )}

              {/* Document Attachment Pill if present */}
              {post.attachmentName && (
                <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{post.attachmentName}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">PDF Document</span>
                </div>
              )}

              {/* Footer Engagement */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-rose-500/20 text-rose-500" />
                  <span className="font-bold">{post.likesCount} Acknowledged</span>
                </button>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>Restricted Internal Notice</span>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* HOD & VP DIRECTORY TAB */}
      {activeTab === 'HOD_GALLERY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Vice Principal Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col items-center text-center space-y-3">
            <button
              onClick={() => openLightbox(
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                'Dr. Elizabeth Montgomery',
                'Vice Principal & Executive Academic Affairs',
                'EXECUTIVE LEADERSHIP',
                'ACTIVE EXECUTIVE',
                [
                  { label: 'Office', value: 'Admin Block Suite 101' },
                  { label: 'Official Email', value: 'vp@college.edu' },
                  { label: 'Office Phone', value: '+91 98765 00001' },
                  { label: 'Jurisdiction', value: 'Academic & Admin Oversight' }
                ]
              )}
              className="relative group cursor-pointer"
              title="Inspect HD Photo"
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
                alt="Dr. Elizabeth Montgomery"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500/40 shadow-xl group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-[10px] font-bold gap-1">
                <Maximize2 className="w-4 h-4" />
              </div>
            </button>
            <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest border border-purple-500/30">
              VICE PRINCIPAL
            </span>
            <h3 className="text-base font-extrabold text-white">Dr. Elizabeth Montgomery</h3>
            <p className="text-xs text-slate-400">Executive Academic & Administrative Affairs</p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
              <p>Email: vp@college.edu</p>
              <p>Office: Admin Block Suite 101</p>
            </div>
          </div>

          {/* Department HOD Cards */}
          {departments.map((dept) => (
            <div key={dept.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center text-center space-y-3">
              <button
                onClick={() => openLightbox(
                  dept.hodPhotoUrl,
                  dept.hodName,
                  `Head of Department - ${dept.name}`,
                  dept.code,
                  'ACTIVE HOD',
                  [
                    { label: 'Department', value: dept.name },
                    { label: 'Official Email', value: dept.hodEmail },
                    { label: 'Contact Phone', value: dept.hodPhone },
                    { label: 'Total Students', value: `${dept.studentCount} Enrolled` }
                  ]
                )}
                className="relative group cursor-pointer"
                title="Inspect HD Photo"
              >
                <img
                  src={dept.hodPhotoUrl}
                  alt={dept.hodName}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-xl group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-[10px] font-bold gap-1">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </button>
              <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                HOD • {dept.code}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{dept.hodName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dept.name}</p>
              <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
                <p>{dept.hodEmail}</p>
                <p>{dept.hodPhone}</p>
                <p className="text-blue-500 font-bold">{dept.studentCount} Registered Students</p>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* NEW POST MODAL */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-blue-500">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Create HOD / VP Confidential Broadcast
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Authority
                </label>
                <select
                  value={postDepartment}
                  onChange={(e) => setPostDepartment(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="Executive Vice Principal Office">Executive Vice Principal Office</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty Strategy Meeting & ID Security Check"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Content / Circular Text
                </label>
                <textarea
                  rows={4}
                  placeholder="Type broadcast message for HODs and Security Officers..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Photo Share URL
                </label>
                <input
                  type="text"
                  value={postPhotoUrl}
                  onChange={(e) => setPostPhotoUrl(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
