import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const targetUI = `              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">
                  เบอร์โทรติดต่อสอบถาม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="เช่น 089-xxx-xxxx หรือ 199"
                  className="w-full bg-white border border-gray-300 rounded-2xl px-3.5 py-2 text-[13px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>`;

const replacementUI = `              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">
                  เบอร์โทรติดต่อสอบถาม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="เช่น 089-xxx-xxxx หรือ 199"
                  className="w-full bg-white border border-gray-300 rounded-2xl px-3.5 py-2 text-[13px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Check-in Location Area */}
            <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-emerald-500" />
                    ปักหมุดสถานที่บนแผนที่
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">ระบุตำแหน่งสถานที่เกิดเหตุหรือสถานที่แจ้งข่าว</p>
                </div>
                {!checkIn && (
                  <button
                    type="button"
                    onClick={() => setShowCheckInPicker(true)}
                    className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Compass size={12} />
                    <span>ค้นหาและปักหมุด</span>
                  </button>
                )}
              </div>

              {checkIn ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-emerald-900 truncate">
                      {checkIn.placeName}
                    </div>
                    {checkIn.address && (
                      <div className="text-[11px] text-emerald-700 mt-0.5 truncate max-w-[200px]">
                        {checkIn.address}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowCheckInPicker(true)}
                        className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="แก้ไขหรือย้ายหมุด"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckIn(null)}
                        className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ยกเลิกเช็คอิน"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCheckInPicker(true)}
                  className="w-full p-2.5 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between text-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 flex items-center justify-center transition-colors">
                      <MapPin size={14} />
                    </div>
                    <div className="text-[12.5px] font-bold text-slate-700 group-hover:text-emerald-900">
                      📍 ปักหมุดเช็คอินสถานที่
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-600 bg-slate-100 group-hover:bg-emerald-100 px-2.5 py-1 rounded-lg">
                    เลือกตำแหน่ง
                  </span>
                </button>
              )}
            </div>`;

content = content.replace(targetUI, replacementUI);

// add the checkIn picker modal at the bottom just before the closing tag of AdminBroadcastModal
const targetFooter = `  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">`;
const replaceFooter = `  return (
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">`;

content = content.replace(targetFooter, replaceFooter);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
