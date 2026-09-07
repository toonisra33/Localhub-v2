import fs from 'fs';

function patchModal(filePath, setStateFunc, successMsg) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import { compressImage }')) {
    content = content.replace(/import React/, "import { compressImage } from '../../lib/imageUtils';\nimport React");
  }

  // Replace handleFileUpload
  const oldHandleFileUploadRegex = /const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?e\.target\.value = '';\n  \};/g;
  
  const newHandleFileUpload = `const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('ขนาดไฟล์ภาพต้องไม่เกิน 10 MB', 'error');
      return;
    }

    try {
      showToast('กำลังประมวลผลรูปภาพ...', 'info');
      const compressedDataUrl = await compressImage(file);
      ${setStateFunc}(compressedDataUrl);
      ${filePath.includes('AuthModal') ? 'setIsCustomUploaded(true);' : ''}
      showToast('${successMsg}', 'success');
    } catch (error) {
      console.error('Error compressing image:', error);
      showToast('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ', 'error');
    } finally {
      e.target.value = '';
    }
  };`;

  content = content.replace(oldHandleFileUploadRegex, newHandleFileUpload);
  fs.writeFileSync(filePath, content);
  console.log(`Patched ${filePath}`);
}

patchModal('src/components/modals/AuthModal.tsx', 'setSelectedAvatar', '📸 อัปโหลดรูปโปรไฟล์ของคุณเรียบร้อยแล้ว');
patchModal('src/components/modals/EditProfileModal.tsx', 'setAvatar', '📸 อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว');
patchModal('src/components/modals/CreatePostModal.tsx', 'setImage', 'รูปภาพพร้อมแนบไปกับโพสต์แล้ว');
patchModal('src/components/modals/AddProductModal.tsx', 'setImage', 'รูปภาพสินค้าพร้อมใช้งานแล้ว');

