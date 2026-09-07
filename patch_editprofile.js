import fs from 'fs';
let content = fs.readFileSync('src/components/modals/EditProfileModal.tsx', 'utf8');

const stateRegex = /const \[phone, setPhone\] = useState\(userProfile.phone \|\| ''\);/;
const stateReplacement = `const [phone, setPhone] = useState(userProfile.phone || '');\n  const [email, setEmail] = useState(userProfile.email || '');`;
content = content.replace(stateRegex, stateReplacement);

const emailInput = `
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

// Insert after phone input
const phoneInputRegex = /(<div>\s*<label className="block text-\[12px\] font-bold text-slate-700 mb-1">เบอร์โทรศัพท์<\/label>\s*<input\s*type="tel"\s*value=\{phone\}\s*onChange=\{e => setPhone\(e.target.value\)\}\s*className="[^"]+"\s*\/>\s*<\/div>)/;

content = content.replace(phoneInputRegex, `$1\n${emailInput}`);

// Submit handler
const submitRegex = /const handleSubmit = \(e: React.FormEvent\) => \{\s*e.preventDefault\(\);\s*updateUserProfile\(\{/;
content = content.replace(submitRegex, `const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    updateUserProfile({\n      email,`);

fs.writeFileSync('src/components/modals/EditProfileModal.tsx', content);
