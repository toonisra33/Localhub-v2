const fs = require('fs');

function safeFilter(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([regex, replace]) => {
    content = content.replace(regex, replace);
  });
  fs.writeFileSync(file, content);
}

// UserProfile.tsx
safeFilter('src/components/UserProfile.tsx', [
  [/posts\.filter/g, '(posts || []).filter'],
  [/products\.filter/g, '(products || []).filter'],
  [/alerts\.filter/g, '(alerts || []).filter']
]);

// LocalMarket.tsx
safeFilter('src/components/LocalMarket.tsx', [
  [/products\.filter/g, '(products || []).filter']
]);

// HomeFeed.tsx
safeFilter('src/components/HomeFeed.tsx', [
  [/alerts\.filter/g, '(alerts || []).filter']
]);

// CommunityFeed.tsx
safeFilter('src/components/CommunityFeed.tsx', [
  [/displayPosts\.filter/g, '(displayPosts || []).filter']
]);

// GlobalSearch.tsx
safeFilter('src/components/GlobalSearch.tsx', [
  [/posts\.filter/g, '(posts || []).filter'],
  [/marketProducts\.filter/g, '(marketProducts || []).filter']
]);

// AdminDashboard.tsx
safeFilter('src/components/AdminDashboard.tsx', [
  [/verificationRequests\.filter/g, '(verificationRequests || []).filter']
]);

// AroundMeMap.tsx
safeFilter('src/components/AroundMeMap.tsx', [
  [/posts\s*\n\s*\.filter/g, '(posts || []).filter'],
  [/allMapPoints\.filter/g, '(allMapPoints || []).filter']
]);

console.log('patched');
