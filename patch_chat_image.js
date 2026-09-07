import fs from 'fs';
let content = fs.readFileSync('src/components/chat/ChatRoomModal.tsx', 'utf8');

if (!content.includes("import { Image as ImageIcon")) {
  content = content.replace("import { X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';", "import { X, Send, Bot, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';");
}
if (!content.includes("import { compressImage }")) {
  content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { compressImage } from '../../lib/imageUtils';");
}

content = content.replace(
  "const handleSend = async (e?: React.FormEvent) => {",
  `const fileInputRef = useRef<HTMLInputElement>(null);\n  const [isUploading, setIsUploading] = useState(false);\n  const { showToast } = useCommunity();\n\n  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {\n    const file = e.target.files?.[0];\n    if (!file || !roomId || !userProfile?.id) return;\n    if (!file.type.startsWith('image/')) {\n      showToast?.('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');\n      return;\n    }\n    try {\n      setIsUploading(true);\n      const compressedUrl = await compressImage(file);\n      await sendMessage(roomId, userProfile.id, '', compressedUrl);\n    } catch (err) {\n      console.error(err);\n      showToast?.('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');\n    } finally {\n      setIsUploading(false);\n      if (fileInputRef.current) fileInputRef.current.value = '';\n    }\n  };\n\n  const handleSend = async (e?: React.FormEvent) => {`
);

// Add rendering for image messages
const oldMessageRender = `{msg.text}`;
const newMessageRender = `{msg.imageUrl && (\n                    <img src={msg.imageUrl} alt="chat" className="rounded-xl max-w-full mb-2 object-cover" />\n                  )}\n                  {msg.text && <div>{msg.text}</div>}`;
content = content.replace(oldMessageRender, newMessageRender);

// Add the file input and button
const oldInputArea = `<input\n            type="text"`;
const newInputArea = `<input \n            type="file" \n            ref={fileInputRef} \n            onChange={handleImageUpload} \n            accept="image/*" \n            className="hidden" \n          />\n          <button \n            type="button" \n            onClick={() => fileInputRef.current?.click()}\n            disabled={isUploading}\n            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-50 shrink-0"\n          >\n            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}\n          </button>\n          <input\n            type="text"`;
content = content.replace(oldInputArea, newInputArea);

fs.writeFileSync('src/components/chat/ChatRoomModal.tsx', content);
