import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  ArrowLeft,
  CheckCircle2,
  X,
  UserCheck,
  Building,
  Briefcase,
  Users,
  Sparkles,
  School,
  FileCheck,
  Printer
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AdminUser, UserRole, TeacherDutyCategory } from '../../types';
import { cn, formatIndonesianDate } from '../../lib/utils';
import { KopSuratHeader } from '../layout/KopSuratHeader';

interface DataGuruViewProps {
  onBack?: () => void;
  setActiveTab?: (tab: any) => void;
}

const TINGKAT_KELAS_OPTIONS = [
  { value: 'Kelas 1', label: 'Kelas 1 (Fase A)' },
  { value: 'Kelas 2', label: 'Kelas 2 (Fase A)' },
  { value: 'Kelas 3', label: 'Kelas 3 (Fase B)' },
  { value: 'Kelas 4', label: 'Kelas 4 (Fase B)' },
  { value: 'Kelas 5', label: 'Kelas 5 (Fase C)' },
  { value: 'Kelas 6', label: 'Kelas 6 (Fase C)' },
];

const MAPEL_OPTIONS = [
  'Pendidikan Agama Islam & Budi Pekerti',
  'Pendidikan Agama Kristen & Budi Pekerti',
  'Pendidikan Agama Katolik & Budi Pekerti',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
  'Bahasa Inggris',
  'Seni Budaya & Prakarya',
  'Pendidikan Pancasila (PPKn)',
  'Matematika',
  'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  'Bahasa Daerah / Muatan Lokal',
  'Bimbingan Konseling (BK)',
];

const TENDIK_OPTIONS = [
  'Operator Dapodik & SIM Sekolah',
  'Tenaga Administrasi Sekolah (Tata Usaha)',
  'Pengelola Perpustakaan Sekolah',
  'Bendahara BOS & Keuangan Sekolah',
  'Petugas Keamanan / Penjaga Sekolah',
  'Petugas Kebersihan / Pelaksana Teknis',
];

export const DataGuruView: React.FC<DataGuruViewProps> = ({
  onBack,
  setActiveTab,
}) => {
  const {
    adminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    currentRole,
    schoolProfile,
    getWaliKelasForClass
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | TeacherDutyCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AdminUser | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nama: string;
    nip: string;
    email: string;
    kategoriTugas: TeacherDutyCategory;
    tingkatKelas: string;
    mataPelajaran: string;
    tugasTendik: string;
    jabatan: string;
    isCustomJabatan: boolean;
    role: UserRole;
    status: 'Aktif' | 'Nonaktif';
    avatarColor: string;
  }>({
    nama: '',
    nip: '',
    email: '',
    kategoriTugas: 'wali_kelas',
    tingkatKelas: 'Kelas 1',
    mataPelajaran: MAPEL_OPTIONS[0],
    tugasTendik: TENDIK_OPTIONS[0],
    jabatan: 'Wali Kelas 1',
    isCustomJabatan: false,
    role: 'user',
    status: 'Aktif',
    avatarColor: 'bg-blue-600',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to infer duty category from existing jabatan text if undefined
  const inferCategory = (teacher: AdminUser): TeacherDutyCategory => {
    if (teacher.kategoriTugas) return teacher.kategoriTugas;
    const jab = (teacher.jabatan || '').toLowerCase();
    if (jab.includes('kepala sekolah') || jab.includes('kepsek')) return 'kepala_sekolah';
    if (jab.includes('wali') || jab.includes('guru kelas')) return 'wali_kelas';
    if (jab.includes('mapel') || jab.includes('pai') || jab.includes('pjok') || jab.includes('agama')) return 'guru_mapel';
    if (jab.includes('operator') || jab.includes('tu') || jab.includes('administrasi') || jab.includes('pustaka') || jab.includes('tendik')) return 'tenaga_kependidikan';
    return 'wali_kelas';
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nama: '',
      nip: '',
      email: '',
      kategoriTugas: 'wali_kelas',
      tingkatKelas: 'Kelas 1',
      mataPelajaran: MAPEL_OPTIONS[0],
      tugasTendik: TENDIK_OPTIONS[0],
      jabatan: 'Wali Kelas 1',
      isCustomJabatan: false,
      role: 'user',
      status: 'Aktif',
      avatarColor: 'bg-blue-600',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingTeacher(user);
    const cat = inferCategory(user);
    
    // Attempt to extract tingkat kelas if wali kelas
    let tKelas = user.tingkatKelas || 'Kelas 1';
    if (!user.tingkatKelas) {
      const match = (user.jabatan || '').match(/kelas\s*(\d+)/i);
      if (match) tKelas = `Kelas ${match[1]}`;
    }

    setFormData({
      nama: user.nama,
      nip: user.nip || '',
      email: user.email,
      kategoriTugas: cat,
      tingkatKelas: tKelas,
      mataPelajaran: user.mataPelajaran || MAPEL_OPTIONS[0],
      tugasTendik: user.tugasTendik || TENDIK_OPTIONS[0],
      jabatan: user.jabatan,
      isCustomJabatan: true,
      role: user.role,
      status: user.status,
      avatarColor: user.avatarColor || 'bg-blue-600',
    });
    setIsModalOpen(true);
  };

  // Helper to re-compute auto jabatan
  const computeAutoJabatan = (cat: TeacherDutyCategory, tKelas: string, mapel: string, tendik: string) => {
    switch (cat) {
      case 'kepala_sekolah':
        return 'Kepala Sekolah';
      case 'wali_kelas':
        return `Wali ${tKelas}`;
      case 'guru_mapel':
        return `Guru Mapel ${mapel}`;
      case 'tenaga_kependidikan':
        return `Tenaga Kependidikan - ${tendik}`;
      default:
        return 'Guru / Staf';
    }
  };

  const handleCategoryChange = (newCat: TeacherDutyCategory) => {
    const autoRole: UserRole = newCat === 'kepala_sekolah' ? 'admin' : newCat === 'tenaga_kependidikan' ? 'admin' : 'user';
    const autoJabatan = computeAutoJabatan(newCat, formData.tingkatKelas, formData.mataPelajaran, formData.tugasTendik);
    
    setFormData(prev => ({
      ...prev,
      kategoriTugas: newCat,
      role: autoRole,
      jabatan: prev.isCustomJabatan ? prev.jabatan : autoJabatan,
    }));
  };

  const handleTingkatChange = (tKelas: string) => {
    const autoJabatan = computeAutoJabatan('wali_kelas', tKelas, formData.mataPelajaran, formData.tugasTendik);
    setFormData(prev => ({
      ...prev,
      tingkatKelas: tKelas,
      jabatan: prev.isCustomJabatan ? prev.jabatan : autoJabatan,
    }));
  };

  const handleMapelChange = (mapel: string) => {
    const autoJabatan = computeAutoJabatan('guru_mapel', formData.tingkatKelas, mapel, formData.tugasTendik);
    setFormData(prev => ({
      ...prev,
      mataPelajaran: mapel,
      jabatan: prev.isCustomJabatan ? prev.jabatan : autoJabatan,
    }));
  };

  const handleTendikChange = (tendik: string) => {
    const autoJabatan = computeAutoJabatan('tenaga_kependidikan', formData.tingkatKelas, formData.mataPelajaran, tendik);
    setFormData(prev => ({
      ...prev,
      tugasTendik: tendik,
      jabatan: prev.isCustomJabatan ? prev.jabatan : autoJabatan,
    }));
  };

  const handleDelete = (user: AdminUser) => {
    if (adminUsers.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya akun pengguna.');
      return;
    }
    if (confirm(`Hapus data guru/staf "${user.nama}" dari sistem?`)) {
      deleteAdminUser(user.id);
      showToast(`Data guru "${user.nama}" berhasil dihapus.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama guru wajib diisi.');
      return;
    }

    const payload: Omit<AdminUser, 'id' | 'terakhirLogin'> = {
      nama: formData.nama.trim(),
      nip: formData.nip.trim(),
      email: formData.email.trim(),
      jabatan: formData.jabatan.trim() || computeAutoJabatan(formData.kategoriTugas, formData.tingkatKelas, formData.mataPelajaran, formData.tugasTendik),
      kategoriTugas: formData.kategoriTugas,
      tingkatKelas: formData.kategoriTugas === 'wali_kelas' ? formData.tingkatKelas : undefined,
      mataPelajaran: formData.kategoriTugas === 'guru_mapel' ? formData.mataPelajaran : undefined,
      tugasTendik: formData.kategoriTugas === 'tenaga_kependidikan' ? formData.tugasTendik : undefined,
      role: formData.role,
      status: formData.status,
      avatarColor: formData.avatarColor,
    };

    if (editingTeacher) {
      updateAdminUser(editingTeacher.id, payload);
      showToast(`Data guru "${formData.nama}" berhasil diperbarui.`);
    } else {
      addAdminUser(payload);
      showToast(`Guru baru "${formData.nama}" berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const filteredTeachers = adminUsers.filter((t) => {
    const matchesSearch = 
      t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.nip && t.nip.includes(searchTerm)) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cat = inferCategory(t);
    const matchesCategory = filterCategory === 'all' || cat === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const totalTeachers = adminUsers.length;
  const totalActive = adminUsers.filter(u => u.status === 'Aktif').length;
  const totalWaliKelas = adminUsers.filter(u => inferCategory(u) === 'wali_kelas').length;
  const totalGuruMapel = adminUsers.filter(u => inferCategory(u) === 'guru_mapel').length;
  const totalTendik = adminUsers.filter(u => inferCategory(u) === 'tenaga_kependidikan').length;
  const totalKepsek = adminUsers.filter(u => inferCategory(u) === 'kepala_sekolah').length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : setActiveTab ? setActiveTab('dashboard') : null)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4 text-[#003399] dark:text-blue-400" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Data Guru & Tenaga Kependidikan
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-extrabold text-xs">
                {totalTeachers} Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manajemen dewan guru, penugasan wali kelas tingkat 1–6, guru mapel, dan kepala sekolah {schoolProfile.namaSekolah}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            title="Cetak Rekapitulasi Data Guru & Tenaga Kependidikan dengan Kop Surat Resmi"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Cetak Daftar PTK</span>
          </button>
          {currentRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#003399] hover:bg-[#002266] active:bg-[#001a4d] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>+ Tambah Data Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Guru & Staf
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {totalTeachers}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {totalActive} Status Aktif
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003399] dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Wali Kelas (1–6)
            </div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {totalWaliKelas}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              Otomatis Terisi di Raport
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Guru Mapel & Tendik
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {totalGuruMapel + totalTendik}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {totalGuruMapel} Mapel • {totalTendik} Tendik
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kepala Sekolah
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-[150px]">
              {schoolProfile.namaKepalaSekolah || 'H. Marlisman, S.Pd.'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              NIP: {schoolProfile.nipKepalaSekolah || '1968...'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama guru, NIP, atau jabatan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden font-semibold"
          >
            <option value="all">Semua Kategori Tugas & Jabatan</option>
            <option value="kepala_sekolah">🏫 Kepala Sekolah</option>
            <option value="wali_kelas">🎓 Wali Kelas (Tingkat 1 - 6)</option>
            <option value="guru_mapel">📚 Guru Mata Pelajaran</option>
            <option value="tenaga_kependidikan">🏢 Tenaga Kependidikan / TU</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => {
          const category = inferCategory(teacher);

          return (
            <div
              key={teacher.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0",
                      teacher.avatarColor || "bg-blue-600"
                    )}>
                      {teacher.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                        {teacher.nama}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {teacher.jabatan}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0",
                    teacher.status === 'Aktif'
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  )}>
                    {teacher.status}
                  </span>
                </div>

                {/* Duty Category Tag & Auto-Fill Info */}
                <div className="mt-3">
                  {category === 'kepala_sekolah' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                      <School className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kepala Sekolah • TTD Raport & Dokumen</span>
                    </div>
                  )}

                  {category === 'wali_kelas' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Wali Kelas • Terisi di Raport & Input Nilai</span>
                    </div>
                  )}

                  {category === 'guru_mapel' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                      <span>Guru Mapel {teacher.mataPelajaran ? `• ${teacher.mataPelajaran}` : ''}</span>
                    </div>
                  )}

                  {category === 'tenaga_kependidikan' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                      <Briefcase className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>Tenaga Kependidikan (Tendik)</span>
                    </div>
                  )}
                </div>

                {/* Detail fields */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">NIP / NUPTK:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {teacher.nip || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email Akun:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
                      {teacher.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Hak Akses:</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      teacher.role === 'admin' 
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        : teacher.role === 'user'
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    )}>
                      {teacher.role === 'admin' ? 'Administrator' : teacher.role === 'user' ? 'Guru Kelas / Pengampu' : 'Tamu / Umum'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {currentRole === 'admin' && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Data</span>
                  </button>
                  <button
                    onClick={() => handleDelete(teacher)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Tidak ada data guru yang cocok
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau ganti filter kategori penugasan.
          </p>
        </div>
      )}

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 my-8 max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#003399] dark:text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {editingTeacher ? 'Edit Data Guru & Penugasan' : 'Tambah Data Guru Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lengkapi identitas, tugas, dan penugasan langsung untuk raport
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Nama Lengkap */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              {/* NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19850614 201001 2 012"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Otomatis tercetak pada kolom TTD raport</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guru@sdn006.sch.id"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* KATEGORI JABATAN / TUGAS (MAIN SELECTOR) */}
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/70 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-blue-950 dark:text-blue-200 text-xs">
                    Pilihan Kategori Jabatan / Tugas <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Otomatis Sinkron Raport
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('kepala_sekolah')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer",
                      formData.kategoriTugas === 'kepala_sekolah'
                        ? "bg-[#003399] text-white border-[#003399] shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <School className="w-4 h-4 shrink-0 text-amber-400" />
                    <div>
                      <div className="text-[11px] leading-tight">Kepala Sekolah</div>
                      <div className="text-[9.5px] opacity-80 font-normal">Penanggung Jawab</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('wali_kelas')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer",
                      formData.kategoriTugas === 'wali_kelas'
                        ? "bg-[#003399] text-white border-[#003399] shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0 text-sky-400" />
                    <div>
                      <div className="text-[11px] leading-tight">Wali Kelas Sesuai Tingkat</div>
                      <div className="text-[9.5px] opacity-80 font-normal">Tingkat Kelas 1 - 6</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('guru_mapel')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer",
                      formData.kategoriTugas === 'guru_mapel'
                        ? "bg-[#003399] text-white border-[#003399] shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <BookOpen className="w-4 h-4 shrink-0 text-teal-400" />
                    <div>
                      <div className="text-[11px] leading-tight">Guru Mapel</div>
                      <div className="text-[9.5px] opacity-80 font-normal">Mata Pelajaran</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('tenaga_kependidikan')}
                    className={cn(
                      "p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 cursor-pointer",
                      formData.kategoriTugas === 'tenaga_kependidikan'
                        ? "bg-[#003399] text-white border-[#003399] shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Briefcase className="w-4 h-4 shrink-0 text-amber-400" />
                    <div>
                      <div className="text-[11px] leading-tight">Tenaga Kependidikan</div>
                      <div className="text-[9.5px] opacity-80 font-normal">Operator / TU / Staf</div>
                    </div>
                  </button>
                </div>

                {/* Sub-selectors per Category */}
                {formData.kategoriTugas === 'wali_kelas' && (
                  <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/70 space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      Pilih Tingkat Kelas yang Diampu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.tingkatKelas}
                      onChange={(e) => handleTingkatChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-hidden"
                    >
                      {TINGKAT_KELAS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="p-2.5 rounded-xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 text-[11px] font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-300 shrink-0" />
                      <span>Data nama & NIP guru ini akan <strong>otomatis terisi</strong> pada form input nilai dan tanda tangan lembar cetak raport untuk siswa <strong>{formData.tingkatKelas}</strong>.</span>
                    </div>
                  </div>
                )}

                {formData.kategoriTugas === 'guru_mapel' && (
                  <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/70 space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      Pilih Mata Pelajaran yang Diampu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.mataPelajaran}
                      onChange={(e) => handleMapelChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-hidden"
                    >
                      {MAPEL_OPTIONS.map((mapel) => (
                        <option key={mapel} value={mapel}>
                          {mapel}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.kategoriTugas === 'tenaga_kependidikan' && (
                  <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/70 space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      Pilih Penugasan Administrasi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.tugasTendik}
                      onChange={(e) => handleTendikChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-hidden"
                    >
                      {TENDIK_OPTIONS.map((tendik) => (
                        <option key={tendik} value={tendik}>
                          {tendik}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.kategoriTugas === 'kepala_sekolah' && (
                  <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[11px] font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
                    <span>Data nama & NIP akan otomatis disinkronkan ke <strong>Profil Sekolah</strong> sebagai penandatangan resmi raport, buku induk, ijazah STTB, dan mutasi.</span>
                  </div>
                )}

                {/* Teks Jabatan Hasil / Kustom */}
                <div className="pt-2 border-t border-blue-200/70 dark:border-blue-800/70">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      Nama Jabatan Tercetak / Ditampilkan
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !formData.isCustomJabatan;
                        setFormData(prev => ({
                          ...prev,
                          isCustomJabatan: nextState,
                          jabatan: !nextState ? computeAutoJabatan(prev.kategoriTugas, prev.tingkatKelas, prev.mataPelajaran, prev.tugasTendik) : prev.jabatan,
                        }));
                      }}
                      className="text-[10px] text-blue-700 dark:text-blue-400 font-bold hover:underline"
                    >
                      {formData.isCustomJabatan ? 'Kembalikan Format Otomatis' : 'Kustomisasi Teks Jabatan'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value, isCustomJabatan: true })}
                    placeholder="Contoh: Wali Kelas 6 / Guru Mapel PJOK"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Status & Akses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hak Akses Sistem
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden font-semibold"
                  >
                    <option value="user">Guru / Wali Kelas</option>
                    <option value="admin">Administrator / Kepsek & TU</option>
                    <option value="umum">Staf Umum / Tamu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status Mengajar
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden font-semibold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif / Cuti</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= FORMAL PRINT DAFTAR PTK WITH KOP SURAT ================= */}
      <div className="hidden print:block max-w-[297mm] mx-auto bg-white text-slate-950 p-[10mm] font-serif text-[11px] leading-relaxed">
        <KopSuratHeader
          schoolProfile={schoolProfile}
          documentTitle="DAFTAR REKAPITULASI PENDIDIK & TENAGA KEPENDIDIKAN (PTK)"
          documentSubtitle={`TAHUN PELAJARAN ${schoolProfile.tahunPelajaranAktif || '2025/2026'}`}
        />

        <div className="my-2 flex justify-between items-center text-[10px] font-sans text-slate-700">
          <div>Total PTK: <strong>{filteredTeachers.length} Orang</strong> | Kategori: <strong>{filterCategory.toUpperCase()}</strong></div>
          <div>Dicetak pada: {formatIndonesianDate(new Date().toISOString())}</div>
        </div>

        <table className="w-full border-collapse border border-slate-950 text-[10px] my-2">
          <thead>
            <tr className="bg-slate-100 text-slate-950 font-bold">
              <th className="border border-slate-950 px-2 py-1 text-center w-8">No</th>
              <th className="border border-slate-950 px-2 py-1 text-left">Nama Lengkap & Gelar</th>
              <th className="border border-slate-950 px-2 py-1 text-center w-28">NIP / NUPTK</th>
              <th className="border border-slate-950 px-2 py-1 text-center w-8">L/P</th>
              <th className="border border-slate-950 px-2 py-1 text-left">Jabatan / Tugas Pokok</th>
              <th className="border border-slate-950 px-2 py-1 text-left">Tugas Mengajar / Rombel</th>
              <th className="border border-slate-950 px-2 py-1 text-center w-20">Status Kepegawaian</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((t, idx) => (
              <tr key={t.id}>
                <td className="border border-slate-950 px-2 py-1 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-950 px-2 py-1 font-bold uppercase">{t.nama}</td>
                <td className="border border-slate-950 px-2 py-1 text-center font-mono">{t.nip || '-'}</td>
                <td className="border border-slate-950 px-2 py-1 text-center font-bold">{t.jenisKelamin || '-'}</td>
                <td className="border border-slate-950 px-2 py-1 font-semibold">{t.jabatan || 'Guru'}</td>
                <td className="border border-slate-950 px-2 py-1">{t.mataPelajaran || t.waliKelas || '-'}</td>
                <td className="border border-slate-950 px-2 py-1 text-center">{t.statusKepegawaian || 'PNS'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tanda Tangan Resmi Kepala Sekolah */}
        <div className="flex justify-between items-end mt-6 font-sans text-[11px] avoid-break">
          <div className="text-center">
            <div>Mengetahui,</div>
            <div>Pengelola Kepegawaian / Tata Usaha</div>
            <div className="h-16" />
            <div className="font-bold underline">Petugas Kepegawaian</div>
            <div>NIP. -</div>
          </div>

          <div className="text-right leading-tight">
            <div>{schoolProfile.desaKelurahan || schoolProfile.desa || 'Sungai Buluh'}, {formatIndonesianDate(new Date().toISOString())}</div>
            <div className="font-bold mt-0.5">Kepala {schoolProfile.namaSekolah}</div>
            <div className="h-16 flex items-center justify-end relative">
              {schoolProfile.stempelUrl ? (
                <img
                  src={schoolProfile.stempelUrl}
                  alt="Stempel Sekolah"
                  className="w-24 h-16 object-contain opacity-85 absolute right-4"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-10 border border-blue-900/30 rounded flex items-center justify-center text-[8px] text-blue-900 font-bold">
                  [ STEMPEL RESMI ]
                </div>
              )}
            </div>
            <div className="font-bold underline relative z-10">{schoolProfile.namaKepalaSekolah}</div>
            <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
