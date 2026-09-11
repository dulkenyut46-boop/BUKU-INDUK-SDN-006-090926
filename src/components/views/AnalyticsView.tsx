import React from 'react';
import { 
  Eye, 
  TrendingUp, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Clock, 
  Calendar, 
  ShieldCheck,
  Download,
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSchool } from '../../context/SchoolContext';

interface AnalyticsViewProps {
  onBack?: () => void;
  setActiveTab?: (tab: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onBack,
  setActiveTab,
}) => {
  const { visitorStats, activityLogs, students } = useSchool();

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveTab) {
      setActiveTab('dashboard');
    }
  };

  // 7-day traffic trend data
  const trafficData = [
    { tanggal: '13 Agu', pengunjung: 38, tampilanHalaman: 112 },
    { tanggal: '14 Agu', pengunjung: 45, tampilanHalaman: 140 },
    { tanggal: '15 Agu', pengunjung: 52, tampilanHalaman: 168 },
    { tanggal: '16 Agu', pengunjung: 40, tampilanHalaman: 125 },
    { tanggal: '17 Agu', pengunjung: 60, tampilanHalaman: 210 },
    { tanggal: '18 Agu', pengunjung: 55, tampilanHalaman: 180 },
    { tanggal: '19 Agu', pengunjung: visitorStats.today, tampilanHalaman: visitorStats.today * 3 },
  ];

  // Hourly traffic simulation
  const hourlyData = [
    { jam: '07:00', hits: 8 },
    { jam: '08:00', hits: 24 },
    { jam: '09:00', hits: 32 },
    { jam: '10:00', hits: 28 },
    { jam: '11:00', hits: 20 },
    { jam: '12:00', hits: 14 },
    { jam: '13:00', hits: 22 },
    { jam: '14:00', hits: 18 },
    { jam: '15:00', hits: 10 },
  ];

  // Device split
  const deviceData = [
    { name: 'Desktop / Komputer Sekolah', value: 68, color: '#003399' },
    { name: 'Mobile / Smartphone Guru', value: 28, color: '#ea580c' },
    { name: 'Tablet / Lainnya', value: 4, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4 text-[#003399] dark:text-blue-400" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Statistik & Jumlah Pengunjung Sistem
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-extrabold text-xs">
                Live Metric
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Laporan matriks kunjungan, aktivitas akses database, dan analitik performa Buku Induk Sekolah
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hari Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengunjung Hari Ini</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {visitorStats.today}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% dibandingkan kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Pengunjung */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kunjungan Kumulatif</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
              {visitorStats.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tercatat sejak sistem diimplementasikan
            </div>
          </div>
        </div>

        {/* Card 3: Rata-rata Harian */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Kunjungan / Hari</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              47
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Jam tersibuk: 08:30 - 11:00 WIB
            </div>
          </div>
        </div>

        {/* Card 4: Audit Log entries */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi Data</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {activityLogs.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Aktivitas CRUD terarsip aman
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Tren Kunjungan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statistik tayangan halaman dan unique visitors
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Live Realtime
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003399" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#003399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="tampilanHalaman" stroke="#003399" fillOpacity={1} fill="url(#colorPageviews)" name="Tampilan Halaman" />
                <Area type="monotone" dataKey="pengunjung" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVisitor)" strokeWidth={2} name="Pengunjung" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device split */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Perangkat Pengakses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi browser dan device operator
            </p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {deviceData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
