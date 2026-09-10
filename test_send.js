const targetArea = '';
const contactNumber = '';
const title = 'Test title';
const message = 'Test message';
const enableLink = false;
const actionUrl = '';
const selectedMediaType = 'none';

if (!title.trim()) { console.log('Error: title'); process.exit(1); }
if (!message.trim()) { console.log('Error: message'); process.exit(1); }
if (enableLink && !actionUrl.trim()) { console.log('Error: actionUrl'); process.exit(1); }

try {
  const data = {
    title: title.trim(),
    message: message.trim(),
    targetArea: targetArea.trim() || undefined,
    contactNumber: contactNumber.trim() || undefined,
    mediaType: selectedMediaType === 'none' ? undefined : selectedMediaType,
  };
  console.log("Success", data);
} catch (e) {
  console.log("Crash", e);
}
