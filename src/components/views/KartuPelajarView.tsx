import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  CreditCard, 
  Printer, 
  ArrowLeft, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  Award, 
  BookOpen, 
  Download,
  Upload,
  Sparkles,
  Camera,
  Check,
  ExternalLink,
  Copy,
  SearchCheck,
  X,
  Eye
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { formatIndonesianDate, cn } from '../../lib/utils';
import { Student } from '../../types';
import { 
  TutWuriHandayaniSDLogo, 
  TutWuriHandayaniKemdikbudLogo, 
  KemenagMadrasahLogo,
  OfficialNationalLogo 
} from '../../utils/logoHelper';
import { EditLogoModal } from '../modals/EditLogoModal';

interface KartuPelajarViewProps {
  selectedStudentId?: string;
  onBack: () => void;
  onSelectStudentDetail?: (studentId: string) => void;
  setActiveTab?: (tab: any) => void;
}

/**
 * Builds the public verification URL for a given student
 */
export const getStudentVerificationUrl = (student: Student): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const verifyKey = student.nisn || student.noInduk || student.id;
  return `${origin}${pathname}?tab=public-verify&verify=${encodeURIComponent(verifyKey)}&id=${encodeURIComponent(student.id)}#verify-${encodeURIComponent(verifyKey)}`;
};

type CardTheme = 'kemdikbud-blue' | 'merah-putih' | 'merdeka-green' | 'royal-navy';
type CardSide = 'front' | 'back' | 'both';

/**
 * Robust Logo Kiri renderer for Kartu Tanda Peserta (matching Kop Surat Header)
 */
const CardLogoKiri: React.FC<{
  logoKiriUrl?: string;
  logoUrl?: string;
  className?: string;
}> = ({ logoKiriUrl, logoUrl, className = "w-full h-full" }) => {
  const [loadError, setLoadError] = useState(false);
  const rawSource = (logoKiriUrl || logoUrl || '').trim();

  // If empty or failed to load, fallback to standard Tut Wuri SD logo
  if (!rawSource || loadError) {
    return <TutWuriHandayaniSDLogo className={className} />;
  }

  // If preset ID
  if (rawSource.startsWith('preset:')) {
    return <OfficialNationalLogo logoIdOrUrl={rawSource} className={className} />;
  }

  return (
    <img
      src={rawSource}
      alt="Logo Kiri (Kop Surat)"
      className={`${className} object-contain`}
      referrerPolicy="no-referrer"
      onError={() => setLoadError(true)}
    />
  );
};

/**
 * Robust Logo Kanan renderer for Kartu Tanda Peserta (matching Kop Surat Header)
 */
const CardLogoKanan: React.FC<{
  logoKananUrl?: string;
  tutWuriLogoUrl?: string;
  className?: string;
}> = ({ logoKananUrl, tutWuriLogoUrl, className = "w-full h-full" }) => {
  const [loadError, setLoadError] = useState(false);
  const rawSource = (logoKananUrl || tutWuriLogoUrl || 'preset:tut-wuri-sd').trim();

  if (loadError) {
    return <TutWuriHandayaniSDLogo className={className} />;
  }

  if (rawSource.startsWith('preset:')) {
    return <OfficialNationalLogo logoIdOrUrl={rawSource} className={className} />;
  }

  return (
    <img
      src={rawSource}
      alt="Logo Kanan (Kop Surat)"
      className={`${className} object-contain`}
      referrerPolicy="no-referrer"
      onError={() => setLoadError(true)}
    />
  );
};

export const KartuPelajarView: React.FC<KartuPelajarViewProps> = ({
  selectedStudentId,
  onBack,
  onSelectStudentDetail,
  setActiveTab,
}) => {
  const { students, schoolProfile, updateStudent, currentRole } = useSchool();
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudentId || (students[0]?.id ?? '')
  );
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [cardTheme, setCardTheme] = useState<CardTheme>('kemdikbud-blue');
  const [cardSide, setCardSide] = useState<CardSide>('front');
  const [isEditLogoModalOpen, setIsEditLogoModalOpen] = useState(false);
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [inspectingQrStudent, setInspectingQrStudent] = useState<Student | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Hidden photo upload ref for current active student
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const studentsToPrint = printMode === 'single'
    ? (student ? [student] : [])
    : students.filter(s => (selectedClass === 'ALL' || s.kelasSekarang === selectedClass) && s.status === 'Aktif');

  // Generate real scannable QR Code for each student linking to their public verification profile
  useEffect(() => {
    let isMounted = true;
    const generateAllQrs = async () => {
      const newMap: Record<string, string> = {};
      // Prioritize students currently visible / to be printed first
      const primaryList = studentsToPrint;
      const secondaryList = students.filter(s => !primaryList.some(p => p.id === s.id));
      const allToProcess = [...primaryList, ...secondaryList];

      for (const st of allToProcess) {
        if (!isMounted) break;
        if (qrCodeMap[st.id] || newMap[st.id]) continue;
        try {
          const verifyUrl = getStudentVerificationUrl(st);
          const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
            width: 320,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          newMap[st.id] = qrDataUrl;
          // Update immediately for visible students
          if (primaryList.some(p => p.id === st.id) && isMounted) {
            setQrCodeMap((prev) => ({ ...prev, [st.id]: qrDataUrl }));
          }
        } catch (err) {
          console.error('Error generating QR code for student:', st.id, err);
        }
      }
      if (isMounted && Object.keys(newMap).length > 0) {
        setQrCodeMap((prev) => ({ ...prev, ...newMap }));
      }
    };

    if (students.length > 0) {
      generateAllQrs();
    }
    return () => {
      isMounted = false;
    };
  }, [studentsToPrint, students]);

  const handleOpenVerification = (st: Student) => {
    if (typeof window !== 'undefined') {
      const verifyKey = st.nisn || st.noInduk || st.id;
      window.location.hash = `#verify-${encodeURIComponent(verifyKey)}`;
      const newUrl = `${window.location.pathname}?tab=public-verify&verify=${encodeURIComponent(verifyKey)}&id=${encodeURIComponent(st.id)}#verify-${encodeURIComponent(verifyKey)}`;
      window.history.pushState({}, '', newUrl);
    }
    if (setActiveTab) {
      setActiveTab('public-verify');
    } else {
      setInspectingQrStudent(st);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQrPng = (st: Student) => {
    const dataUrl = qrCodeMap[st.id];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_VERIFIKASI_${(st.nisn || st.namaLengkap).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, targetStudentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const targetStudent = students.find(s => s.id === targetStudentId);
      if (targetStudent) {
        updateStudent({
          ...targetStudent,
          fotoUrl: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Theme styling definitions
  const themeStyles: Record<CardTheme, {
    headerBg: string;
    headerBorder: string;
    headerText: string;
    subText: string;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
    cardBorder: string;
    footerBg: string;
  }> = {
    'kemdikbud-blue': {
      headerBg: 'bg-linear-to-r from-[#002266] via-[#003399] to-[#0047BA]',
      headerBorder: 'border-b-2 border-amber-400',
      headerText: 'text-white',
      subText: 'text-amber-300',
      badgeBg: 'bg-amber-400 text-slate-950',
      badgeText: 'text-slate-950',
      accentColor: 'text-[#003399]',
      cardBorder: 'border-slate-800',
      footerBg: 'bg-slate-100 border-slate-300',
    },
    'merah-putih': {
      headerBg: 'bg-linear-to-r from-red-700 via-rose-700 to-red-800',
      headerBorder: 'border-b-2 border-white',
      headerText: 'text-white',
      subText: 'text-red-100',
      badgeBg: 'bg-white text-red-700 shadow-xs',
      badgeText: 'text-red-700',
      accentColor: 'text-red-700',
      cardBorder: 'border-red-900',
      footerBg: 'bg-rose-50/80 border-rose-200',
    },
    'merdeka-green': {
      headerBg: 'bg-linear-to-r from-emerald-800 via-teal-700 to-emerald-900',
      headerBorder: 'border-b-2 border-emerald-300',
      headerText: 'text-white',
      subText: 'text-emerald-200',
      badgeBg: 'bg-emerald-300 text-slate-950',
      badgeText: 'text-slate-950',
      accentColor: 'text-emerald-800',
      cardBorder: 'border-teal-900',
      footerBg: 'bg-emerald-50/60 border-emerald-200',
    },
    'royal-navy': {
      headerBg: 'bg-linear-to-r from-slate-950 via-slate-900 to-blue-950',
      headerBorder: 'border-b-2 border-amber-500',
      headerText: 'text-white',
      subText: 'text-amber-400',
      badgeBg: 'bg-amber-500 text-slate-950',
      badgeText: 'text-slate-950',
      accentColor: 'text-slate-900',
      cardBorder: 'border-slate-900',
      footerBg: 'bg-slate-100 border-slate-300',
    },
  };

  const currentTheme = themeStyles[cardTheme];

  // Helper to render National logo (matching Kop Surat Logo Kanan / Tut Wuri)
  const renderTutWuriLogo = (sizeClass = "w-7 h-7") => {
    const logoSource = schoolProfile.logoKananUrl || schoolProfile.tutWuriLogoUrl || 'preset:tut-wuri-sd';
    return <OfficialNationalLogo logoIdOrUrl={logoSource} className={sizeClass} />;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={(e) => student && handlePhotoUpload(e, student.id)}
        accept="image/*"
        className="hidden"
      />

      {/* Control Bar */}
      <div className="no-print p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#003399] dark:text-blue-400" />
                <span>Kartu Tanda Peserta Didik (ID Pelajar Resmi)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Format standar ID-1 (85.6 × 53.98 mm) dilengkapi Lambang Tut Wuri Handayani SD di kanan atas & barcode verifikasi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {student && (
              <button
                onClick={() => setInspectingQrStudent(student)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                title="Lihat & Uji Coba QR Code Verifikasi Profil Publik Siswa"
              >
                <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>QR Verifikasi Siswa</span>
              </button>
            )}

            <button
              onClick={() => setIsEditLogoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              title="Ganti / Edit Logo Sekolah & Lambang Tut Wuri Handayani SD"
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center">
                {renderTutWuriLogo("w-4 h-4")}
              </div>
              <span>Edit Logo / Tut Wuri</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003399] hover:bg-[#002266] text-white text-xs font-extrabold rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>CETAK KARTU ({studentsToPrint.length} SISWA)</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter & Customizer Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          {/* Print Mode & Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>Mode:</span>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-blue-700 dark:text-blue-300"
              >
                <option value="single">1 Siswa Terpilih</option>
                <option value="all">Cetak Batch Seluruh Kelas (A4)</option>
              </select>
            </div>

            {printMode === 'single' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Pilih:</span>
                <select
                  value={activeStudentId}
                  onChange={(e) => setActiveStudentId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold max-w-[220px] truncate"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.noInduk} - {s.namaLengkap} ({s.kelasSekarang})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Filter:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="ALL">Semua Siswa Aktif ({students.filter(s => s.status === 'Aktif').length})</option>
                  <option value="Kelas 1">Kelas 1</option>
                  <option value="Kelas 2">Kelas 2</option>
                  <option value="Kelas 3">Kelas 3</option>
                  <option value="Kelas 4">Kelas 4</option>
                  <option value="Kelas 5">Kelas 5</option>
                  <option value="Kelas 6">Kelas 6</option>
                </select>
              </div>
            )}
          </div>

          {/* Theme Selector & Side View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Picker */}
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Tema Kartu:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCardTheme('kemdikbud-blue')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardTheme === 'kemdikbud-blue' ? "bg-[#003399] text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                  title="Biru Merdeka Kemdikbud"
                >
                  Biru SD
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('merah-putih')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardTheme === 'merah-putih' ? "bg-red-700 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                  title="Merah Putih SD Nasional"
                >
                  Merah Putih
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('merdeka-green')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardTheme === 'merdeka-green' ? "bg-emerald-700 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                  title="Emerald Merdeka Belajar"
                >
                  Emerald
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('royal-navy')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardTheme === 'royal-navy' ? "bg-slate-900 text-amber-300 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                  title="Royal Navy Gold"
                >
                  Royal Navy
                </button>
              </div>
            </div>

            {/* Side Mode: Front / Back / Both */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Sisi:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCardSide('front')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardSide === 'front' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  Depan
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('back')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardSide === 'back' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  Belakang
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide('both')}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold text-[11px] transition-all",
                    cardSide === 'both' ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  Dua Sisi
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Grid / Stage of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 max-w-5xl mx-auto items-start justify-items-center">
        {studentsToPrint.map((s) => (
          <React.Fragment key={s.id}>
            
            {/* FRONT SIDE */}
            {(cardSide === 'front' || cardSide === 'both') && (
              <div
                className={cn(
                  "relative bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between print:shadow-none print:break-inside-avoid transition-all border-2",
                  currentTheme.cardBorder
                )}
                style={{ width: '85.6mm', height: '53.98mm' }}
              >
                {/* Subtle Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                  {renderTutWuriLogo("w-44 h-44")}
                </div>

                {/* Top Ribbon Header */}
                <div className={cn("px-2.5 py-1.5 flex items-center justify-between text-white shadow-xs relative z-10", currentTheme.headerBg, currentTheme.headerBorder)}>
                  {/* Left: School Crest / Logo Kiri (Diselaraskan 100% dengan Logo Kiri Kop Surat) */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-7.5 h-7.5 rounded-md bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs border border-white/60 p-0.5"
                      title="Logo Sebelah Kiri Kop Surat"
                    >
                      <CardLogoKiri
                        logoKiriUrl={schoolProfile.logoKiriUrl}
                        logoUrl={schoolProfile.logoUrl}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-[8px] font-extrabold tracking-wide uppercase leading-tight truncate">
                        KARTU TANDA PESERTA DIDIK
                      </h4>
                      <p className={cn("text-[7px] font-black uppercase leading-tight truncate tracking-tight", currentTheme.subText)}>
                        {schoolProfile.namaSekolah}
                      </p>
                      <p className="text-[6px] text-slate-200 leading-none truncate opacity-90">
                        NPSN: {schoolProfile.npsn} • NSS: {schoolProfile.nss}
                      </p>
                    </div>
                  </div>

                  {/* Right: OFFICIAL TUT WURI / LOGO KANAN KOP SURAT & CLASS BADGE */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <div className="flex flex-col items-end">
                      <span className={cn("text-[7.5px] font-mono font-black px-1.5 py-0.5 rounded shadow-xs leading-tight uppercase", currentTheme.badgeBg)}>
                        {s.kelasSekarang}
                      </span>
                    </div>
                    {/* Logo Kanan Kop Surat in Top Right */}
                    <div 
                      className="w-7.5 h-7.5 rounded-md bg-white flex items-center justify-center p-0.5 shadow-xs border border-amber-300/80 overflow-hidden"
                      title="Logo Sebelah Kanan Kop Surat"
                    >
                      <CardLogoKanan
                        logoKananUrl={schoolProfile.logoKananUrl}
                        tutWuriLogoUrl={schoolProfile.tutWuriLogoUrl}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle Identity Section */}
                <div className="px-2.5 py-1.5 flex gap-2.5 flex-1 items-center relative z-10">
                  {/* Student Photo */}
                  <div className="relative group shrink-0">
                    <div className="w-[18mm] h-[24mm] border-2 border-slate-700 rounded-lg bg-linear-to-b from-blue-100 to-blue-200 dark:from-slate-200 dark:to-slate-300 flex items-center justify-center overflow-hidden shadow-xs relative">
                      {s.fotoUrl ? (
                        <img src={s.fotoUrl} alt={s.namaLengkap} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600">
                          <span className="text-base font-black">{s.namaLengkap.charAt(0)}</span>
                          <span className="text-[6px] font-bold uppercase">{s.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                        </div>
                      )}

                      {/* Gold Corner Badge */}
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 flex items-center justify-center rounded-bl-sm">
                        <span className="text-[5px] font-black text-slate-950">✓</span>
                      </div>
                    </div>

                    {/* Quick photo change trigger (no print) */}
                    {currentRole !== 'umum' && (
                      <button
                        onClick={() => {
                          setActiveStudentId(s.id);
                          photoInputRef.current?.click();
                        }}
                        className="no-print absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 rounded-lg flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                        title="Ganti Pas Foto Siswa"
                      >
                        <Camera className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[6px] font-bold">Ubah</span>
                      </button>
                    )}
                  </div>

                  {/* Student Data Fields */}
                  <div className="flex-1 space-y-0.5 text-[8px] leading-tight min-w-0">
                    <div className="font-extrabold text-[9.5px] text-slate-950 truncate tracking-tight pb-0.5 border-b border-slate-200">
                      {s.namaLengkap}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 pt-0.5">
                      <span className="col-span-2 text-slate-500 font-medium">NIS / NISN</span>
                      <span className="col-span-5 font-mono font-bold text-slate-900 truncate">
                        {s.noInduk} / {s.nisn}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      <span className="col-span-2 text-slate-500 font-medium">TTL</span>
                      <span className="col-span-5 truncate text-slate-800">
                        {s.tempatLahir}, {formatIndonesianDate(s.tanggalLahir)}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      <span className="col-span-2 text-slate-500 font-medium">JK / Goldar</span>
                      <span className="col-span-5 text-slate-800">
                        {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Gol. {s.kesehatan?.golonganDarah || '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      <span className="col-span-2 text-slate-500 font-medium">Alamat</span>
                      <span className="col-span-5 truncate text-slate-800">
                        {s.kelurahanDesa}, {s.kecamatan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className={cn("px-2.5 py-1 flex items-center justify-between text-[6.5px] border-t relative z-10", currentTheme.footerBg)}>
                  {/* Left: Real Generated QR Code for Public Verification */}
                  <div className="flex items-center gap-1.5">
                    <div 
                      onClick={() => setInspectingQrStudent(s)}
                      className="w-6 h-6 bg-white p-0.5 border border-slate-300 rounded shrink-0 flex items-center justify-center shadow-2xs hover:border-[#003399] hover:scale-105 transition-all cursor-pointer"
                      title="Klik untuk melihat QR Code & tautan verifikasi profil publik siswa"
                    >
                      {qrCodeMap[s.id] ? (
                        <img 
                          src={qrCodeMap[s.id]} 
                          alt={`QR Verifikasi ${s.namaLengkap}`} 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <QrCode className="w-full h-full text-slate-900 animate-pulse" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-900 leading-none">NISN:{s.nisn}</span>
                      <span className="text-[5.5px] text-emerald-700 font-extrabold leading-tight flex items-center gap-0.5">
                        <ShieldCheck className="w-2 h-2 text-emerald-600 inline shrink-0" />
                        Verifikasi Publik
                      </span>
                    </div>
                  </div>

                  {/* Right: Signature and Stempel */}
                  <div className="text-right leading-tight flex items-center gap-1.5">
                    {schoolProfile.stempelUrl && (
                      <div className="w-5 h-5 opacity-80 shrink-0">
                        <img src={schoolProfile.stempelUrl} alt="Cap" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="text-[5.5px] text-slate-500 uppercase">Kepala Sekolah</div>
                      <div className="font-bold text-slate-950 underline leading-none truncate max-w-[110px]">
                        {schoolProfile.namaKepalaSekolah}
                      </div>
                      <div className="text-[5.5px] font-mono text-slate-600 leading-none">
                        NIP: {schoolProfile.nipKepalaSekolah}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BACK SIDE */}
            {(cardSide === 'back' || cardSide === 'both') && (
              <div
                className={cn(
                  "relative bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between print:shadow-none print:break-inside-avoid transition-all border-2 p-2.5",
                  currentTheme.cardBorder
                )}
                style={{ width: '85.6mm', height: '53.98mm' }}
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  {renderTutWuriLogo("w-44 h-44")}
                </div>

                {/* Back Header */}
                <div className="text-center border-b border-slate-300 pb-1">
                  <div className="text-[8px] font-extrabold uppercase text-slate-900 tracking-wider">
                    KETENTUAN KARTU TANDA PESERTA DIDIK
                  </div>
                  <div className="text-[6.5px] font-bold text-blue-900 uppercase">
                    {schoolProfile.namaSekolah}
                  </div>
                </div>

                {/* Terms / Rules of Conduct */}
                <div className="space-y-1 text-[6.5px] leading-tight text-slate-700 my-1">
                  <div className="flex items-start gap-1">
                    <span className="font-bold">1.</span>
                    <span>Kartu ini merupakan tanda bukti sah sebagai Peserta Didik di {schoolProfile.namaSekolah}.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold">2.</span>
                    <span>Wajib dibawa setiap hari saat mengikuti kegiatan belajar mengajar dan ekstrakurikuler.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold">3.</span>
                    <span>Dapat digunakan untuk layanan peminjaman buku Perpustakaan Sekolah.</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold">4.</span>
                    <span>Apabila kartu ini hilang atau rusak, segera melapor kepada Bagian Tata Usaha (TU).</span>
                  </div>
                </div>

                {/* School Address & Barcode & QR Verification info */}
                <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[6px] text-slate-600 gap-1.5">
                  <div className="leading-tight max-w-[130px]">
                    <div className="font-bold text-slate-900 truncate">{schoolProfile.alamatJalan || schoolProfile.alamatSekolah}</div>
                    <div>Desa {schoolProfile.desaKelurahan || schoolProfile.desa}, Kec. {schoolProfile.kecamatan}</div>
                    <div>Telp: {schoolProfile.telepon} • Web: {schoolProfile.website}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Simulated Code128 Barcode */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-0.5 h-2.5 bg-slate-900 px-1 py-0.5 rounded-xs">
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1.5 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                        <div className="w-1.5 h-full bg-white"></div>
                        <div className="w-0.5 h-full bg-white"></div>
                      </div>
                      <span className="font-mono text-[5px] font-bold text-slate-800 mt-0.5">
                        *{s.noInduk}*
                      </span>
                    </div>

                    {/* Generated QR Code for Public Verification */}
                    <div 
                      onClick={() => setInspectingQrStudent(s)}
                      className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded p-0.5 cursor-pointer hover:border-[#003399] transition-colors"
                      title="Pindai QR Code untuk Cek Keabsahan di Profil Verifikasi Publik"
                    >
                      <div className="w-7 h-7 bg-white rounded-xs p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                        {qrCodeMap[s.id] ? (
                          <img 
                            src={qrCodeMap[s.id]} 
                            alt={`QR Verifikasi ${s.namaLengkap}`} 
                            className="w-full h-full object-contain" 
                          />
                        ) : (
                          <QrCode className="w-full h-full text-slate-900 animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-col leading-none text-left pr-0.5">
                        <span className="text-[5px] font-black text-slate-900 uppercase tracking-tighter">Scan QR</span>
                        <span className="text-[4.5px] text-emerald-700 font-bold">Verifikasi</span>
                        <span className="text-[4.5px] font-mono text-slate-500">{s.nisn}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </React.Fragment>
        ))}
      </div>

      {/* QR Code Verification Modal */}
      {inspectingQrStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#003399] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">QR Code Verifikasi Kartu Pelajar</h3>
                  <p className="text-[11px] text-blue-100">Tautan Resmi Profil Verifikasi Publik</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingQrStudent(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-center">
              {/* Student Identity */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left">
                <div className="w-12 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#003399] dark:text-blue-300 font-extrabold text-lg flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 overflow-hidden shadow-2xs">
                  {inspectingQrStudent.fotoUrl ? (
                    <img src={inspectingQrStudent.fotoUrl} alt={inspectingQrStudent.namaLengkap} className="w-full h-full object-cover" />
                  ) : (
                    inspectingQrStudent.namaLengkap.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {inspectingQrStudent.namaLengkap}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    NISN: <strong className="text-slate-800 dark:text-slate-200">{inspectingQrStudent.nisn || '-'}</strong> • NIS: {inspectingQrStudent.noInduk || '-'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>Kelas {inspectingQrStudent.kelasSekarang}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Status {inspectingQrStudent.status}</span>
                  </div>
                </div>
              </div>

              {/* Big High-Res QR Code Card */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 inline-block shadow-sm">
                {qrCodeMap[inspectingQrStudent.id] ? (
                  <img
                    src={qrCodeMap[inspectingQrStudent.id]}
                    alt={`QR Code ${inspectingQrStudent.namaLengkap}`}
                    className="w-48 h-48 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <QrCode className="w-16 h-16 animate-pulse" />
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pindai menggunakan kamera ponsel / scanner untuk verifikasi keaslian</span>
                </div>
              </div>

              {/* URL Box */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Tautan Verifikasi Profil Publik:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={getStudentVerificationUrl(inspectingQrStudent)}
                    className="flex-1 px-3 py-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden select-all"
                  />
                  <button
                    onClick={() => handleCopyLink(getStudentVerificationUrl(inspectingQrStudent))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Salin Tautan"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleDownloadQrPng(inspectingQrStudent)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" />
                  <span>Unduh QR (.PNG)</span>
                </button>

                <button
                  onClick={() => {
                    const st = inspectingQrStudent;
                    setInspectingQrStudent(null);
                    handleOpenVerification(st);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Profil Verifikasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Logo Modal */}
      <EditLogoModal
        isOpen={isEditLogoModalOpen}
        onClose={() => setIsEditLogoModalOpen(false)}
      />
    </div>
  );
};
