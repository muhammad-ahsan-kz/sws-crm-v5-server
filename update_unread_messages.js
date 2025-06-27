const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { Timestamp } = require("firebase-admin/firestore");

// Initialize Firestore (if not already)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("./credentials.json")),
    });
}

const db = getFirestore();

// ========== 🔁 Watch changes to `messages` collection ==========
const watchMessages = async () => {
    console.log("👁️ Listening to new messages...");

    const messagesRef = db.collection("messages");
    const changeStream = messagesRef.stream(); // Uses Firestore Change Streams

    for await (const change of changeStream) {
        if (change.type === 'CREATE') {
            const messageData = change.doc.data();
            const { projectId, timestamp } = messageData;

            // Get all users with this project in their `lastOpenedProjects`
            const usersSnap = await db.collection("users").get();

            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;
                const userData = userDoc.data();
                const lastOpenedProjects = userData.lastOpenedProjects || {};

                const lastOpened = lastOpenedProjects[projectId];
                if (!lastOpened) continue;

                const lastOpenedDate = lastOpened.toDate ? lastOpened.toDate() : new Date(lastOpened);

                if (timestamp.toDate() > lastOpenedDate) {
                    // Recount unread messages for this user
                    const messagesSnap = await db
                        .collection("messages")
                        .where("projectId", "==", projectId)
                        .where("timestamp", ">", Timestamp.fromDate(lastOpenedDate))
                        .get();

                    let totalUnread = messagesSnap.size;

                    // Optional: add unread from other projects
                    for (const [projId, time] of Object.entries(lastOpenedProjects)) {
                        if (projId === projectId) continue;
                        const timeDate = time.toDate ? time.toDate() : new Date(time);
                        const projSnap = await db
                            .collection("messages")
                            .where("projectId", "==", projId)
                            .where("timestamp", ">", Timestamp.fromDate(timeDate))
                            .get();
                        totalUnread += projSnap.size;
                    }

                    await db.collection("users").doc(userId).update({
                        totalUnreadMessages: totalUnread,
                    });

                    console.log(`🔁 Updated ${userId} unread messages to: ${totalUnread}`);
                }
            }
        }
    }
};

watchMessages().catch(console.error);



// const express = require("express");
// const router = express.Router();

// const { initializeApp, cert } = require("firebase-admin/app");
// const { getFirestore, Timestamp } = require("firebase-admin/firestore");
// const credentials = require("./credentials.json");

// // 🔐 Initialize Firebase only once
// initializeApp({
//     credential: cert(credentials),
// });

// const db = getFirestore();

// router.get("/update-unread-messages", async (req, res) => {
//     try {
//         const usersRef = db.collection("users");
//         const usersSnap = await usersRef.get();

//         for (const userDoc of usersSnap.docs) {
//             const userId = userDoc.id;
//             const data = userDoc.data();
//             const lastOpenedProjects = data.lastOpenedProjects;

//             if (!lastOpenedProjects || typeof lastOpenedProjects !== "object") continue;

//             let totalUnread = 0;

//             for (const [projectId, lastOpened] of Object.entries(lastOpenedProjects)) {
//                 if (!(lastOpened instanceof Timestamp)) continue;

//                 const messagesSnap = await db
//                     .collection("messages")
//                     .where("projectId", "==", projectId)
//                     .where("timestamp", ">", lastOpened)
//                     .get();

//                 totalUnread += messagesSnap.size;
//             }

//             await usersRef.doc(userId).update({
//                 totalUnreadMessages: totalUnread,
//             });

//             console.log(`✅ Updated user ${userId} → ${totalUnread} unread messages`);
//         }

//         res.json({ status: "success", message: "All users updated." });
//     } catch (error) {
//         console.error("❌ Error updating unread messages:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;
