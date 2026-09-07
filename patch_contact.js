import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const startSubmit = content.indexOf('const submitContactRequest =');
const endSubmit = content.indexOf('const updateContactRequestStatus =');

if (startSubmit !== -1 && endSubmit !== -1) {
  const newSubmit = `
  const submitContactRequest = async (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => {
    const id = \`req_\${Date.now()}\`;
    const newRequest: AdminContactRequest = {
      ...data,
      id,
      createdAt: Date.now(),
      timeStr: 'เมื่อสักครู่',
      status: 'pending'
    };
    
    // Optimistic UI update
    setContactRequests(prev => [newRequest, ...prev]);
    
    try {
      await saveEntityToFirestore('contact_requests', id, newRequest);
      
      const newNotification: AppNotification = {
        id: \`n_contact_\${Date.now()}\`,
        title: '📨 ส่งเรื่องถึงแอดมินเรียบร้อยแล้ว',
        message: \`แอดมินได้รับเรื่อง "\${data.title}" แล้ว อยู่ระหว่างการตรวจสอบข้อมูลเพื่อดำเนินการ\`,
        time: 'เมื่อสักครู่',
        read: false,
        type: 'broadcast'
      };
      setNotifications(prev => [newNotification, ...prev]);
      showToast('📨 ส่งข้อความถึงแอดมินเรียบร้อยแล้ว! แอดมินจะตรวจสอบและดำเนินการให้โดยเร็ว', 'success');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการส่งเรื่อง', 'error');
    }
  };

  `;
  content = content.slice(0, startSubmit) + newSubmit + content.slice(endSubmit);
}

const startUpdate = content.indexOf('const updateContactRequestStatus =');
const endUpdate = content.indexOf('const addProduct =');

if (startUpdate !== -1 && endUpdate !== -1) {
  const newUpdate = `
  const updateContactRequestStatus = async (id: string, status: ContactRequestStatus, adminNote?: string) => {
    setContactRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        status,
        adminNote: adminNote !== undefined ? adminNote : req.adminNote
      };
    }));
    
    try {
      await saveEntityToFirestore('contact_requests', id, { status, adminNote, updatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  `;
  content = content.slice(0, startUpdate) + newUpdate + content.slice(endUpdate);
}

fs.writeFileSync('src/context/CommunityContext.tsx', content);
