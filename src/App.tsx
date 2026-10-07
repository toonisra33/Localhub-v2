import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import { Navigation } from './components/Navigation';
import { HomeFeed } from './components/HomeFeed';
import { AroundMeMap } from './components/AroundMeMap';
import { CommunityFeed } from './components/CommunityFeed';
import { GlobalNewsFeed } from './components/GlobalNewsFeed';
import { LocalMarket } from './components/LocalMarket';
import { UserProfile } from './components/UserProfile';
import { ChatView } from './components/chat/ChatView';
import { ChatRoomModal } from './components/chat/ChatRoomModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminBroadcastBanner } from './components/AdminBroadcastBanner';
import { AdminBroadcastModal } from './components/AdminBroadcastModal';
import { BroadcastProvider, useBroadcast } from './context/BroadcastContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { ToastContainer } from './components/modals/ToastContainer';
import { AppNotifications } from './lib/notifications';
import { AuthModal } from './components/modals/AuthModal';
import { PublicProfileModal } from './components/modals/PublicProfileModal';
import { LocationPermissionModal } from './components/modals/LocationPermissionModal';
import { MediaViewerModal } from './components/modals/MediaViewerModal';
import { ContactAdminModal } from './components/modals/ContactAdminModal';
import { LocationPickerModal } from './components/modals/LocationPickerModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { PromoKitModal } from './components/modals/PromoKitModal';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopRightRail } from './components/DesktopRightRail';
import { MessageCircle } from 'lucide-react';
import { isAuthorizedAdminEmail } from './lib/firebase';

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    isLocationPermissionModalOpen,
    viewingProfileId,
    closePublicProfile, 
    closeLocationPermissionModal,
    activeMedia,
    closeMediaViewer,
    isContactAdminModalOpen,
    closeContactAdminModal,
    isLoggedIn,
    userProfile
  } = useCommunity();

  const { isBroadcastVisible, activeBroadcast, role, setRole } = useBroadcast();

  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const [directChatUser, setDirectChatUser] = useState<{id: string, name: string, avatar: string} | null>(null);

  useEffect(() => {
    AppNotifications.requestPermission();
  }, []);

  const renderContent = () => {
    // Access Control check
    if (activeTab === 'admin_dashboard') {
      const isAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);
      if (!isAdmin) return <HomeFeed />;
      return <AdminDashboard />;
    }

    switch (activeTab) {
      case 'home': return <HomeFeed />;
      case 'map': return <AroundMeMap />;
      case 'global_news': return <GlobalNewsFeed />;
      case 'community': return <CommunityFeed />;
      case 'market': return <LocalMarket />;
      case 'me': return <UserProfile />;
      default: return <HomeFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Floating Admin Broadcast Alert Box (Fixed on top of screen, stays locked during scroll for 3 mins) */}
      <AdminBroadcastBanner />

      {/* Desktop & Tablet Left Navigation Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLocationPicker={() => setShowLocationModal(true)}
        onOpenNotifications={() => setShowNotificationsModal(true)}
      />

      {/* Main Responsive Content Column
          - Mobile (< 768px): w-full max-w-md mx-auto
          - Tablet (768px - 1023px): w-full md:max-w-2xl
          - Desktop (1024px - 1279px): w-full lg:max-w-3xl
          - Wide Desktop (>= 1280px): w-full xl:max-w-4xl
      */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-slate-50 min-h-screen relative flex flex-col md:border-x md:border-slate-200/80 shadow-sm overflow-x-hidden">
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto bg-slate-50/80 transition-all duration-300 ${isBroadcastVisible && activeBroadcast ? 'pt-[64px]' : 'pt-0'}`}>
          {renderContent()}
        </main>

        {/* Floating Chat Button */}
        {activeTab !== 'map' && activeTab !== 'admin_dashboard' && (
          <button 
            onClick={() => setIsChatMenuOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-5 md:right-8 w-14 h-14 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-white z-40 group border border-slate-700/60 modern-glow-emerald"
            aria-label="ข้อความ"
          >
            <MessageCircle size={24} className="group-hover:-rotate-6 transition-transform text-slate-100" />
            <span className="absolute right-full mr-3.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg border border-slate-800 hidden sm:flex items-center gap-1.5 pointer-events-none">
              <MessageCircle size={11} className="text-emerald-400" />
              ข้อความ
            </span>
          </button>
        )}

        {/* Bottom Navigation (Mobile Only, hidden on md and up) */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Desktop Right Rail for Wide Monitors (>= 1280px / xl) */}
      <DesktopRightRail
        onSelectTab={setActiveTab}
        onOpenPromoKit={() => setShowPromoModal(true)}
      />

      {/* Shared Modals triggered from Desktop Sidebar / Rail */}
      {showLocationModal && <LocationPickerModal onClose={() => setShowLocationModal(false)} />}
      {showNotificationsModal && <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />}
      {showPromoModal && <PromoKitModal isOpen={showPromoModal} onClose={() => setShowPromoModal(false)} />}

      {/* Chat Overview Modal (Friends) */}
      {isChatMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in slide-in-from-bottom-4 duration-200">
          <ChatView 
            onClose={() => setIsChatMenuOpen(false)} 
          />
        </div>
      )}
      
      {/* Admin Broadcast Control Center Modal */}
      <AdminBroadcastModal />
      
      {/* User Registration & Login Modal */}
      <AuthModal />
      {viewingProfileId && (
        <PublicProfileModal
          isOpen={true}
          onClose={closePublicProfile}
          userId={viewingProfileId}
          onMessageClick={(user) => {
            closePublicProfile();
            setDirectChatUser(user);
          }}
        />
      )}
      
      {directChatUser && (
        <ChatRoomModal
          isOpen={true}
          onClose={() => setDirectChatUser(null)}
          roomId={null}
          otherUserId={directChatUser.id}
          otherUserName={directChatUser.name}
          otherUserAvatar={directChatUser.avatar}
        />
      )}
      
      {/* Real GPS Location Permission & Consent Modal */}
      <LocationPermissionModal 
        isOpen={isLocationPermissionModalOpen}
        onClose={closeLocationPermissionModal}
      />

      {/* Global Fullscreen Media Viewer (Image & Video) */}
      <MediaViewerModal 
        media={activeMedia}
        onClose={closeMediaViewer}
      />

      {/* Contact Admin & PR Request Modal */}
      <ContactAdminModal
        isOpen={isContactAdminModalOpen}
        onClose={closeContactAdminModal}
      />
      
    </div>
  );
}

export default function App() {
  return (
    <CommunityProvider>
      <BroadcastProvider>
        <AppContent />
      </BroadcastProvider>
    </CommunityProvider>
  );
}
