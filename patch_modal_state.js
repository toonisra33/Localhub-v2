import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const stateTarget = `  const [enableLink, setEnableLink] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string>('');
  const [actionUrl, setActionUrl] = useState<string>('');`;
const stateReplacement = `  const [enableLink, setEnableLink] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string>('');
  const [actionUrl, setActionUrl] = useState<string>('');

  const [checkIn, setCheckIn] = useState<CheckInLocation | null>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState<boolean>(false);`;

content = content.replace(stateTarget, stateReplacement);

const submitTarget = `    await sendBroadcast({
      title,
      message,
      category,
      severity,
      targetArea,
      contactNumber,
      mediaType: selectedMediaType !== 'none' ? selectedMediaType : undefined,
      mediaUrl: selectedMediaType !== 'none' ? mediaUrl : undefined,
      mediaFileName: selectedMediaType !== 'none' ? mediaFileName : undefined,
      videoDurationSeconds: selectedMediaType === 'video' ? videoDuration : undefined,
      actionText: enableLink ? actionText : undefined,
      actionUrl: enableLink ? actionUrl : undefined,
    });`;
const submitReplacement = `    await sendBroadcast({
      title,
      message,
      category,
      severity,
      targetArea,
      contactNumber,
      mediaType: selectedMediaType !== 'none' ? selectedMediaType : undefined,
      mediaUrl: selectedMediaType !== 'none' ? mediaUrl : undefined,
      mediaFileName: selectedMediaType !== 'none' ? mediaFileName : undefined,
      videoDurationSeconds: selectedMediaType === 'video' ? videoDuration : undefined,
      actionText: enableLink ? actionText : undefined,
      actionUrl: enableLink ? actionUrl : undefined,
      checkIn: checkIn ? checkIn : undefined,
    });`;

content = content.replace(submitTarget, submitReplacement);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
