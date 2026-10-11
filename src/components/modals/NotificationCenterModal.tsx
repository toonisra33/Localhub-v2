import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Radio,
  AlertTriangle,
  MessageSquare,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { InAppNotification } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    openPostDetail
  } = useCommunity();

  const { setOpenAdminModal } = useBroadcast();

  if (!isOpen) return null;

  const handleNotificationClick = (item: InAppNotification) => {
    markNotificationRead(item.id);

    if (item.link) {
      if (item.link.startsWith('post:')) {
        const postId = item.link.replace('post:', '');
        openPostDetail(postId);
        onClose();
        return;
      }
      if (item.link.startsWith('broadcast:')) {
        setOpenAdminModal(true);
        onClose();
        return;
      }
    }
  };

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'broadcast':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'market':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">ศูนย์การแจ้งเตือน</h3>
              <p className="text-xs text-slate-500">ข่าวสาร เหตุเตือนภัย และความเคลื่อนไหวในพื้นที่คุณ</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllNotificationsRead}
                  title="อ่านทั้งหมด"
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAllNotifications}
                  title="ล้างทั้งหมด"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-lg text-xs font-medium transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-medium">ยังไม่มีการแจ้งเตือนในขณะนี้</p>
            </div>
          ) : (
            notifications.map((item) => {
              const hasLink = Boolean(item.link);

              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasLink ? 'cursor-pointer hover:border-blue-400 hover:shadow-xs' : ''
                  } ${
                    !item.isRead
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className={`text-sm leading-tight truncate ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>

                        {hasLink && (
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:underline">
                            เปิดดู <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
