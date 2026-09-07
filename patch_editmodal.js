import fs from 'fs';
let content = fs.readFileSync('src/components/modals/EditProfileModal.tsx', 'utf8');

const oldSubmit = `  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({`;

const newSubmit = `  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({`;

content = content.replace(oldSubmit, newSubmit);

const oldSubmitEnd = `    });
    showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    onClose();
  };`;

const newSubmitEnd = `    });
      // The toast is already handled inside updateUserProfile
      onClose();
    } catch (err) {
      showToast('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง', 'error');
    } finally {
      setIsSaving(false);
    }
  };`;

content = content.replace(oldSubmitEnd, newSubmitEnd);

const oldSaveBtn = `<button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check size={16} />
              บันทึกข้อมูล
            </button>`;

const newSaveBtn = `<button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-70"
            >
              <Check size={16} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>`;

content = content.replace(oldSaveBtn, newSaveBtn);

fs.writeFileSync('src/components/modals/EditProfileModal.tsx', content);
