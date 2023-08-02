self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('my-cache').then((cache) => {
        try {
          return cache.addAll([
            'https://lab.utgd.net/MarkdownSticky/index.html',
            'https://lab.utgd.net/MarkdownSticky/styles.css',
            'https://lab.utgd.net/MarkdownSticky/app.js',
            'https://lab.utgd.net/MarkdownSticky/icons/icon-192x192.png',
            'https://lab.utgd.net/MarkdownSticky/icons/icon-512x512.png',
            'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/interact.js/1.10.11/interact.min.js'
          ]);
        }catch(e){
          console.log(e);
        }
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  