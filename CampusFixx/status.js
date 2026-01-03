// Firebase Compat
const firebaseConfig = {
    apiKey: "AIzaSyDKSTsCsCnbUZUzq6T18RJ1j0K63jwFRkU",
    authDomain: "campus-fix-425f7.firebaseapp.com",
    projectId: "campus-fix-425f7",
    storageBucket: "campus-fix-425f7.firebasestorage.app",
    messagingSenderId: "136230732752",
    appId: "1:136230732752:web:9644f9b7a8df3980f46fd5",
    measurementId: "G-ZD50M396Y6"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const form = document.getElementById("statusForm");
const resultDiv = document.getElementById("result");
const resId = document.getElementById("resId");
const resIssue = document.getElementById("resIssue");
const resStatus = document.getElementById("resStatus");
const resDesc = document.getElementById("resDesc");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputId = document.getElementById("complaintId").value.trim();

    if (!inputId) return;

    // UI Feedback
    const btn = form.querySelector("button");
    const originalText = btn.innerText;
    btn.innerText = "Searching...";
    btn.disabled = true;
    resultDiv.style.display = "none";

    try {
        const querySnapshot = await db.collection("complaints").where("complaintId", "==", inputId).get();

        if (querySnapshot.empty) {
            alert("Complaint ID not found. Please check and try again.");
        } else {
            // Assume unique ID, take first doc
            const docData = querySnapshot.docs[0].data();

            resId.innerText = docData.complaintId;
            resIssue.innerText = docData.issueType;
            resDesc.innerText = docData.description;

            // Default status if undefined
            const status = docData.status || "Pending";
            resStatus.innerText = status;

            // Apply color class
            resStatus.className = "status-badge"; // reset
            if (status.toLowerCase() === "pending") resStatus.classList.add("status-pending");
            else if (status.toLowerCase() === "resolved") resStatus.classList.add("status-resolved");
            else resStatus.classList.add("status-rejected");

            resultDiv.style.display = "block";
        }

    } catch (error) {
        console.error("Error fetching documents: ", error);
        alert("Error fetching status.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});
