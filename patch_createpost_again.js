import fs from 'fs';
let content = fs.readFileSync('src/components/modals/CreatePostModal.tsx', 'utf8');

const targetFunctionRegex = /const handleFileUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?const handleVideoUpload =/g;

const newFunction = `const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      showToast('สามารถอัปโหลดได้สูงสุด 10 รูป', 'error');
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots) as File[];
    setIsAttaching(true);

    const newImages: string[] = [];

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        showToast(\`ไฟล์ \${file.name} มีขนาดใหญ่เกิน 8 MB\`, 'error');
        continue;
      }

      try {
        const compressedDataUrl = await compressImage(file);
        newImages.push(compressedDataUrl);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      showToast(\`📸 เพิ่มรูปภาพ \${newImages.length} รูปเรียบร้อยแล้ว\`, 'success');
    }
    
    setIsAttaching(false);
    e.target.value = '';
  };

  const handleVideoUpload =`;

content = content.replace(targetFunctionRegex, newFunction);
fs.writeFileSync('src/components/modals/CreatePostModal.tsx', content);
