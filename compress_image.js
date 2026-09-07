import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const compressionHelper = `
  // Helper to compress image before converting to base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px to keep base64 under 1MB
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };
`;

content = content.replace(
  "  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {",
  compressionHelper + "\n  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {"
);

content = content.replace(
  "    } else if (isImage) {\n      const reader = new FileReader();\n      reader.onload = (loadEv) => {\n        setSelectedMediaType('image');\n        setMediaUrl(loadEv.target?.result as string);\n        setMediaFileName(file.name);\n        setVideoDuration(0);\n      };\n      reader.readAsDataURL(file);\n    }",
  "    } else if (isImage) {\n      try {\n        const compressedBase64 = await compressImage(file);\n        setSelectedMediaType('image');\n        setMediaUrl(compressedBase64);\n        setMediaFileName(file.name);\n        setVideoDuration(0);\n      } catch (err) {\n        setMediaError('ไม่สามารถประมวลผลรูปภาพได้');\n      }\n    }"
);

// We should also restrict Video size or block base64 video. 
// A 10-minute limit is way too big for base64. Let's just block video upload for now and ask them to use image.
content = content.replace(
  "        const reader = new FileReader();\n        reader.onload = (loadEv) => {\n          setSelectedMediaType('video');\n          setMediaUrl(loadEv.target?.result as string);\n          setMediaFileName(file.name);\n          setVideoDuration(duration);\n        };\n        reader.readAsDataURL(file);",
  "        // For prototype, we cannot save large videos to Firestore directly.\n        setMediaError('ระบบจำกัดการอัปโหลดวิดีโอในโหมดทดสอบ กรุณาใช้ไฟล์รูปภาพแทน');\n        return;"
);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
