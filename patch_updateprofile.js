import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const oldUpdate = `  const updateUserProfile = async (data: Partial<UserProfileData>): Promise<void> => {
    setUserProfile(prev => ({ ...prev, ...data }));
    
    if (auth.currentUser?.uid) {
      try {
        await syncUserProfileToFirestore(auth.currentUser.uid, data);
        showToast('💾 บันทึกและซิงค์ข้อมูลส่วนตัวลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
        return;
      } catch (e) {
        console.error('Sync profile error:', e);
      }
    }
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };`;

const newUpdate = `  const updateUserProfile = async (data: Partial<UserProfileData>): Promise<void> => {
    setUserProfile(prev => ({ ...prev, ...data }));
    
    if (auth.currentUser?.uid) {
      try {
        await syncUserProfileToFirestore(auth.currentUser.uid, data);
        showToast('💾 บันทึกและซิงค์ข้อมูลส่วนตัวลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
        return;
      } catch (e) {
        console.error('Sync profile error:', e);
        showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล (ขนาดอาจใหญ่เกินไป)', 'error');
        return;
      }
    }
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/context/CommunityContext.tsx', content);
