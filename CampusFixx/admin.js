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
const complaintsList = document.getElementById("complaintsList");
const refreshBtn = document.getElementById("refreshBtn");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");

const statTotal = document.getElementById("statTotal");
const statPending = document.getElementById("statPending");
const statResolved = document.getElementById("statResolved");

// --- Toast Notification System ---
function showToast(message, type = 'info') {
    // Create container if not exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

let allComplaints = [];

async function fetchComplaints() {
    complaintsList.innerHTML = '<p style="text-align: center;">Loading...</p>';
    try {
        const querySnapshot = await db.collection("complaints").orderBy("createdAt", "desc").get();

        allComplaints = [];
        let pendingCount = 0;
        let resolvedCount = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allComplaints.push({ id: doc.id, ...data });

            // Count Stats
            if (!data.status || data.status === 'Pending') pendingCount++;
            if (data.status === 'Resolved') resolvedCount++;
        });

        // Update Stats UI
        if (statTotal) statTotal.innerText = allComplaints.length;
        if (statPending) statPending.innerText = pendingCount;
        if (statResolved) statResolved.innerText = resolvedCount;

        renderComplaints();
    } catch (error) {
        console.error("Error fetching complaints:", error);
        complaintsList.innerHTML = '<p style="text-align: center; color: red;">Error loading data.</p>';
        showToast("Error loading complaints", "error");
    }
}

// ... renderComplaints() remains same ...

// Expose update function to global scope for button onclicks
window.updateStatus = async (docId, newStatus) => {
    // Custom Toast Confirm? For now native confirm is safer for critical actions, 
    // but let's stick to native confirm for blockage, toast for success.
    if (!confirm(`Mark this '${newStatus}'?`)) return;

    try {
        await db.collection("complaints").doc(docId).update({
            status: newStatus
        });
        showToast(`Updated to ${newStatus}`, "success");
        fetchComplaints(); // reload
    } catch (error) {
        console.error("Error updating status:", error);
        showToast("Failed to update status", "error");
    }
};

function renderComplaints() {
    const statusVal = filterStatus.value.toLowerCase();
    const priorityVal = filterPriority.value.toLowerCase();

    const filtered = allComplaints.filter(c => {
        const s = (c.status || "pending").toLowerCase();
        const p = (c.priority || "low").toLowerCase();

        const statusMatch = statusVal === "all" || s === statusVal;
        const priorityMatch = priorityVal === "all" || p === priorityVal;

        return statusMatch && priorityMatch;
    });

    complaintsList.innerHTML = "";
    if (filtered.length === 0) {
        complaintsList.innerHTML = '<p style="text-align: center;">No complaints found.</p>';
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement("div");
        const priorityClass = `priority-${(c.priority || 'low').toLowerCase()}`;
        card.className = `complaint-card ${priorityClass}`;

        const status = c.status || "Pending";

        card.innerHTML = `
            <div class="complaint-info">
                <h4>${c.issueType} <span style="font-size: 0.8em; opacity: 0.7;">(${c.complaintId})</span></h4>
                <small>${c.department} | Block: ${c.block}, Floor: ${c.floor}</small>
                <p style="color: var(--primary); font-weight: 600; margin-top: 4px;">👤 ${c.name} (${c.registerNo})</p>
                <p><strong>Status:</strong> ${status}</p>
                <p>${c.description}</p>
            </div>
            <div class="actions">
                ${status === 'Pending' ? `
                <button class="btn-resolve" onclick="window.updateStatus('${c.id}', 'Resolved')">Resolve</button>
                <button class="btn-reject" onclick="window.updateStatus('${c.id}', 'Rejected')">Reject</button>
                ` : `<span style="font-weight: bold; color: #555;">${status}</span>`}
            </div>
        `;
        complaintsList.appendChild(card);
    });
}

// Expose update function to global scope for button onclicks


refreshBtn.addEventListener("click", fetchComplaints);
filterStatus.addEventListener("change", renderComplaints);
filterPriority.addEventListener("change", renderComplaints);

// Initial load
fetchComplaints();
