// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken } from "firebase/messaging";

// const firebaseConfig = {
//     apiKey: "AIzaSyBIQvtsmQpNnzgFZImsGD7zAVwegs8F4AE",
//     authDomain: "webcnttkma.firebaseapp.com",
//     projectId: "webcnttkma",
//     storageBucket: "webcnttkma.firebasestorage.app",
//     messagingSenderId: "445857391112",
//     appId: "1:445857391112:web:066c92152caa1ee39767bd",
//     measurementId: "G-5LCR4X0L3L"
// };

// // const firebaseConfig = {
// //     apiKey: "AIzaSyBSYFzfRb3ofKS38pmYdd6QM7iW-yePEcA",
// //     authDomain: "web-cntt.firebaseapp.com",
// //     projectId: "web-cntt",
// //     storageBucket: "web-cntt.firebasestorage.app",
// //     messagingSenderId: "52159526329",
// //     appId: "1:52159526329:web:8b1661022bc95f9451b268",
// //     measurementId: "G-QLJC3TQ1HM"
// // };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const messaging = getMessaging(app);
// export const fcmToken = getToken(messaging, {
//     vapidKey:
//         "BE9SKTSw2lVMYmqw0khjKVmFhFQI8UX4Rwc1oJCmO36cO5z3lfXK5klAonlx3pq55Z5IjeUJhdYnP7ECDSndFRM"
// })

// export const generateToken = async () => {
//     const permission = await Notification.requestPermission();
//     console.log(permission)
//     if (permission === "granted") {
//         const token = await getToken(messaging, {
//             vapidKey:
//                 "BE9SKTSw2lVMYmqw0khjKVmFhFQI8UX4Rwc1oJCmO36cO5z3lfXK5klAonlx3pq55Z5IjeUJhdYnP7ECDSndFRM"
//         })
//         console.log(token)
//     }
// }
// // "BE9SKTSw2lVMYmqw0khjKVmFhFQI8UX4Rwc1oJCmO36cO5z3lfXK5klAonlx3pq55Z5IjeUJhdYnP7ECDSndFRM"