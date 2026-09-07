import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const oldStates = `  const [title, setTitle] = useState(presets[0].title);
  const [message, setMessage] = useState(presets[0].message);
  const [category, setCategory] = useState<BroadcastCategory>(presets[0].category);
  const [severity, setSeverity] = useState<BroadcastSeverity>(presets[0].severity);
  const [targetArea, setTargetArea] = useState(presets[0].targetArea);
  const [contactNumber, setContactNumber] = useState(presets[0].contactNumber);

  // Media attachments state
  const [selectedMediaType, setSelectedMediaType] = useState<'none' | 'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState<string>(presets[0].mediaUrl || '');
  const [mediaFileName, setMediaFileName] = useState<string>(presets[0].mediaFileName || '');
  const [videoDuration, setVideoDuration] = useState<number>(presets[0].videoDurationSeconds || 0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Link attachment state (Optional)
  const [enableLink, setEnableLink] = useState<boolean>(true);
  const [actionText, setActionText] = useState<string>(presets[0].actionText || '');
  const [actionUrl, setActionUrl] = useState<string>(presets[0].actionUrl || '');`;

const newStates = `  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<BroadcastCategory>('announcement');
  const [severity, setSeverity] = useState<BroadcastSeverity>('info');
  const [targetArea, setTargetArea] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Media attachments state
  const [selectedMediaType, setSelectedMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaFileName, setMediaFileName] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Link attachment state (Optional)
  const [enableLink, setEnableLink] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string>('');
  const [actionUrl, setActionUrl] = useState<string>('');`;

content = content.replace(oldStates, newStates);
fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
