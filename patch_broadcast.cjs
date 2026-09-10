const fs = require('fs');
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

// Replace the handleSend logic to be more permissive
const newHandleSend = `  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only title and message are strictly required
    if (!title.trim()) { showToast('กรุณาระบุหัวข้อบรอดแคสต์', 'error'); return; }
    if (!message.trim()) { showToast('กรุณาระบุรายละเอียด', 'error'); return; }

    // If link is enabled but empty, just ignore it instead of blocking
    const finalActionUrl = (enableLink && actionUrl.trim()) ? actionUrl.trim() : undefined;
    const finalActionText = (enableLink && actionUrl.trim()) ? (actionText.trim() || 'ไปยังลิงก์ข้อมูล') : undefined;

    if (selectedMediaType === 'video' && videoDuration > 600) {
      setMediaError('ความยาววิดีโอต้องไม่เกิน 10 นาที');
      return;
    }

    try {
      await sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        category,
        severity,
        targetArea: targetArea.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
        mediaType: selectedMediaType === 'none' ? undefined : selectedMediaType,
        mediaUrl: selectedMediaType !== 'none' && mediaUrl ? mediaUrl : undefined,
        mediaFileName: selectedMediaType !== 'none' && mediaFileName ? mediaFileName : undefined,
        videoDurationSeconds: selectedMediaType === 'video' ? videoDuration : undefined,
        actionText: finalActionText,
        actionUrl: finalActionUrl,
      });

      setStatusFeedback('ส่งบรอดแคสสำเร็จ! ข้อความจะล็อกบนหน้าจอด้านบนสุดทุกเครื่อง 15 นาที');
      setTimeout(() => {
        setStatusFeedback(null);
        setOpenAdminModal(false);
      }, 1500);
    } catch (error: any) {
      showToast(\`เกิดข้อผิดพลาด: \${error.message || 'ไม่สามารถส่งบรอดแคสต์ได้'}\`, 'error');
    }
  };`;

content = content.replace(/const handleSend = async \(e: React\.FormEvent\) => \{[\s\S]*?\} catch \(error: any\) \{[\s\S]*?\}\s*\};/, newHandleSend);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
console.log('Patched AdminBroadcastModal');
