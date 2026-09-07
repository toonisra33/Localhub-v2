import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const missingFunctions = `
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  const openMediaViewer = (url: string, type: 'image' | 'video', title?: string, subtitle?: string) => {
    setActiveMedia({ url, type, title, subtitle });
  };
  const closeMediaViewer = () => setActiveMedia(null);

  const openLocationPermissionModal = () => setIsLocationPermissionModalOpen(true);
  const closeLocationPermissionModal = () => setIsLocationPermissionModalOpen(false);
  
  const requestRealLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsLocatingGps(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }));
            setLocationPermissionStatus('granted');
            setIsLocatingGps(false);
            closeLocationPermissionModal();
            resolve(true);
          },
          (error) => {
            console.error('GPS Error:', error);
            setLocationPermissionStatus('denied');
            setIsLocatingGps(false);
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationPermissionStatus('denied');
        setIsLocatingGps(false);
        resolve(false);
      }
    });
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    const newAlert: Alert = {
      ...alert,
      id: \`alert_\${Date.now()}\`,
      time: 'เมื่อสักครู่',
      confirmations: 0,
      rejections: 0,
      status: 'pending'
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('แจ้งเตือนเหตุการณ์เรียบร้อยแล้ว แอดมินจะทำการตรวจสอบต่อไป', 'success');
  };

  const voteAlert = (alertId: string, voteType: 'up' | 'down') => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      const isUp = voteType === 'up';
      return {
        ...a,
        confirmations: isUp ? a.confirmations + 1 : a.confirmations,
        rejections: !isUp ? a.rejections + 1 : a.rejections,
        userVoted: voteType
      };
    }));
  };

  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'authorAvatar'>) => {
    const newPost: Post = {
      ...postData,
      id: \`post_\${Date.now()}\`,
      createdAt: Date.now(),
      likes: 0,
      comments: 0
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.isLikedByMe;
      return {
        ...p,
        likes: isLiked ? p.likes - 1 : p.likes + 1,
        isLikedByMe: !isLiked
      };
    }));
  };

  const addComment = async (postId: string, text: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: p.comments + 1 };
    }));
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const deleteContactRequest = async (id: string) => {
    setContactRequests(prev => prev.filter(req => req.id !== id));
  };
`;

const insertPoint = content.indexOf('const submitContactRequest =');
if (insertPoint !== -1) {
  content = content.slice(0, insertPoint) + missingFunctions + '\\n' + content.slice(insertPoint);
  fs.writeFileSync('src/context/CommunityContext.tsx', content);
  console.log("Functions injected!");
} else {
  console.log("Could not find insert point.");
}
