import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

// Ensure createNotificationInFirestore is imported
if (!content.includes('createNotificationInFirestore')) {
  content = content.replace(/addCommentToFirestore,/, 'addCommentToFirestore,\\n  createNotificationInFirestore,');
}

// Rewrite toggleLikePost
const toggleLikePostRegex = /const toggleLikePost = async \\(postId: string\\) => \\{\\s*setPosts\\(prev => prev\\.map\\(p => \\{\\s*if \\(p\\.id !== postId\\) return p;\\s*const isLiked = p\\.isLikedByMe;\\s*return \\{\\s*\\.\\.\\.p,\\s*likes: isLiked \\? p\\.likes - 1 : p\\.likes \\+ 1,\\s*isLikedByMe: !isLiked\\s*\\};\\s*\\}\\)\\);\\s*\\};/;

const newToggleLikePost = `const toggleLikePost = async (postId: string) => {
    if (!isLoggedIn || !userProfile) return;
    
    // Find the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const isLiked = post.isLikedByMe || (post.likedBy && post.likedBy.includes(userProfile.id));
    
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
        isLikedByMe: !isLiked,
        likedBy: isLiked 
          ? (p.likedBy || []).filter(id => id !== userProfile.id)
          : [...(p.likedBy || []), userProfile.id]
      };
    }));
    
    // Call firestore
    try {
      await togglePostLikeInFirestore(postId, userProfile.id, isLiked);
      
      // If we are liking (not unliking) and it's not our own post, send notification
      if (!isLiked && post.authorUid && post.authorUid !== userProfile.id) {
        await createNotificationInFirestore(
          post.authorUid,
          userProfile.id,
          \`\${userProfile.name} ถูกใจโพสต์ของคุณ\`,
          post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
          'social'
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };`;

content = content.replace(toggleLikePostRegex, newToggleLikePost);


// Rewrite addComment
const addCommentRegex = /const addComment = async \\(postId: string, text: string\\) => \\{\\s*setPosts\\(prev => prev\\.map\\(p => \\{\\s*if \\(p\\.id !== postId\\) return p;\\s*return \\{ \\.\\.\\.p, comments: p\\.comments \\+ 1 \\};\\s*\\}\\)\\);\\s*\\};/;

const newAddComment = `const addComment = async (postId: string, text: string) => {
    if (!isLoggedIn || !userProfile) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const commentId = \`comment_\${Date.now()}\`;
    const newComment = {
      id: commentId,
      authorUid: userProfile.id,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
      },
      content: text,
      time: 'เมื่อสักครู่'
    };
    
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: p.comments + 1 };
    }));
    
    // Call firestore
    try {
      await addCommentToFirestore(postId, newComment as any);
      
      // Notify post author
      if (post.authorUid && post.authorUid !== userProfile.id) {
        await createNotificationInFirestore(
          post.authorUid,
          userProfile.id,
          \`\${userProfile.name} แสดงความคิดเห็นในโพสต์ของคุณ\`,
          text.length > 50 ? text.substring(0, 50) + '...' : text,
          'social'
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };`;

content = content.replace(addCommentRegex, newAddComment);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
