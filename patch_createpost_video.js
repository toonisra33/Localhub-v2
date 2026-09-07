import fs from 'fs';
let content = fs.readFileSync('src/components/modals/CreatePostModal.tsx', 'utf8');

const videoTarget = /const handleVideoUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?videoInputRef\.current\.value = '';\n    \}\n  \};/g;

const newVideo = `const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent base64 video upload due to 1MB Firestore limit in prototype
    showToast('ระบบจำกัดการอัปโหลดวิดีโอในโหมดทดสอบ กรุณาใช้ไฟล์รูปภาพแทน', 'error');
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };`;

content = content.replace(videoTarget, newVideo);
fs.writeFileSync('src/components/modals/CreatePostModal.tsx', content);
