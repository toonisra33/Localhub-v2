const fs = require('fs');
const path = 'src/components/modals/PublicProfileModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    if (friendStatus.status === 'none') {
      await sendFriendRequest(userProfile.id, userId);
      showToast('ส่งคำขอเป็นเพื่อนแล้ว', 'success');
    } else if (friendStatus.status === 'pending' && friendStatus.requesterId !== userProfile.id) {
      await acceptFriendRequest(userProfile.id, userId);
      showToast('คุณเป็นเพื่อนกันแล้ว', 'success');
    } else if (friendStatus.status === 'pending' && friendStatus.requesterId === userProfile.id) {
      await rejectFriendRequest(userProfile.id, userId);
      showToast('ยกเลิกคำขอเป็นเพื่อนแล้ว', 'info');
    } else if (friendStatus.status === 'accepted') {
      if (confirm('คุณต้องการยกเลิกการเป็นเพื่อนใช่หรือไม่?')) {
        await rejectFriendRequest(userProfile.id, userId);
        showToast('เลิกเป็นเพื่อนแล้ว', 'info');
      }
    }`;

const replacement = `    try {
      if (friendStatus.status === 'none') {
        await sendFriendRequest(userProfile.id, userId);
        showToast('ส่งคำขอเป็นเพื่อนแล้ว', 'success');
      } else if (friendStatus.status === 'pending' && friendStatus.requesterId !== userProfile.id) {
        await acceptFriendRequest(userProfile.id, userId);
        showToast('คุณเป็นเพื่อนกันแล้ว', 'success');
      } else if (friendStatus.status === 'pending' && friendStatus.requesterId === userProfile.id) {
        await rejectFriendRequest(userProfile.id, userId);
        showToast('ยกเลิกคำขอเป็นเพื่อนแล้ว', 'info');
      } else if (friendStatus.status === 'accepted') {
        if (confirm('คุณต้องการยกเลิกการเป็นเพื่อนใช่หรือไม่?')) {
          await rejectFriendRequest(userProfile.id, userId);
          showToast('เลิกเป็นเพื่อนแล้ว', 'info');
        }
      }
    } catch (error) {
      console.error('Friend action error:', error);
      showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    }`;

content = content.replace(target, replacement);

// Also add useBackButton
if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useBackButton } from '../../hooks/useBackButton';");
}

if (!content.includes('useBackButton(isOpen')) {
  content = content.replace("const handleFriendAction = async () => {", "useBackButton(isOpen, onClose);\n\n  const handleFriendAction = async () => {");
}

fs.writeFileSync(path, content);
console.log('Done patching PublicProfileModal');
