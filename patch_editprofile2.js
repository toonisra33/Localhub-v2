import fs from 'fs';
let content = fs.readFileSync('src/components/modals/EditProfileModal.tsx', 'utf8');

const stateRegex = /const \[phone, setPhone\] = useState\(userProfile.phone \|\| ''\);/;
if (!content.includes('const [email, setEmail]')) {
  const stateReplacement = `const [phone, setPhone] = useState(userProfile.phone || '');\n  const [email, setEmail] = useState(userProfile.email || '');`;
  content = content.replace(stateRegex, stateReplacement);
}

const emailInput = `
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
`;

// It is currently a grid-cols-2. If we add a 3rd item, it might overflow to next line gracefully, or we change grid-cols-2 to grid-cols-1 sm:grid-cols-2 and have it wrap, which it probably already does.
// Let's replace the closing div of the phone block with the email field.

const phoneBlockEndRegex = /(<label className="block text-\[12px\] font-bold text-slate-700 mb-1 flex items-center gap-1">[\s\S]*?วันเกิด<\/label>)/;
content = content.replace(phoneBlockEndRegex, `<div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
              $1`);

// Change grid-cols-2 to handle 3 elements, wait, it might be better to just put it in a new grid.
content = content.replace(/<div className="grid grid-cols-2 gap-3">/, '<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">');

const submitRegex = /(const handleSubmit = \(e: React.FormEvent\) => \{\s*e.preventDefault\(\);\s*updateUserProfile\(\{)/;
content = content.replace(submitRegex, `$1\n      email,`);

fs.writeFileSync('src/components/modals/EditProfileModal.tsx', content);
