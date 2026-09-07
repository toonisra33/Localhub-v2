import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const markNotificationReadRegex = /const markNotificationRead = \\(id: string\\) => \\{\\s*setNotifications\\(prev => prev\\.map\\(n => n\\.id === id \\? \\{ \\.\\.\\.n, read: true \\} : n\\)\\);\\s*\\};/;

const newMarkNotificationRead = `const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (e) {
      console.error('Error marking notification as read', e);
    }
  };`;

content = content.replace(markNotificationReadRegex, newMarkNotificationRead);

const markAllNotificationsAsReadRegex = /const markAllNotificationsAsRead = \\(\\) => \\{\\s*setNotifications\\(prev => prev\\.map\\(n => \\(\\{ \\.\\.\\.n, read: true \\}\\)\\)\\);\\s*\\};/;

const newMarkAllNotificationsAsRead = `const markAllNotificationsAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Process in batches if there are many, but a simple loop is ok for now since it's limited to recent
    try {
      await Promise.all(unread.map(n => {
        const notifRef = doc(db, 'notifications', n.id);
        return updateDoc(notifRef, { read: true });
      }));
    } catch (e) {
      console.error('Error marking all notifications as read', e);
    }
  };`;

content = content.replace(markAllNotificationsAsReadRegex, newMarkAllNotificationsAsRead);

const clearAllNotificationsRegex = /const clearAllNotifications = \\(\\) => \\{\\s*setNotifications\\(\\[\\]\\);\\s*showToast\\('ล้างการแจ้งเตือนทั้งหมดแล้ว', 'info'\\);\\s*\\};/;

const newClearAllNotifications = `const clearAllNotifications = async () => {
    const notifs = [...notifications];
    setNotifications([]);
    showToast('ล้างการแจ้งเตือนทั้งหมดแล้ว', 'info');
    
    try {
      await Promise.all(notifs.map(n => {
        const notifRef = doc(db, 'notifications', n.id);
        return deleteDoc(notifRef);
      }));
    } catch (e) {
      console.error('Error clearing notifications', e);
    }
  };`;

content = content.replace(clearAllNotificationsRegex, newClearAllNotifications);

// Make sure updateDoc and deleteDoc are imported if needed
if (!content.includes('updateDoc,') && !content.includes('updateDoc ')) {
  content = content.replace(/import \{ \\n  doc, /, "import { \\n  doc, \\n  updateDoc, deleteDoc, ");
}

fs.writeFileSync('src/context/CommunityContext.tsx', content);
