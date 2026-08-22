// Firebase Cloud Messaging background handler.
//
// Service workers are served as static files, not processed by Next.js, so
// this can't read process.env — these values are hardcoded instead. That's
// fine: they're the same public client identifiers already shipping in the
// main JS bundle (see src/lib/firebase.ts), not secrets.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDZB3EKGbesr9H6iMcr_qQT7VMScyuJuho',
  authDomain: 'techziminteractive.firebaseapp.com',
  projectId: 'techziminteractive',
  storageBucket: 'techziminteractive.firebasestorage.app',
  messagingSenderId: '21573345594',
  appId: '1:21573345594:web:629e505766c0439430b003',
});

const messaging = firebase.messaging();

// Fires when a push arrives while no tab has focus — the only case FCM
// doesn't display a notification automatically on its own.
messaging.onBackgroundMessage(payload => {
  const { title, body, url } = payload.data ?? {};
  self.registration.showNotification(title || 'Techzim Startups', {
    body: body || '',
    icon: '/icon.png',
    data: { url: url || '/' },
  });
});

// Clicking the OS notification should focus an existing tab if there is one,
// rather than always opening a fresh one.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
