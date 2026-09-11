import React, { useState } from 'react';
import { 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  Building2, 
  Sparkles,
  School,
  Sun,
  Moon
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole, AdminUser } from '../../types';
import { cn } from '../../lib/utils';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { 
    schoolProfile, 
    adminUsers, 
    login, 
    securitySettings,
    darkMode,
    toggleDarkMode
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'quick' | 'manual'>('quick');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [selectedUserId, setSelectedUserId] = useState<string>(adminUsers[0]?.id || '');
  
  // Manual credentials form state
  const [emailOrNip, setEmailOrNip] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  // Quick login PIN state
  const [quickPin, setQuickPin] = useState<string>('123456');
  const [showQuickPin, setShowQuickPin] = useState<boolean>(false);

  // Status & error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const roleOptions: {
    role: UserRole;
    title: string;
    description: string;
    badge: string;
    badgeColor: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    targetUser?: AdminUser;
  }[] = [
    {
      role: 'admin',
      title: 'Administrator / Kepala Sekolah & TU',
      description: 'Akses penuh kelola data siswa, raport, mutasi, profil sekolah & cetak dokumen',
      badge: 'Akses Penuh',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: ShieldCheck,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      iconColor: 'text-amber-600 dark:text-amber-400',
      targetUser: adminUsers.find(u => u.role === 'admin'),
    },
    {
      role: 'user',
      title: 'Guru / Wali Kelas',
      description: 'Input & edit nilai raport semester, mutasi siswa, dan pencetakan kartu pelajar',
      badge: 'Kelola Kelas',
      badgeColor: 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: GraduationCap,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      targetUser: adminUsers.find(u => u.role === 'user'),
    },
    {
      role: 'umum',
      title: 'Tamu / Wali Murid / Umum',
      description: 'Penelusuran register siswa, cek status ijazah, dan informasi umum sekolah',
      badge: 'Mode Peninjau',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      icon: Users,
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  ];

  const handleQuickLogin = (role: UserRole) => {
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const targetUser = adminUsers.find(u => u.role === role);
      const res = login(targetUser || role, role === 'admin' ? quickPin : undefined);

      if (res.success) {
        setSuccessMessage(res.message || 'Login berhasil!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        setErrorMessage(res.message || 'Gagal masuk ke sistem');
        setIsLoading(false);
      }
    }, 250);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by email or NIP or ID
      let matchedUser = adminUsers.find(
        u => u.email.toLowerCase() === emailOrNip.trim().toLowerCase() ||
             (u.nip && u.nip.replace(/\s+/g, '') === emailOrNip.trim().replace(/\s+/g, '')) ||
             u.id === selectedUserId
      );

      if (!matchedUser && selectedUserId) {
        matchedUser = adminUsers.find(u => u.id === selectedUserId);
      }

      if (!matchedUser) {
        setErrorMessage('Akun petugas tidak ditemukan. Silakan pilih dari daftar atau periksa Email/NIP.');
        setIsLoading(false);
        return;
      }

      const res = login(matchedUser, pin);
      if (res.success) {
        setSuccessMessage(res.message || 'Login berhasil!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        setErrorMessage(res.message || 'PIN/Kata Sandi tidak sesuai');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Mode Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-600" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* Decorative ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400/10 dark:bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003399] text-white shadow-md mb-3 ring-4 ring-blue-50 dark:ring-blue-950/40">
            <BookOpen className="w-7 h-7 text-amber-400" />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Sistem Buku Induk Siswa
          </h1>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <School className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" />
            <span>{schoolProfile.namaSekolah || 'SD NEGERI 006 SUNGAI BULUH'}</span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Portal Masuk & Manajemen Hak Akses Register Peserta Didik
          </p>
        </div>

        {/* Main Clean Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Segmented Mode Switcher */}
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('quick');
                setErrorMessage(null);
              }}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                activeTab === 'quick'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Peran Cepat</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('manual');
                setErrorMessage(null);
              }}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
                activeTab === 'manual'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Lock className="w-3.5 h-3.5 text-blue-500" />
              <span>Akun Petugas (NIP/PIN)</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div className="font-bold">{successMessage}</div>
              </div>
            )}

            {/* TAB 1: QUICK ROLE SELECTION (MINIMALIST & INTUITIVE FOR NEW USERS) */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pilih salah satu peran di bawah ini untuk langsung masuk:
                </div>

                <div className="space-y-2.5">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.role;

                    return (
                      <div
                        key={opt.role}
                        onClick={() => setSelectedRole(opt.role)}
                        className={cn(
                          "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 group",
                          isSelected
                            ? "bg-slate-50 dark:bg-slate-800/80 border-[#003399] dark:border-blue-500 ring-2 ring-blue-500/10"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                          opt.iconBg
                        )}>
                          <Icon className={cn("w-5 h-5", opt.iconColor)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {opt.title}
                            </span>
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0", opt.badgeColor)}>
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                            {opt.description}
                          </p>
                          {opt.targetUser && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Nama: {opt.targetUser.nama}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-[#003399] bg-[#003399] text-white dark:border-blue-500 dark:bg-blue-500"
                              : "border-slate-300 dark:border-slate-600 group-hover:border-slate-400"
                          )}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional PIN prompt if Admin role is selected */}
                {selectedRole === 'admin' && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>PIN Keamanan Admin:</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Default Demo: <strong className="text-slate-700 dark:text-slate-200">123456</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showQuickPin ? "text" : "password"}
                        value={quickPin}
                        onChange={(e) => setQuickPin(e.target.value)}
                        placeholder="123456"
                        maxLength={10}
                        className="w-full px-3 py-2 text-xs font-mono tracking-widest rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowQuickPin(!showQuickPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showQuickPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Direct Action Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(selectedRole)}
                  className="w-full mt-3 py-2.5 px-4 bg-[#003399] hover:bg-[#002266] active:bg-[#001a4d] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Masuk sebagai {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'user' ? 'Guru Kelas' : 'Tamu / Umum'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: MANUAL LOGIN WITH REGISTERED CREDENTIALS */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualLogin} className="space-y-4">
                {/* Account Selection from Staff list */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Petugas Sekolah:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      const user = adminUsers.find(u => u.id === e.target.value);
                      if (user) {
                        setEmailOrNip(user.email);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  >
                    {adminUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama} — [{u.jabatan}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email or NIP Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Resmi atau NIP:
                  </label>
                  <input
                    type="text"
                    value={emailOrNip || adminUsers.find(u => u.id === selectedUserId)?.email || ''}
                    onChange={(e) => setEmailOrNip(e.target.value)}
                    placeholder="nama.guru@sdn006.sch.id atau 1985..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  />
                </div>

                {/* PIN / Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      PIN / Kata Sandi:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Demo PIN: <strong className="text-slate-700 dark:text-slate-200">123456</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Masukkan 6 digit PIN (123456)"
                      className="w-full px-3 py-2 text-xs font-mono tracking-wider rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Ingat sesi di perangkat ini
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setPin('123456');
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Isi PIN Otomatis
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#003399] hover:bg-[#002266] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span>Memproses Masuk...</span>
                  ) : (
                    <>
                      <span>Masuk ke Akun Petugas</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Clean Help & New User Notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Panduan Pengguna Baru:</strong> Gunakan tab <em>Pilih Peran Cepat</em> untuk langsung mencoba seluruh modul aplikasi tanpa kata sandi yang rumit.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            {[
              schoolProfile.alamatJalan || schoolProfile.alamatSekolah,
              (schoolProfile.desaKelurahan || schoolProfile.desa) ? `Desa ${schoolProfile.desaKelurahan || schoolProfile.desa}` : '',
              schoolProfile.kecamatan ? `Kec. ${schoolProfile.kecamatan}` : '',
              schoolProfile.kabupatenKota,
              schoolProfile.provinsi ? `Prov. ${schoolProfile.provinsi}` : '',
              schoolProfile.kodePos ? `Kode Pos ${schoolProfile.kodePos}` : ''
            ].filter(Boolean).join(', ')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span>NPSN: <strong className="text-slate-600 dark:text-slate-300 font-bold">{schoolProfile.npsn || '10403789'}</strong></span>
            {schoolProfile.nss && (
              <>
                <span>•</span>
                <span>NSS: <strong className="text-slate-600 dark:text-slate-300 font-bold">{schoolProfile.nss}</strong></span>
              </>
            )}
            {schoolProfile.telepon && (
              <>
                <span>•</span>
                <span>Telp: <strong className="text-slate-600 dark:text-slate-300 font-bold">{schoolProfile.telepon}</strong></span>
              </>
            )}
            {schoolProfile.email && (
              <>
                <span>•</span>
                <span>Email: <strong className="text-slate-600 dark:text-slate-300 font-bold">{schoolProfile.email}</strong></span>
              </>
            )}
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Sistem Aktif & Terverifikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
