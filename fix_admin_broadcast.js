import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

content = content.replace(
  "const handleSend = (e: React.FormEvent) => {",
  "const handleSend = async (e: React.FormEvent) => {"
);

content = content.replace(
  "    sendBroadcast({",
  "    try {\n      await sendBroadcast({"
);

content = content.replace(
  "    setStatusFeedback('ส่งบรอดแคสสำเร็จ! ข้อความจะล็อกบนหน้าจอด้านบนสุดทุกเครื่อง 15 นาที');\n    setTimeout(() => {\n      setStatusFeedback(null);\n      setOpenAdminModal(false);\n    }, 1500);\n  };",
  "      setStatusFeedback('ส่งบรอดแคสสำเร็จ! ข้อความจะล็อกบนหน้าจอด้านบนสุดทุกเครื่อง 15 นาที');\n      setTimeout(() => {\n        setStatusFeedback(null);\n        setOpenAdminModal(false);\n      }, 1500);\n    } catch (error) {\n      showToast('เกิดข้อผิดพลาด ไม่สามารถส่งบรอดแคสต์ได้ (อาจไม่มีสิทธิ์หรือระบบขัดข้อง)', 'error');\n    }\n  };"
);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
