const fs = require('fs');
const file = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace addAlert to save to Firestore
content = content.replace(
  /const addAlert = \(alert: Omit<Alert, 'id' \| 'time' \| 'confirmations' \| 'rejections' \| 'status'>\) => \{\n    const newAlert: Alert = \{\n      \.\.\.alert,\n      id: \`alert_\$\{Date\.now\(\)\}\`,\n      time: 'เมื่อสักครู่',\n      confirmations: 0,\n      rejections: 0,\n      status: 'unconfirmed'\n    \};\n    setAlerts\(prev => \[newAlert, \.\.\.prev\]\);\n    showToast\('แจ้งเตือนเหตุการณ์เรียบร้อยแล้ว แอดมินจะทำการตรวจสอบต่อไป', 'success'\);\n  \};/,
  `const addAlert = async (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนแจ้งเหตุ', 'error');
      openAuthModal();
      return;
    }

    try {
      const alertData = {
        ...alert,
        time: 'เมื่อสักครู่',
        confirmations: 0,
        rejections: 0,
        status: 'unconfirmed',
        createdAt: Date.now(),
        reportedBy: currentUser.uid,
      };
      
      const alertsRef = collection(db, 'alerts');
      const docRef = await addDoc(alertsRef, alertData);
      
      const newAlert = { id: docRef.id, ...alertData } as Alert;
      setAlerts(prev => [newAlert, ...prev]);
      
      showToast('แจ้งเตือนเหตุการณ์เรียบร้อยแล้ว แอดมินจะทำการตรวจสอบต่อไป', 'success');
    } catch (error) {
      console.error('Error adding alert:', error);
      showToast('เกิดข้อผิดพลาดในการแจ้งเหตุ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };`
);

content = content.replace(
  /addAlert: \(alert: Omit<Alert, 'id' \| 'time' \| 'confirmations' \| 'rejections' \| 'status'>\) => void;/,
  "addAlert: (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => Promise<void>;"
);

// We should also load alerts from Firestore
// Let's look for useEffect where we load data
fs.writeFileSync(file, content);
