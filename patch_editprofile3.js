import fs from 'fs';
let content = fs.readFileSync('src/components/modals/EditProfileModal.tsx', 'utf8');

const target = `<label className="block text-[12px] font-bold text-slate-700 mb-1 flex items-center gap-1">\n                  <Briefcase`;

const newField = `<div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <span className="text-slate-400">@</span> อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>\n              `;

content = content.replace(target, newField + target);
fs.writeFileSync('src/components/modals/EditProfileModal.tsx', content);
