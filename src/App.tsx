import React, { useState } from 'react';
import { BroadcastProvider } from './context/BroadcastContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
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
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';

function AppContent() {
  const {
    activeTab,
    openedPost,
    closePostDetail,
    isContactAdminModalOpen,
    closeContactAdminModal
  } = useCommunity();

  // Local modal states
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateMarketModalOpen, setIsCreateMarketModalOpen] = useState(false);
  const [isReportAlertModalOpen, setIsReportAlertModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 pb-20 lg:pb-8 selection:bg-blue-500 selection:text-white">
      {/* PWA Home Screen Installation Banner */}
      <PWAInstallBanner />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Emergency & Announcement Broadcast Banner */}
      <AdminBroadcastBanner />

      {/* Global Navbar */}
      <Navbar
        onOpenNotifications={() => setIsNotifModalOpen(true)}
        onOpenCreatePost={() => setIsCreatePostModalOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-6 flex-1 flex gap-6 items-start">
        {/* Left Desktop Sidebar Navigation */}
        <DesktopSidebar />

        {/* Center Dynamic Tab View */}
        <section className="flex-1 min-w-0">
          {activeTab === 'feed' && (
            <FeedView onOpenCreatePost={() => setIsCreatePostModalOpen(true)} />
          )}

          {activeTab === 'broadcasts' && (
            <BroadcastListView />
          )}

          {activeTab === 'market' && (
            <MarketView onOpenCreateItem={() => setIsCreateMarketModalOpen(true)} />
          )}

          {activeTab === 'alerts' && (
            <AlertsView onOpenReportAlert={() => setIsReportAlertModalOpen(true)} />
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
        onClose={() => setIsCreatePostModalOpen(false)}
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
