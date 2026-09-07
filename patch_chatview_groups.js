import fs from 'fs';
let content = fs.readFileSync('src/components/chat/ChatView.tsx', 'utf8');

// Add import for subscribeToGroups and initializeGroups
if (!content.includes('subscribeToGroups')) {
  content = content.replace("acceptFriendRequest, rejectFriendRequest } from '../../lib/chat';", "acceptFriendRequest, rejectFriendRequest, subscribeToGroups, initializeGroups } from '../../lib/chat';");
}

// Add state
content = content.replace("const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');", "const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'groups'>('chats');\n  const [groups, setGroups] = useState<ChatRoom[]>([]);");

// Add useEffect to initialize and subscribe to groups
const oldUseEffect = "useEffect(() => {\n    if (!isLoggedIn || !userProfile?.id) return;";
const newUseEffect = `useEffect(() => {
    initializeGroups();
  }, []);\n\n  useEffect(() => {\n    if (!isLoggedIn || !userProfile?.id) return;\n    const unsubGroups = subscribeToGroups(setGroups);`;
content = content.replace(oldUseEffect, newUseEffect);

// Add cleanup for unsubGroups
content = content.replace("return () => {\n      unsubChats();\n      unsubFriends();\n      unsubPending();\n    };", "return () => {\n      unsubChats();\n      unsubFriends();\n      unsubPending();\n      if (unsubGroups) unsubGroups();\n    };");

// Add Groups Tab button
const friendsTabMatch = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('friends'\)\}[\s\S]*?<\/button>/;
const groupsTabBtn = `
          <button
            onClick={() => setActiveTab('groups')}
            className={\`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 \${
              activeTab === 'groups' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }\`}
          >
            <Users size={16} />
            กลุ่ม
          </button>`;
content = content.replace(friendsTabMatch, (match) => match + groupsTabBtn);

// Add Groups content
const chatsContentMatch = /\{activeTab === 'chats' && \([\s\S]*?\}\)/;
const groupsContent = `
        {activeTab === 'groups' && (
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">ไม่พบกลุ่มสนทนาสาธารณะ</div>
            ) : (
              groups.map(group => (
                <div 
                  key={group.id}
                  onClick={() => {
                    setSelectedChatRoom(group.id);
                    setSelectedChatUser({
                      id: 'group',
                      name: group.groupName || 'กลุ่มสาธารณะ',
                      avatar: group.groupAvatar || 'https://via.placeholder.com/150'
                    });
                  }}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <img src={group.groupAvatar || 'https://via.placeholder.com/150'} alt={group.groupName} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[15px] font-extrabold text-slate-900 truncate">{group.groupName}</h4>
                    </div>
                    <p className="text-[13px] text-slate-500 truncate">{group.lastMessage || 'เริ่มพูดคุยเลย!'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
`;
// We'll append it before friends tab
content = content.replace("{activeTab === 'friends' && (", groupsContent + "\n        {activeTab === 'friends' && (");

fs.writeFileSync('src/components/chat/ChatView.tsx', content);
