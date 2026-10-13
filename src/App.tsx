import React, { useState } from 'react';
import { BroadcastProvider, useBroadcast } from './context/BroadcastContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { Volume2 } from 'lucide-react';
import { AdminBroadcastBanner } from './components/AdminBroadcastBanner';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileNav } from './components/MobileNav';

// Views
import { FeedView } from './components/views/FeedView';
import { BroadcastListView } from './components/views/BroadcastListView';
import { MarketView } from './components/views/MarketView';
import { AlertsView } from './components/views/AlertsView';
import { MapView } from './components/views/MapView';
import { ProfileView } from './components/views/ProfileView';
import { WeatherForecastView } from './components/views/WeatherForecastView';

// Modals
import { AdminBroadcastModal } from './components/modals/AdminBroadcastModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { PostDetailCommentsModal } from './components/modals/PostDetailCommentsModal';
import { LocationPickerModal } from './components/modals/LocationPickerModal';
import { LocationPermissionModal } from './components/modals/LocationPermissionModal';
import { CreatePostModal } from './components/modals/CreatePostModal';
import { CreateMarketItemModal } from './components/modals/CreateMarketItemModal';
import { ReportAlertModal } from './components/modals/ReportAlertModal';
import { ContactAdminModal } from './components/modals/ContactAdminModal';
import { ToastContainer } from './components/modals/ToastContainer';
import { AllDevicesTestAlertModal } from './components/modals/AllDevicesTestAlertModal';
import { AdminSignalTestBar } from './components/AdminSignalTestBar';
import { AdminSignalTestModal } from './components/modals/AdminSignalTestModal';
import { AppUpdateBanner } from './components/AppUpdateBanner';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    openedPost,
    closePostDetail,
    isContactAdminModalOpen,
    closeContactAdminModal
  } = useCommunity();
  const { isTestingLocalAdmin, stopLocalDeviceTest } = useBroadcast();

  // Local modal states
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [createPostInitialMode, setCreatePostInitialMode] = useState<'camera' | 'gallery' | 'video' | 'standard'>('standard');
  const [createPostInitialImages, setCreatePostInitialImages] = useState<string[]>([]);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState(false);
  const [isReportAlertModalOpen, setIsReportAlertModalOpen] = useState(false);

  const openCreatePostWith = (mode: 'camera' | 'gallery' | 'video' | 'standard' = 'standard', images: string[] = []) => {
    setCreatePostInitialMode(mode);
    setCreatePostInitialImages(images);
    setIsCreatePostModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-20 lg:pb-8 selection:bg-blue-500 selection:text-white">
      {/* Floating Local Admin Test Status Pill */}
      {isTestingLocalAdmin && (
        <aside aria-label="สถานะการทดสอบสัญญาณ" className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-emerald-500/60 flex items-center gap-3 backdrop-blur-md animate-bounce-subtle">
          <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl animate-pulse">
            <Volume2 className="w-4 h-4" />
          </span>
          <div className="text-xs">
            <div className="font-bold text-emerald-400">กำลังทดสอบสัญญาณเสียง & ระบบสั่น (เฉพาะเครื่องนี้)</div>
            <div className="text-[10px] text-slate-400">ไม่มีการส่งสัญญาณออกไปยังเครื่องของประชาชน</div>
          </div>
          <button
            onClick={stopLocalDeviceTest}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition ml-2 shrink-0"
          >
            หยุด
          </button>
        </aside>
      )}

      {/* Floating In-App Update Banner */}
      <AppUpdateBanner />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Emergency & Announcement Broadcast Banner */}
      <AdminBroadcastBanner />

      {/* Global Navbar */}
      <Navbar
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenCreatePost={() => openCreatePostWith('standard')}
        onOpenCreatePostWithMode={(mode, images) => openCreatePostWith(mode, images || [])}
      />

      {/* Permanent Admin Signal Test Bar (Directly visible upon opening the app) */}
      <AdminSignalTestBar />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-6 flex-1 flex gap-6 items-start">
        {/* Left Desktop Sidebar Navigation */}
        <DesktopSidebar />

        {/* Center Dynamic Tab View */}
        <section className="flex-1 min-w-0">
          {activeTab === 'feed' && (
            <FeedView
              onOpenCreatePost={() => openCreatePostWith('standard')}
              onOpenCreatePostWithMode={(mode, images) => openCreatePostWith(mode, images || [])}
              onOpenWeather={() => setActiveTab('weather')}
            />
          )}

          {activeTab === 'broadcasts' && (
            <BroadcastListView />
          )}

          {activeTab === 'weather' && (
            <WeatherForecastView />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              onOpenReportAlert={() => setIsReportAlertModalOpen(true)}
              onOpenWeather={() => setActiveTab('weather')}
            />
          )}

          {activeTab === 'market' && (
            <MarketView onOpenCreateItem={() => setIsCreateMarketModalOpen(true)} />
          )}

          {activeTab === 'map' && (
            <MapView />
          )}

          {activeTab === 'profile' && (
            <ProfileView />
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Modals */}
      <AllDevicesTestAlertModal />
      <AdminSignalTestModal />
      <AdminBroadcastModal />

      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Global Post Detail & Comments Modal (Triggered immediately by Notifications or Toast jump) */}
      {openedPost && (
        <PostDetailCommentsModal
          post={openedPost}
          onClose={closePostDetail}
        />
      )}

      <LocationPickerModal />
      <LocationPermissionModal />

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        initialMode={createPostInitialMode}
        initialImages={createPostInitialImages}
        onClose={() => {
          setIsCreatePostModalOpen(false);
          setCreatePostInitialImages([]);
          setCreatePostInitialMode('standard');
        }}
      />

      <CreateMarketItemModal
        isOpen={isCreateMarketModalOpen}
        onClose={() => setIsCreateMarketModalOpen(false)}
      />

      <ReportAlertModal
        isOpen={isReportAlertModalOpen}
        onClose={() => setIsReportAlertModalOpen(false)}
      />

      <ContactAdminModal
        isOpen={isContactAdminModalOpen}
        onClose={closeContactAdminModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <BroadcastProvider>
      <CommunityProvider>
        <AppContent />
      </CommunityProvider>
    </BroadcastProvider>
  );
}
