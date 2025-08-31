// // Give the service worker access to Firebase Messaging.
// // Note that you can only use Firebase Messaging here. Other Firebase libraries
// // are not available in the service worker.
// // Replace 10.13.2 with latest version of the Firebase JS SDK.
// importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// // Initialize the Firebase app in the service worker by passing in
// // your app's Firebase config object.
// // https://firebase.google.com/docs/web/setup#config-object
// firebase.initializeApp({
//     apiKey: "AIzaSyBIQvtsmQpNnzgFZImsGD7zAVwegs8F4AE",
//     authDomain: "webcnttkma.firebaseapp.com",
//     projectId: "webcnttkma",
//     storageBucket: "webcnttkma.firebasestorage.app",
//     messagingSenderId: "445857391112",
//     appId: "1:445857391112:web:066c92152caa1ee39767bd",
//     measurementId: "G-5LCR4X0L3L"
// });

// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//     console.log(
//         '[firebase-messaging-sw.js] Received background message ',
//         payload
//     );
//     // Customize notification here
//     const notificationTitle = payload.notification.title;
//     const notificationOptions = {
//         body: payload.notification.body,
//         icon: payload.notification.icon
//     };

//     self.registration.showNotification(notificationTitle, notificationOptions);
// });