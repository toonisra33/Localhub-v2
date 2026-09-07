import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const targetStr = `  return (
    <div className="fixed inset-0 bg-gray-950/75 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">`;

const replaceStr = `  return (
    <>
    {showCheckInPicker && (
      <CheckInPickerModal
        initialCheckIn={checkIn}
        userLocation={location}
        onSelectCheckIn={(newCheckIn) => {
          setCheckIn(newCheckIn);
        }}
        onClose={() => setShowCheckInPicker(false)}
      />
    )}
    <div className="fixed inset-0 bg-gray-950/75 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">`;

content = content.replace(targetStr, replaceStr);

// Also need to close the fragment at the end
const endTarget = `    </div>
  );
}`;
const endReplace = `    </div>
    </>
  );
}`;
content = content.replace(endTarget, endReplace);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
