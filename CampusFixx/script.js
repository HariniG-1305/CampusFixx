// Firebase Compat Mode (No imports needed)
const firebaseConfig = {
  apiKey: "AIzaSyDKSTsCsCnbUZUzq6T18RJ1j0K63jwFRkU",
  authDomain: "campus-fix-425f7.firebaseapp.com",
  projectId: "campus-fix-425f7",
  storageBucket: "campus-fix-425f7.firebasestorage.app",
  messagingSenderId: "136230732752",
  appId: "1:136230732752:web:9644f9b7a8df3980f46fd5",
  measurementId: "G-ZD50M396Y6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
function generateComplaintId() {
  const now = new Date();
  return `CMP-${now.getFullYear()}${(now.getMonth() + 1)
    .toString().padStart(2, '0')}${now.getDate()
      .toString().padStart(2, '0')}-${Math.floor(Math.random() * 100000)}`;
}

function getTimestamp() {
  return new Date().toISOString();
}
const form = document.getElementById("complaintForm");
// Debug Check
console.log("CampusFixx Script Loaded");
// alert("Debug: Script Loaded"); // Uncomment if needed




form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload

  // Get values, checking for "Other" overrides
  const deptVal = document.getElementById("department").value;
  const finalDept = (deptVal === "Other") ? document.getElementById("otherDepartment").value : deptVal;

  const issueVal = document.getElementById("issueType").value;
  const finalIssue = (issueVal === "Other") ? document.getElementById("otherIssue").value : issueVal;

  const complaintData = {
    complaintId: generateComplaintId(),
    name: document.getElementById("name").value,
    registerNo: document.getElementById("regno").value,
    department: finalDept,
    block: document.getElementById("block").value,
    floor: document.getElementById("floor").value,
    issueType: finalIssue,
    description: document.getElementById("description").value,
    priority: document.getElementById("priority").value.toLowerCase(),
    createdAt: getTimestamp(),
    status: "Pending" // Default status
  };

  try {
    // 1. Check Daily Limit
    const today = new Date().toDateString(); // "Wed Jun 14 2023" format

    // Use the same simple query as My Complaints to avoid index errors
    const historySnapshot = await db.collection("complaints")
      .where("registerNo", "==", complaintData.registerNo)
      .get();

    let todayCount = 0;
    historySnapshot.forEach(doc => {
      const data = doc.data();
      if (new Date(data.createdAt).toDateString() === today) {
        todayCount++;
      }
    });

    if (todayCount >= 5) {
      alert("Daily Limit Reached! You can only register 5 complaints per day.");
      return; // Stop submission
    }

    // 2. Submit if limit not reached
    await db.collection("complaints").add(complaintData);

    // Show Success UI
    form.style.display = "none";
    const subtitle = document.querySelector(".subtitle");
    if (subtitle) {
      subtitle.style.display = "none"; // Hide subtitle for cleaner look if it exists
    }

    const successDiv = document.getElementById("successMessage");
    const idDisplay = document.getElementById("displayComplaintId");

    idDisplay.innerText = complaintData.complaintId;
    successDiv.style.display = "block";

    // Reset hidden fields not needed since we reload
    // otherDeptInput.style.display = "none";
    // otherIssueInput.style.display = "none";

  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error: " + error.message);
  }
});
