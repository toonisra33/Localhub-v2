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
import { AiChat } from './components/AiChat';
import { AdminBroadcastBanner } from './components/AdminBroadcastBanner';
import { AdminBroadcastModal } from './components/AdminBroadcastModal';
import { BroadcastProvider, useBroadcast } from './context/BroadcastContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { ToastContainer } from './components/modals/ToastContainer';
import { AuthModal } from './components/modals/AuthModal';
import { PublicProfileModal } from './components/modals/PublicProfileModal';
import { LocationPermissionModal } from './components/modals/LocationPermissionModal';
import { MediaViewerModal } from './components/modals/MediaViewerModal';
import { ContactAdminModal } from './components/modals/ContactAdminModal';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
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

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [directChatUser, setDirectChatUser] = useState<{id: string, name: string, avatar: string} | null>(null);

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
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 shadow-[0_0_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden sm:border-x sm:border-slate-200/80 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Top Floating Admin Broadcast Alert Box (Fixed on top of screen, stays locked during scroll for 3 mins) */}
      <AdminBroadcastBanner />

      {/* Main Content Area (Smooth padding offset when floating banner is active) */}
      <main className={`flex-1 overflow-y-auto bg-slate-50/80 transition-all duration-300 ${isBroadcastVisible && activeBroadcast ? 'pt-[64px]' : 'pt-0'}`}>
        {renderContent()}
      </main>

      {/* Floating Chat Button - Modern Gradient Orb */}
      {activeTab !== 'map' && activeTab !== 'admin_dashboard' && (
        <button 
          onClick={() => setIsChatMenuOpen(true)}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-white z-40 group border border-slate-700/60 modern-glow-emerald"
          aria-label="ข้อความและ AI"
        >
          <MessageCircle size={24} className="group-hover:-rotate-6 transition-transform text-slate-100" />
          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full p-1 shadow-md border-2 border-slate-900 animate-pulse">
            <Sparkles size={11} className="text-white" />
          </div>
          {/* Tooltip hint */}
          <span className="absolute right-full mr-3.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-lg border border-slate-800 hidden sm:flex items-center gap-1.5 pointer-events-none">
            <MessageCircle size={11} className="text-emerald-400" />
            ข้อความ & AI
          </span>
        </button>
      )}

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Chat Overview Modal (Friends + AI) */}
      {isChatMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 animate-in slide-in-from-bottom-4 duration-200">
          <ChatView 
            onClose={() => setIsChatMenuOpen(false)} 
            onOpenAiChat={() => { setIsChatMenuOpen(false); setIsAiOpen(true); }} 
          />
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiOpen && <AiChat onClose={() => setIsAiOpen(false)} />}
      
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
