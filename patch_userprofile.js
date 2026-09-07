import fs from 'fs';
let content = fs.readFileSync('src/components/UserProfile.tsx', 'utf8');

// I'll add an email display block where phone is displayed
const target = `{userProfile.phone && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{userProfile.phone}</span>
                </div>
              )}`;

const newField = `{userProfile.email && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 shadow-xs col-span-2">
                  <span className="text-slate-400 font-bold shrink-0">@</span>
                  <span className="truncate">{userProfile.email}</span>
                </div>
              )}\n              `;

// Also, let's make sure email is displayed! Wait, userProfile.email is optional.
content = content.replace(target, newField + target);

fs.writeFileSync('src/components/UserProfile.tsx', content);
