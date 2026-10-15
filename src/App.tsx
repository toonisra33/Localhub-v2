import React, { useState, useEffect, useRef } from 'react';
import { BroadcastProvider, useBroadcast } from './context/BroadcastContext';
import { CommunityProvider, useCommunity, VALID_TABS } from './context/CommunityContext';
import { Tab } from './types';
import { Volume2, X } from 'lucide-react';
import { AdminBroadcastBanner } from './components/AdminBroadcastBanner';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { NotificationActivationBanner } from './components/NotificationActivationBanner';
import { Navbar } from './components/Navbar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileNav } from './components/MobileNav';

// Views
import { HomeView } from './components/views/HomeView';
import { FeedView } from './components/views/FeedView';
import { BroadcastListView } from './components/views/BroadcastListView';
import { MarketView } from './components/views/MarketView';
import { AlertsView } from './components/views/AlertsView';
import { MapView } from './components/views/MapView';
import { ProfileView } from './components/views/ProfileView';
import { WeatherForecastView } from './components/views/WeatherForecastView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

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
import { AdminSignalTestModal } from './components/modals/AdminSignalTestModal';
import { LoginModal } from './components/modals/LoginModal';
import { AppUpdateBanner } from './components/AppUpdateBanner';
import { InstantCameraModal } from './components/modals/InstantCameraModal';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    openedPost,
    closePostDetail,
    isContactAdminModalOpen,
    closeContactAdminModal,
    isLocationModalOpen,
    closeLocationModal,
    isLocationPermissionModalOpen,
    closeLocationPermissionModal,
    isLoginModalOpen,
    closeLoginModal,
    showToast,
    goBack
  } = useCommunity();
  const {
    isTestingLocalAdmin,
    stopLocalDeviceTest,
    isAdminModalOpen,
    setOpenAdminModal,
    isSignalTestModalOpen,
    setOpenSignalTestModal,
    activeTestSignal,
    dismissTestSignal
  } = useBroadcast();

  // Local modal states
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isInstantCameraOpen, setIsInstantCameraOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [createPostInitialMode, setCreatePostInitialMode] = useState<'camera' | 'gallery' | 'video' | 'standard'>('standard');
  const [createPostInitialImages, setCreatePostInitialImages] = useState<string[]>([]);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState(false);
  const [isReportAlertModalOpen, setIsReportAlertModalOpen] = useState(false);
  const [reportAlertCoords, setReportAlertCoords] = useState<{ lat?: number; lng?: number; address?: string } | undefined>();

  const openReportAlert = (coords?: { lat?: number; lng?: number; address?: string }) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'reportAlert', tab: activeTab }, '', '#' + activeTab + '?modal=reportAlert');
    }
    setReportAlertCoords(coords);
    setIsReportAlertModalOpen(true);
  };

  const closeReportAlert = () => {
    setIsReportAlertModalOpen(false);
    setReportAlertCoords(undefined);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'reportAlert') {
      window.history.back();
    }
  };

  const openCreatePostWith = (mode: 'camera' | 'gallery' | 'video' | 'standard' = 'standard', images: string[] = []) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'createPost', tab: activeTab }, '', '#' + activeTab + '?modal=createPost');
    }
    setCreatePostInitialMode(mode);
    setCreatePostInitialImages(images);
    setIsCreatePostModalOpen(true);
  };

  const closeCreatePost = () => {
    setIsCreatePostModalOpen(false);
    setCreatePostInitialImages([]);
    setCreatePostInitialMode('standard');
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'createPost') {
      window.history.back();
    }
  };

  const openCreateMarket = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'createMarket', tab: activeTab }, '', '#' + activeTab + '?modal=createMarket');
    }
    setIsCreateMarketModalOpen(true);
  };

  const closeCreateMarket = () => {
    setIsCreateMarketModalOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'createMarket') {
      window.history.back();
    }
  };

  const openNotifModal = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'notifications', tab: activeTab }, '', '#' + activeTab + '?modal=notifications');
    }
    setIsNotifModalOpen(true);
  };

  const closeNotifModal = () => {
    setIsNotifModalOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'notifications') {
      window.history.back();
    }
  };

  const openInstantCamera = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'camera', tab: activeTab }, '', '#' + activeTab + '?modal=camera');
    }
    setIsInstantCameraOpen(true);
  };

  const closeInstantCamera = () => {
    setIsInstantCameraOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'camera') {
      window.history.back();
    }
  };

  const lastBackPressRef = useRef(0);

  // Global browser back and hardware back button listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#/, '').split('?')[0];
      const initialTab = VALID_TABS.includes(currentHash as Tab) ? (currentHash as Tab) : activeTab || 'home';
      
      // Guard base state
      if (!window.history.state) {
        window.history.replaceState({ type: 'tab', tab: initialTab, isBase: true }, '', '#' + initialTab);
        window.history.pushState({ type: 'tab', tab: initialTab, isRoot: true }, '', '#' + initialTab);
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. Check if any modal is currently open and close the active one
      if (activeTestSignal) {
        dismissTestSignal();
        return;
      }
      if (isSignalTestModalOpen) {
        setOpenSignalTestModal(false);
        return;
      }
      if (isAdminModalOpen) {
        setOpenAdminModal(false);
        return;
      }
      if (isInstantCameraOpen) {
        setIsInstantCameraOpen(false);
        return;
      }
      if (isCreatePostModalOpen) {
        setIsCreatePostModalOpen(false);
        setCreatePostInitialImages([]);
        setCreatePostInitialMode('standard');
        return;
      }
      if (isCreateMarketModalOpen) {
        setIsCreateMarketModalOpen(false);
        return;
      }
      if (isReportAlertModalOpen) {
        setIsReportAlertModalOpen(false);
        setReportAlertCoords(undefined);
        return;
      }
      if (openedPost) {
        closePostDetail();
        return;
      }
      if (isNotifModalOpen) {
        setIsNotifModalOpen(false);
        return;
      }
      if (isLocationModalOpen) {
        closeLocationModal();
        return;
      }
      if (isLocationPermissionModalOpen) {
        closeLocationPermissionModal();
        return;
      }
      if (isContactAdminModalOpen) {
        closeContactAdminModal();
        return;
      }
      if (isLoginModalOpen) {
        closeLoginModal();
        return;
      }

      // 2. If NO modal is open, navigate between tabs
      const targetTab = (event.state?.tab as Tab) || (window.location.hash.replace(/^#/, '').split('?')[0] as Tab);
      if (targetTab && VALID_TABS.includes(targetTab)) {
        if (targetTab !== activeTab) {
          setActiveTab(targetTab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 3. Root screen reached (home with no previous tabs in app history)
      // Prevent accidental exiting and prompt user
      const now = Date.now();
      if (now - lastBackPressRef.current < 2500) {
        // Double-back within 2.5s: permit normal browser exit
        window.history.back();
      } else {
        lastBackPressRef.current = now;
        showToast('กด ย้อนกลับ อีกครั้งเพื่อออกจากแอป', 'info');
        window.history.pushState({ type: 'tab', tab: activeTab, isRoot: true }, '', '#' + activeTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    activeTab,
    activeTestSignal,
    isSignalTestModalOpen,
    isAdminModalOpen,
    isInstantCameraOpen,
    isCreatePostModalOpen,
    isCreateMarketModalOpen,
    isReportAlertModalOpen,
    openedPost,
    isNotifModalOpen,
    isLocationModalOpen,
    isLocationPermissionModalOpen,
    isContactAdminModalOpen,
    isLoginModalOpen,
    closePostDetail,
    closeLocationModal,
    closeLocationPermissionModal,
    closeContactAdminModal,
    closeLoginModal,
    dismissTestSignal,
    setOpenSignalTestModal,
    setOpenAdminModal,
    setActiveTab,
    showToast
  ]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-20 lg:pb-8 selection:bg-blue-500 selection:text-white">
      {/* Floating Local Admin Test Status Pill */}
      {isTestingLocalAdmin && (
        <aside
          aria-label="สถานะการทดสอบสัญญาณ"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-md px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-emerald-500/60 flex items-center justify-between gap-2 sm:gap-3 backdrop-blur-md animate-bounce-subtle"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="p-1 sm:p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl animate-pulse shrink-0">
              <Volume2 className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-emerald-400 text-[11px] sm:text-xs truncate">
                กำลังทดสอบสัญญาณเสียง & ระบบสั่น (เฉพาะเครื่องนี้)
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                ไม่มีการส่งสัญญาณออกไปยังเครื่องของประชาชน
              </div>
            </div>
          </div>
          <button
            onClick={stopLocalDeviceTest}
            className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 shadow-xs active:scale-95"
            title="ปิดการทดสอบ (กากบาท)"
          >
            <X className="w-3.5 h-3.5" />
            <span>หยุด</span>
          </button>
        </aside>
      )}

      {/* Floating In-App Update Banner */}
      <AppUpdateBanner />

      {/* PWA Mobile Installation Banner & Guide */}
      <PWAInstallBanner />

      {/* Push Notification Activation & Test Banner */}
      <NotificationActivationBanner />

      {/* Top Emergency & Announcement Broadcast Banner */}
      <AdminBroadcastBanner />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Global Navbar */}
      <Navbar
        onOpenNotifications={openNotifModal}
        onOpenCreatePost={() => openCreatePostWith('standard')}
        onOpenCreatePostWithMode={(mode, images) => openCreatePostWith(mode, images || [])}
        onOpenInstantCamera={openInstantCamera}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-6 flex-1 flex gap-6 items-start">
        {/* Left Desktop Sidebar Navigation */}
        <DesktopSidebar />

        {/* Center Dynamic Tab View */}
        <section className="flex-1 min-w-0">
          {activeTab === 'home' && (
            <HomeView
              onOpenCreatePost={() => openCreatePostWith('standard')}
              onOpenInstantCamera={openInstantCamera}
              onOpenNotifications={openNotifModal}
              onOpenReportAlert={() => openReportAlert()}
            />
          )}

          {activeTab === 'feed' && (
            <FeedView
              onOpenCreatePost={() => openCreatePostWith('standard')}
              onOpenCreatePostWithMode={(mode, images) => openCreatePostWith(mode, images || [])}
              onOpenWeather={() => setActiveTab('weather')}
              onOpenInstantCamera={openInstantCamera}
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
              onOpenReportAlert={() => openReportAlert()}
              onOpenWeather={() => setActiveTab('weather')}
            />
          )}

          {activeTab === 'market' && (
            <MarketView onOpenCreateItem={openCreateMarket} />
          )}

          {activeTab === 'map' && (
            <MapView onOpenReportAlert={openReportAlert} />
          )}

          {activeTab === 'profile' && (
            <ProfileView onOpenCreatePost={() => openCreatePostWith('standard')} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardView />
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenInstantCamera={openInstantCamera} />

      {/* Modals */}
      <InstantCameraModal
        isOpen={isInstantCameraOpen}
        onClose={closeInstantCamera}
        onPhotoCaptured={(mediaUrl, mediaType) => {
          closeInstantCamera();
          openCreatePostWith(mediaType === 'video' ? 'video' : 'standard', [mediaUrl]);
        }}
      />
      <AllDevicesTestAlertModal />
      <AdminSignalTestModal />
      <AdminBroadcastModal />
      <LoginModal />

      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={closeNotifModal}
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
        onClose={closeCreatePost}
      />

      <CreateMarketItemModal
        isOpen={isCreateMarketModalOpen}
        onClose={closeCreateMarket}
      />

      <ReportAlertModal
        isOpen={isReportAlertModalOpen}
        onClose={closeReportAlert}
        initialCoords={reportAlertCoords?.lat && reportAlertCoords?.lng ? { lat: reportAlertCoords.lat, lng: reportAlertCoords.lng } : undefined}
        initialAddress={reportAlertCoords?.address}
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
