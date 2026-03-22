importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCfNsZVVTqNQhEy5Q4Am-iD7PEgNCkPjdg",
  authDomain: "rosco-app-prod.firebaseapp.com",
  projectId: "rosco-app-prod",
  storageBucket: "rosco-app-prod.firebasestorage.app",
  messagingSenderId: "311445180814",
  appId: "1:311445180814:web:565ecfc1ff7cdbc60394df"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "ROSCO";
  const options = {
    body: payload.notification?.body || "You have a new update.",
    icon: "/AppLogo.png",
    badge: "/AppLogo.png",
    tag: payload.data?.tag || "rosco-notification",
    data: { url: payload.data?.url || "/handyman" },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/handyman";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes("/handyman"));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
