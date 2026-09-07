import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastBanner.tsx', 'utf8');

const targetStr = `  const { openMediaViewer, isLoggedIn, userProfile } = useCommunity();`;
const replaceStr = `  const { openMediaViewer, isLoggedIn, userProfile, jumpToMapLocation } = useCommunity();`;
content = content.replace(targetStr, replaceStr);

const actionTarget = `                  {/* Emergency / Inquiries Contact Phone */}
                  {activeBroadcast.contactNumber && (
                    <a
                      href={\`tel:\${activeBroadcast.contactNumber}\`}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[12px]"
                    >
                      <Phone size={14} />
                      โทร: {activeBroadcast.contactNumber}
                    </a>
                  )}`;
const actionReplace = `                  {/* Emergency / Inquiries Contact Phone */}
                  {activeBroadcast.contactNumber && (
                    <a
                      href={\`tel:\${activeBroadcast.contactNumber}\`}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[12px]"
                    >
                      <Phone size={14} />
                      โทร: {activeBroadcast.contactNumber}
                    </a>
                  )}

                  {/* View on Map Button */}
                  {activeBroadcast.checkIn && (
                    <button
                      onClick={() => {
                        jumpToMapLocation(
                          activeBroadcast.checkIn!.latitude, 
                          activeBroadcast.checkIn!.longitude, 
                          17, 
                          activeBroadcast.checkIn!.placeName
                        );
                        // Optional: minimize broadcast when navigating to map
                        // handleMinimize();
                      }}
                      className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[12px]"
                    >
                      <MapPin size={14} />
                      ดูตำแหน่งบนแผนที่
                    </button>
                  )}`;
content = content.replace(actionTarget, actionReplace);

fs.writeFileSync('src/components/AdminBroadcastBanner.tsx', content);
