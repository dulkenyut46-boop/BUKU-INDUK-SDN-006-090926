import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { StudentListView } from './components/views/StudentListView';
import { DataGuruView } from './components/views/DataGuruView';
import { LaporanView } from './components/views/LaporanView';
import { PrintBukuIndukView } from './components/views/PrintBukuIndukView';
import { KartuPelajarView } from './components/views/KartuPelajarView';
import { RaportView } from './components/views/RaportView';
import { MutasiView } from './components/views/MutasiView';
import { STTBView } from './components/views/STTBView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SchoolProfileView } from './components/views/SchoolProfileView';
import { AdminSettingsView } from './components/views/AdminSettingsView';
import { PublicVerifyView } from './components/views/PublicVerifyView';
import { LoginView } from './components/views/LoginView';


// Modals
import { StudentFormModal } from './components/modals/StudentFormModal';
import { StudentDetailModal } from './components/modals/StudentDetailModal';
import { MutationModal } from './components/modals/MutationModal';
import { STTBModal } from './components/modals/STTBModal';
import { RaportInputModal } from './components/modals/RaportInputModal';
import { ActivityLogModal } from './components/modals/ActivityLogModal';

import { Student, MutationRecord, GraduationSTTB, SemesterReport } from './types';

const MainAppContent: React.FC = () => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    processMutation, 
    updateSTTB, 
    addOrUpdateRaport,
    isAuthenticated
  } = useSchool();

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buku_induk_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const handleToggleSidebar = (open?: boolean) => {
    setIsSidebarOpen(prev => {
      const next = open !== undefined ? open : !prev;
      try {
        localStorage.setItem('buku_induk_sidebar_open', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Selected student for detail/print views
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [studentForDetail, setStudentForDetail] = useState<Student | null>(null);

  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [studentForMutation, setStudentForMutation] = useState<Student | null>(null);

  const [isSTTBModalOpen, setIsSTTBModalOpen] = useState(false);
  const [studentForSTTB, setStudentForSTTB] = useState<Student | null>(null);

  const [isRaportModalOpen, setIsRaportModalOpen] = useState(false);
  const [studentForRaport, setStudentForRaport] = useState<Student | null>(null);

  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);

  // Handlers
  const handleOpenAddModal = () => {
    setStudentToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsAddEditModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleSelectStudentDetail = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentForDetail(student);
      setSelectedStudentId(studentId);
      setIsDetailModalOpen(true);
    }
  };

  const handleDirectPrintBukuInduk = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('print-buku-induk');
    setIsDetailModalOpen(false);
  };

  const handleDirectPrintKartuPelajar = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab('kartu-pelajar');
    setIsDetailModalOpen(false);
  };

  const handleOpenMutation = (student: Student) => {
    setStudentForMutation(student);
    setIsMutationModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleOpenSTTB = (student: Student) => {
    setStudentForSTTB(student);
    setIsSTTBModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleOpenRaport = (student: Student) => {
    setStudentForRaport(student);
    setIsRaportModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleSaveStudent = (data: Partial<Student>) => {
    if (studentToEdit) {
      updateStudent(studentToEdit.id, data);
      if (studentForDetail && studentForDetail.id === studentToEdit.id) {
        setStudentForDetail(prev => prev ? ({ ...prev, ...data } as Student) : null);
      }
    } else {
      addStudent(data as Omit<Student, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleSaveMutation = (studentId: string, mutation: MutationRecord) => {
    processMutation(studentId, mutation);
  };

  const handleSaveSTTB = (studentId: string, sttb: GraduationSTTB) => {
    updateSTTB(studentId, sttb);
  };

  const handleSaveRaport = (studentId: string, report: SemesterReport) => {
    addOrUpdateRaport(studentId, report);
  };

  if (!isAuthenticated) {
    return <LoginView onSuccess={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOpen={isSidebarOpen}
        setIsOpen={handleToggleSidebar}
        onClose={() => handleToggleSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ease-in-out print:overflow-visible print:block print:h-auto">
        {/* Topbar */}
        <Topbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => handleToggleSidebar()}
          onOpenSidebar={() => handleToggleSidebar()}
          onOpenActivityLogs={() => setIsActivityLogModalOpen(true)}
          setActiveTab={setActiveTab}
          onSelectStudentDetail={handleSelectStudentDetail}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out print:overflow-visible print:p-0 print:m-0 print:block">
          <div className="w-full max-w-7xl mx-auto transition-all duration-300 ease-in-out print:max-w-none print:w-full print:m-0 print:p-0">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenAddModal={handleOpenAddModal}
                onSelectStudentDetail={handleSelectStudentDetail}
              />
            )}

            {activeTab === 'students' && (
              <StudentListView
                onOpenAddModal={handleOpenAddModal}
                onEditStudent={handleOpenEditModal}
                onSelectDetail={handleSelectStudentDetail}
                onPrintBukuInduk={handleDirectPrintBukuInduk}
                onPrintKartuPelajar={handleDirectPrintKartuPelajar}
                onMutasi={handleOpenMutation}
                onSTTB={handleOpenSTTB}
                onRaport={handleOpenRaport}
                setActiveTab={setActiveTab}
                onBack={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'teachers' && (
              <DataGuruView
                onBack={() => setActiveTab('dashboard')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'reports' && (
              <LaporanView
                setActiveTab={setActiveTab}
                onOpenActivityLogs={() => setIsActivityLogModalOpen(true)}
                onBack={() => setActiveTab('dashboard')}
              />
            )}

            {(activeTab === 'print-buku-induk' || activeTab === 'print-blank-buku-induk') && (
              <PrintBukuIndukView
                selectedStudentId={selectedStudentId}
                onBack={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'kartu-pelajar' && (
              <KartuPelajarView
                selectedStudentId={selectedStudentId}
                onBack={() => setActiveTab('reports')}
              />
            )}

            {activeTab === 'raport' && (
              <RaportView
                onOpenRaportModal={handleOpenRaport}
                onSelectStudentDetail={handleSelectStudentDetail}
                onBack={() => setActiveTab('reports')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'mutasi' && (
              <MutasiView
                onOpenMutationModal={handleOpenMutation}
                onSelectStudentDetail={handleSelectStudentDetail}
                onBack={() => setActiveTab('reports')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'sttb' && (
              <STTBView
                onOpenSTTBModal={handleOpenSTTB}
                onSelectStudentDetail={handleSelectStudentDetail}
                onBack={() => setActiveTab('reports')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'public-verify' && (
              <PublicVerifyView
                onBack={() => setActiveTab('dashboard')}
                onSelectStudentDetail={handleSelectStudentDetail}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView 
                onBack={() => setActiveTab('dashboard')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'school-profile' && (
              <SchoolProfileView 
                onBack={() => setActiveTab('dashboard')}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'admin-settings' && (
              <AdminSettingsView
                setActiveTab={setActiveTab}
                onBack={() => setActiveTab('dashboard')}
                onOpenActivityLogs={() => setIsActivityLogModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      <StudentFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        initialData={studentToEdit}
      />

      <StudentDetailModal
        student={studentForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleOpenEditModal}
        onPrintBukuInduk={handleDirectPrintBukuInduk}
        onPrintKartuPelajar={handleDirectPrintKartuPelajar}
        onMutasi={handleOpenMutation}
        onSTTB={handleOpenSTTB}
        onRaport={handleOpenRaport}
      />

      <MutationModal
        student={studentForMutation}
        isOpen={isMutationModalOpen}
        onClose={() => setIsMutationModalOpen(false)}
        onSave={handleSaveMutation}
      />

      <STTBModal
        student={studentForSTTB}
        isOpen={isSTTBModalOpen}
        onClose={() => setIsSTTBModalOpen(false)}
        onSave={handleSaveSTTB}
      />

      <RaportInputModal
        student={studentForRaport}
        isOpen={isRaportModalOpen}
        onClose={() => setIsRaportModalOpen(false)}
        onSave={handleSaveRaport}
      />

      <ActivityLogModal
        isOpen={isActivityLogModalOpen}
        onClose={() => setIsActivityLogModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <SchoolProvider>
      <MainAppContent />
    </SchoolProvider>
  );
}

export default App;
