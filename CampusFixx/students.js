const authorizedStudents = [
    { name: "Hari saran", regNo: "622123202048", dept: "IT" },
    { name: "Harini", regNo: "622123202052", dept: "IT" },
    { name: "Nisha", regNo: "622123202001", dept: "IT" },
    { name: "Dharshini", regNo: "622123202002", dept: "IT" },
    { name: "Bala", regNo: "622123202003", dept: "IT" },
    { name: "Harish", regNo: "622123202004", dept: "IT" },
    { name: "Ajay", regNo: "622123202005", dept: "IT" },
    { name: "Kishore", regNo: "622123202006", dept: "IT" },
    { name: "Vicky", regNo: "622123202007", dept: "IT" },
    { name: "Rahul", regNo: "622123202008", dept: "IT" }
];

// Helper to validate student
function validateStudent(name, regNo, dept) {
    return authorizedStudents.find(student =>
        student.regNo === regNo &&
        student.name.toLowerCase() === name.toLowerCase() &&
        student.dept === dept
    );
}
