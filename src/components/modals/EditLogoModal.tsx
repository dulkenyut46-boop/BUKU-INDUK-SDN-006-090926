import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  School, 
  ShieldCheck, 
  CheckCircle2, 
  Eye,
  Trash2,
  Sliders,
  Award,
  Plus,
  Pencil,
  Palette,
  Layers,
  HelpCircle,
  FileImage,
  Globe
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { 
  TutWuriHandayaniSDLogo, 
  TutWuriHandayaniSMPLogo,
  TutWuriHandayaniSMALogo,
  TutWuriHandayaniKemdikbudLogo, 
  KemenagMadrasahLogo,
  GarudaPancasilaLogo,
  CustomVectorEmblem,
  OfficialNationalLogo,
  NationalLogoItem,
  DEFAULT_NATIONAL_LOGOS,
  getSavedNationalLogos,
  saveNationalLogos
} from '../../utils/logoHelper';
import { cn } from '../../lib/utils';

interface EditLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tutwuri' | 'custom' | 'stempel';
}

export const EditLogoModal: React.FC<EditLogoModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'tutwuri'
}) => {
  const { schoolProfile, updateSchoolProfile, logActivity } = useSchool();

  const [activeTab, setActiveTab] = useState<'tutwuri' | 'custom' | 'stempel'>(initialTab);
  
  // National Logos State
  const [nationalLogos, setNationalLogos] = useState<NationalLogoItem[]>(() => getSavedNationalLogos());
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    schoolProfile.tutWuriLogoUrl || 'preset:tut-wuri-sd'
  );

  // Custom School Logo and Stamp
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(schoolProfile.logoUrl || '');
  const [stempelUrl, setStempelUrl] = useState<string>(schoolProfile.stempelUrl || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sub-modal state for Add / Edit National Logo
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLogoItem, setEditingLogoItem] = useState<NationalLogoItem | null>(null);
  
  // Form fields for Add / Edit National Logo
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<NationalLogoItem['category']>('sd');
  const [formBadgeLabel, setFormBadgeLabel] = useState('SD');
  const [formBadgeColor, setFormBadgeColor] = useState('bg-red-600 text-white');
  const [formDescription, setFormDescription] = useState('');
  const [formSourceType, setFormSourceType] = useState<'upload' | 'url' | 'vector'>('upload');
  const [formImageUrl, setFormImageUrl] = useState('');
  
  // Vector customization fields
  const [vectorRibbonText, setVectorRibbonText] = useState('SD');
  const [vectorRibbonColor, setVectorRibbonColor] = useState('#DC2626');
  const [vectorShieldColor, setVectorShieldColor] = useState('#0047BA');
  const [vectorOuterColor, setVectorOuterColor] = useState('#003399');
  const [vectorMottoText, setVectorMottoText] = useState('TUT WURI HANDAYANI');

  const fileLogoRef = useRef<HTMLInputElement>(null);
  const fileStempelRef = useRef<HTMLInputElement>(null);
  const fileNationalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const loadedLogos = getSavedNationalLogos();
      setNationalLogos(loadedLogos);
      setSelectedPresetId(schoolProfile.tutWuriLogoUrl || 'preset:tut-wuri-sd');
      setCustomLogoUrl(schoolProfile.logoUrl || '');
      setStempelUrl(schoolProfile.stempelUrl || '');
    }
  }, [isOpen, initialTab, schoolProfile]);

  if (!isOpen) return null;

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'stempel' | 'national') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran berkas logo maksimal 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (target === 'logo') {
        setCustomLogoUrl(result);
      } else if (target === 'stempel') {
        setStempelUrl(result);
      } else if (target === 'national') {
        setFormImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Sub-modal for Add
  const handleOpenAddNational = () => {
    setEditingLogoItem(null);
    setFormName('');
    setFormCategory('sd');
    setFormBadgeLabel('SD');
    setFormBadgeColor('bg-red-600 text-white');
    setFormDescription('Lambang resmi untuk satuan pendidikan');
    setFormSourceType('upload');
    setFormImageUrl('');
    setVectorRibbonText('SD');
    setVectorRibbonColor('#DC2626');
    setVectorShieldColor('#0047BA');
    setVectorOuterColor('#003399');
    setVectorMottoText('TUT WURI HANDAYANI');
    setIsFormModalOpen(true);
  };

  // Open Sub-modal for Edit
  const handleOpenEditNational = (logo: NationalLogoItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingLogoItem(logo);
    setFormName(logo.name);
    setFormCategory(logo.category);
    setFormBadgeLabel(logo.badgeLabel);
    setFormBadgeColor(logo.badgeColor || 'bg-blue-600 text-white');
    setFormDescription(logo.description);
    
    if (logo.imageUrl) {
      setFormSourceType(logo.imageUrl.startsWith('data:') ? 'upload' : 'url');
      setFormImageUrl(logo.imageUrl);
    } else if (logo.vectorStyle) {
      setFormSourceType('vector');
      setVectorRibbonText(logo.vectorStyle.ribbonText || logo.badgeLabel);
      setVectorRibbonColor(logo.vectorStyle.ribbonColor || '#DC2626');
      setVectorShieldColor(logo.vectorStyle.shieldColor || '#0047BA');
      setVectorOuterColor(logo.vectorStyle.outerColor || '#003399');
      setVectorMottoText(logo.vectorStyle.mottoText || 'TUT WURI HANDAYANI');
    } else {
      setFormSourceType('vector');
      setVectorRibbonText(logo.badgeLabel);
      setVectorRibbonColor('#DC2626');
      setVectorShieldColor('#0047BA');
      setVectorOuterColor('#003399');
      setVectorMottoText('TUT WURI HANDAYANI');
    }
    setIsFormModalOpen(true);
  };

  // Save National Logo from Sub-modal
  const handleSaveNationalLogo = () => {
    if (!formName.trim()) {
      alert('Nama lambang tidak boleh kosong');
      return;
    }

    let updatedList = [...nationalLogos];
    const newId = editingLogoItem ? editingLogoItem.id : `custom:nat-${Date.now()}`;

    const logoToSave: NationalLogoItem = {
      id: newId,
      name: formName.trim(),
      category: formCategory,
      badgeLabel: formBadgeLabel.trim() || 'RESMI',
      badgeColor: formBadgeColor,
      description: formDescription.trim() || 'Lambang resmi satuan pendidikan',
      isBuiltin: editingLogoItem ? editingLogoItem.isBuiltin : false,
      imageUrl: formSourceType !== 'vector' && formImageUrl ? formImageUrl : undefined,
      vectorStyle: formSourceType === 'vector' ? {
        ribbonText: vectorRibbonText.trim() || formBadgeLabel.trim(),
        ribbonColor: vectorRibbonColor,
        shieldColor: vectorShieldColor,
        outerColor: vectorOuterColor,
        mottoText: vectorMottoText.trim(),
      } : undefined,
    };

    if (editingLogoItem) {
      updatedList = updatedList.map(item => item.id === editingLogoItem.id ? logoToSave : item);
      logActivity('PENGATURAN', `Mengedit lambang resmi: ${formName}`);
    } else {
      updatedList.push(logoToSave);
      logActivity('PENGATURAN', `Menambahkan lambang resmi baru: ${formName}`);
    }

    setNationalLogos(updatedList);
    saveNationalLogos(updatedList);
    setSelectedPresetId(newId);
    setIsFormModalOpen(false);
  };

  // Delete Custom National Logo
  const handleDeleteNationalLogo = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Hapus lambang "${name}" dari daftar?`)) return;

    const filtered = nationalLogos.filter(item => item.id !== id);
    setNationalLogos(filtered);
    saveNationalLogos(filtered);

    if (selectedPresetId === id) {
      setSelectedPresetId('preset:tut-wuri-sd');
    }
    logActivity('PENGATURAN', `Menghapus lambang resmi: ${name}`);
  };

  // Reset to default presets
  const handleResetNationalToDefaults = () => {
    if (!confirm('Kembalikan semua pilihan lambang nasional ke standar default resmi?')) return;
    setNationalLogos(DEFAULT_NATIONAL_LOGOS);
    saveNationalLogos(DEFAULT_NATIONAL_LOGOS);
    setSelectedPresetId('preset:tut-wuri-sd');
    logActivity('PENGATURAN', 'Mereset daftar lambang nasional ke standar default');
  };

  // Main Save
  const handleSave = () => {
    updateSchoolProfile({
      ...schoolProfile,
      logoUrl: customLogoUrl,
      tutWuriLogoUrl: selectedPresetId,
      stempelUrl: stempelUrl,
    });

    const activeLogoName = nationalLogos.find(l => l.id === selectedPresetId)?.name || 'Tut Wuri Handayani SD';
    logActivity(
      'PENGATURAN',
      `Menyimpan lambang resmi "${activeLogoName}" dan pengaturan logo untuk ${schoolProfile.namaSekolah}`
    );

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  // Filtered logos based on selected category filter
  const filteredLogos = nationalLogos.filter(logo => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'custom') return !logo.isBuiltin;
    if (categoryFilter === 'sd_mi') return logo.category === 'sd' || logo.category === 'kemenag';
    if (categoryFilter === 'smp_mts') return logo.category === 'smp';
    if (categoryFilter === 'sma_smk') return logo.category === 'sma' || logo.category === 'smk';
    return logo.category === categoryFilter;
  });

  const selectedLogoItem = nationalLogos.find(l => l.id === selectedPresetId) || DEFAULT_NATIONAL_LOGOS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#003399] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 p-1">
              <OfficialNationalLogo logoIdOrUrl={selectedPresetId} customLogos={nationalLogos} className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-wide text-white">
                Kelola Logo & Lambang Resmi Sekolah
              </h3>
              <p className="text-xs text-blue-100">
                Pilih, tambah, atau edit lambang Tut Wuri Handayani & logo satuan pendidikan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tutwuri')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'tutwuri'
                ? "bg-white dark:bg-slate-900 border-[#003399] text-[#003399] dark:text-blue-400 shadow-xs"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Pilih Lambang Nasional Resmi</span>
            <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] rounded-full font-extrabold">
              {nationalLogos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'custom'
                ? "bg-white dark:bg-slate-900 border-[#003399] text-[#003399] dark:text-blue-400 shadow-xs"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <School className="w-4 h-4 text-blue-500" />
            <span>Logo Khusus Sekolah (Kiri Kop)</span>
          </button>

          <button
            onClick={() => setActiveTab('stempel')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer",
              activeTab === 'stempel'
                ? "bg-white dark:bg-slate-900 border-[#003399] text-[#003399] dark:text-blue-400 shadow-xs"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Stempel / Cap Resmi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Lambang Nasional Resmi Presets & Custom Management */}
          {activeTab === 'tutwuri' && (
            <div className="space-y-4">
              
              {/* Header Title & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Pilih Lambang Nasional Resmi (Ditampilkan di Kanan Atas & Dokumen)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    Lambang ini tampil di pojok kanan atas portal, Kartu Pelajar, dan Kop Lembar Buku Induk.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenAddNational}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer hover:scale-102"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Lambang Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetNationalToDefaults}
                    title="Kembalikan preset ke default"
                    className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    "px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap",
                    categoryFilter === 'all'
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  Semua ({nationalLogos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('sd_mi')}
                  className={cn(
                    "px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap",
                    categoryFilter === 'sd_mi'
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  SD & MI
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('smp_mts')}
                  className={cn(
                    "px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap",
                    categoryFilter === 'smp_mts'
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  SMP & MTs
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('sma_smk')}
                  className={cn(
                    "px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap",
                    categoryFilter === 'sma_smk'
                      ? "bg-slate-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  SMA & SMK
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('custom')}
                  className={cn(
                    "px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1",
                    categoryFilter === 'custom'
                      ? "bg-amber-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  Kustom Saya ({nationalLogos.filter(l => !l.isBuiltin).length})
                </button>
              </div>

              {/* Grid of National Logos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredLogos.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={cn(
                        "p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative group hover:shadow-md",
                        isSelected
                          ? "border-[#003399] dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60"
                      )}
                    >
                      {/* Top Bar inside card */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={cn(
                          "px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider",
                          preset.badgeColor || "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                        )}>
                          {preset.badgeLabel}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditNational(preset, e)}
                            className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                            title={`Edit informasi lambang ${preset.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button for custom items */}
                          {!preset.isBuiltin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNationalLogo(preset.id, preset.name, e)}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/60 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus lambang ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#003399] dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Logo Visual Presentation */}
                      <div className="flex flex-col items-center text-center my-1">
                        <div className="w-16 h-16 flex items-center justify-center p-1 bg-white dark:bg-slate-900 rounded-full shadow-xs border border-slate-100 dark:border-slate-800 mb-2 group-hover:scale-105 transition-transform">
                          <OfficialNationalLogo 
                            logoIdOrUrl={preset.id} 
                            customLogos={nationalLogos} 
                            className="w-14 h-14" 
                          />
                        </div>

                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                          {preset.name}
                        </span>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                          {preset.description}
                        </span>
                      </div>

                      {/* Bottom Selection Indicator / Action */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className={cn(
                          "font-bold",
                          isSelected ? "text-blue-700 dark:text-blue-400 flex items-center gap-1" : "text-slate-400"
                        )}>
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Sedang Aktif</span>
                            </>
                          ) : (
                            'Klik untuk Terapkan'
                          )}
                        </span>

                        <span className="text-[9px] text-slate-400 font-mono">
                          {preset.isBuiltin ? 'Preset Resmi' : 'Kustom'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Card in Grid */}
                <div
                  onClick={handleOpenAddNational}
                  className="p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[160px]"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Tambah Lambang Baru
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Upload PNG/SVG atau buat vektor kustom
                  </span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                    <OfficialNationalLogo 
                      logoIdOrUrl={selectedPresetId} 
                      customLogos={nationalLogos} 
                      className="w-11 h-11" 
                    />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span>Pratinjau Lambang Terpilih</span>
                      <span className="px-2 py-0.5 text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded-full">
                        Siap Digunakan
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-bold mt-0.5">
                      {selectedLogoItem.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Tampil di Kop Dokumen (Kanan) & Menu Kanan Atas Aplikasi
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditNational(selectedLogoItem)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Lambang Ini</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Custom School Logo */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Logo Satuan Pendidikan (Kiri Kop Dokumen & Branding Sekolah)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah berkas gambar logo khusus sekolah Anda atau cantumkan tautan URL gambar.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileLogoRef}
                onChange={(e) => handleFileUpload(e, 'logo')}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload box */}
                <div 
                  onClick={() => fileLogoRef.current?.click()}
                  className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Pilih File Gambar dari Komputer
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Format PNG, JPG, SVG, WebP (Maks 4MB)
                  </span>
                </div>

                {/* Preview Box */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-2 p-1">
                    {customLogoUrl ? (
                      <img src={customLogoUrl} alt="Logo Sekolah" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <TutWuriHandayaniSDLogo className="w-16 h-16" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {customLogoUrl ? 'Logo Kustom Aktif' : 'Menggunakan Lambang Tut Wuri Handayani SD'}
                  </span>
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomLogoUrl('')}
                      className="mt-2 text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Logo Kustom</span>
                    </button>
                  )}
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Atau Masukkan Tautan URL Logo Sekolah:
                </label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://contoh-domain.sch.id/logo-sd.png"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: School Stamp / Stempel */}
          {activeTab === 'stempel' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Stempel / Cap Resmi Sekolah
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cap stempel otomatis dicantumkan di samping tanda tangan Kepala Sekolah pada Kartu Tanda Pelajar dan Lembar STTB/Raport.
                </p>
              </div>

              <input
                type="file"
                ref={fileStempelRef}
                onChange={(e) => handleFileUpload(e, 'stempel')}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => fileStempelRef.current?.click()}
                  className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Unggah Berkas Stempel (PNG Transparan)
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Disarankan berlatar belakang transparan (PNG)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-center overflow-hidden mb-2 p-1">
                    {stempelUrl ? (
                      <img src={stempelUrl} alt="Stempel Sekolah" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 text-center leading-tight">
                        STEMPEL<br/>SEKOLAH
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {stempelUrl ? 'Stempel Terpasang' : 'Belum Ada Stempel'}
                  </span>
                  {stempelUrl && (
                    <button
                      type="button"
                      onClick={() => setStempelUrl('')}
                      className="mt-2 text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Stempel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan logo & lambang resmi sekolah berhasil disimpan!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#003399] hover:bg-[#002266] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer hover:scale-102"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan Logo</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUB-MODAL: TAMBAH / EDIT LAMBANG NASIONAL RESMI                           */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Sub-modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-b border-blue-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <Pencil className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {editingLogoItem ? `Edit Lambang: ${editingLogoItem.name}` : 'Tambah Lambang Nasional / Resmi Baru'}
                  </h4>
                  <p className="text-[10px] text-blue-200">
                    Konfigurasi nama, lencana jenjang, dan format lambang resmi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              
              {/* Nama Lambang */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lambang Resmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Misal: Tut Wuri Handayani SD Negeri 006, Lambang Kemenag MTs, dll."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Kategori Jenjang & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Jenjang
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const val = e.target.value as NationalLogoItem['category'];
                      setFormCategory(val);
                      if (val === 'sd') {
                        setFormBadgeLabel('SD');
                        setFormBadgeColor('bg-red-600 text-white');
                        setVectorRibbonText('SD');
                        setVectorRibbonColor('#DC2626');
                      } else if (val === 'smp') {
                        setFormBadgeLabel('SMP');
                        setFormBadgeColor('bg-blue-800 text-white');
                        setVectorRibbonText('SMP');
                        setVectorRibbonColor('#1E3A8A');
                      } else if (val === 'sma') {
                        setFormBadgeLabel('SMA');
                        setFormBadgeColor('bg-slate-700 text-white');
                        setVectorRibbonText('SMA');
                        setVectorRibbonColor('#475569');
                      } else if (val === 'smk') {
                        setFormBadgeLabel('SMK');
                        setFormBadgeColor('bg-orange-600 text-white');
                        setVectorRibbonText('SMK');
                        setVectorRibbonColor('#EA580C');
                      } else if (val === 'kemenag') {
                        setFormBadgeLabel('KEMENAG');
                        setFormBadgeColor('bg-emerald-600 text-white');
                        setVectorRibbonText('MI');
                        setVectorRibbonColor('#059669');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="sd">Sekolah Dasar (SD)</option>
                    <option value="smp">Sekolah Menengah Pertama (SMP)</option>
                    <option value="sma">Sekolah Menengah Atas (SMA)</option>
                    <option value="smk">Sekolah Menengah Kejuruan (SMK)</option>
                    <option value="kemenag">Kementerian Agama / Madrasah (MI / MTs / MA)</option>
                    <option value="kemdikbud">Kemendikbudristek (Pusat / Dinas)</option>
                    <option value="garuda">Garuda Pancasila / Nasional</option>
                    <option value="kustom">Lainnya / Yayasan / Kustom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Label Lencana Singkat (Badge)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={10}
                      value={formBadgeLabel}
                      onChange={(e) => setFormBadgeLabel(e.target.value.toUpperCase())}
                      placeholder="SD / SMP / MI"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-black tracking-wider uppercase text-center"
                    />
                    <span className={cn(
                      "px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center justify-center shrink-0",
                      formBadgeColor
                    )}>
                      {formBadgeLabel || 'LABEL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Lambang
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat mengenai lambang ini"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Pilihan Sumber Lambang */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilih Format Desain Lambang:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSourceType('upload')}
                    className={cn(
                      "p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer",
                      formSourceType === 'upload'
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Upload File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormSourceType('vector')}
                    className={cn(
                      "p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer",
                      formSourceType === 'vector'
                        ? "border-amber-600 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Palette className="w-4 h-4 text-amber-600" />
                    <span>Vektor Otomatis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormSourceType('url')}
                    className={cn(
                      "p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all cursor-pointer",
                      formSourceType === 'url'
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Tautan URL</span>
                  </button>
                </div>
              </div>

              {/* Source 1: Upload File */}
              {formSourceType === 'upload' && (
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="file"
                    ref={fileNationalRef}
                    onChange={(e) => handleFileUpload(e, 'national')}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileNationalRef.current?.click()}
                    className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 hover:border-blue-500 rounded-xl bg-white dark:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                  >
                    <FileImage className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Klik untuk Upload Berkas Gambar (PNG Transparan / SVG)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Maksimal 4MB (Disarankan berformat PNG tanpa latar belakang)
                    </span>
                  </div>
                </div>
              )}

              {/* Source 2: URL */}
              {formSourceType === 'url' && (
                <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Masukkan URL Gambar Lambang:
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://domain.com/lambang-tut-wuri.png"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                  />
                </div>
              )}

              {/* Source 3: Vector Customization */}
              {formSourceType === 'vector' && (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Teks Pada Pita
                      </label>
                      <input
                        type="text"
                        value={vectorRibbonText}
                        onChange={(e) => setVectorRibbonText(e.target.value.toUpperCase())}
                        placeholder="SD / SMP / SMA"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Teks Melingkar Semboyan
                      </label>
                      <input
                        type="text"
                        value={vectorMottoText}
                        onChange={(e) => setVectorMottoText(e.target.value.toUpperCase())}
                        placeholder="TUT WURI HANDAYANI"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                        Warna Pita
                      </label>
                      <input
                        type="color"
                        value={vectorRibbonColor}
                        onChange={(e) => setVectorRibbonColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                        Warna Perisai
                      </label>
                      <input
                        type="color"
                        value={vectorShieldColor}
                        onChange={(e) => setVectorShieldColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                        Warna Lingkaran
                      </label>
                      <input
                        type="color"
                        value={vectorOuterColor}
                        onChange={(e) => setVectorOuterColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-modal Live Preview */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 p-1 flex items-center justify-center shadow-xs border border-amber-300 shrink-0">
                    {formSourceType === 'vector' ? (
                      <CustomVectorEmblem
                        className="w-12 h-12"
                        ribbonText={vectorRibbonText || formBadgeLabel}
                        ribbonColor={vectorRibbonColor}
                        shieldColor={vectorShieldColor}
                        outerColor={vectorOuterColor}
                        mottoText={vectorMottoText}
                      />
                    ) : formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <TutWuriHandayaniSDLogo className="w-12 h-12" />
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-slate-100">
                      {formName || 'Nama Lambang Baru'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Badge: <span className="font-bold text-blue-700 dark:text-blue-400">{formBadgeLabel || '-'}</span> | {formDescription || 'Tanpa deskripsi'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sub-modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-300 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveNationalLogo}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Check className="w-4 h-4" />
                <span>{editingLogoItem ? 'Simpan Perubahan Lambang' : 'Tambahkan ke Daftar'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
