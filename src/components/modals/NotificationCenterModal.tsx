import React from 'react';
import { X, Bell, CheckCheck, Trash2, Radio, AlertTriangle, MessageSquare, ShoppingBag } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface NotificationCenterModalProps {
  onClose: () => void;
}

export function NotificationCenterModal({ onClose }: NotificationCenterModalProps) {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications, 
    showToast 
  } = useCommunity();

  // Automatically mark all notifications as read when the user enters/views the notification center
  React.useEffect(() => {
    if (unreadNotificationsCount > 0) {
      markAllNotificationsAsRead();
    }
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    showToast('อ่านการแจ้งเตือนทั้งหมดแล้ว', 'info');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'broadcast': return <Radio size={16} className="text-red-500" />;
      case 'alert': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'market': return <ShoppingBag size={16} className="text-emerald-500" />;
      default: return <MessageSquare size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm relative">
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">การแจ้งเตือน</h2>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.2 bg-rose-100 text-rose-700 text-[10.5px] font-extrabold rounded-full">
                    {unreadNotificationsCount} ใหม่
                  </span>
                )}
              </div>
              <p className="text-[11.5px] font-medium text-slate-500">ข่าวสาร เหตุการณ์ และกิจกรรมในชุมชน</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded-xl transition-colors flex items-center gap-1 border border-emerald-200/60"
                  title="อ่านทั้งหมด"
                >
                  <CheckCheck size={13} />
                  <span>อ่านทั้งหมด</span>
                </button>

                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] font-extrabold text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                  title="ล้างทั้งหมด"
                >
                  <Trash2 size={13} />
                  <span>ล้าง</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0 ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="text-center py-14 text-slate-400 text-[13px] font-medium">
              ไม่มีการแจ้งเตือนในขณะนี้
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.read
                    ? 'bg-white/80 border-slate-200/80 text-slate-600'
                    : 'bg-white border-emerald-200 ring-2 ring-emerald-500/15 shadow-sm text-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-extrabold text-[13.5px] leading-tight truncate">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-[12.5px] text-slate-600 leading-relaxed font-normal">
                      {item.message}
                    </p>

                    <span className="text-[11px] font-semibold text-slate-400 mt-2 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
