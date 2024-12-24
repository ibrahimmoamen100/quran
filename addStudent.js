const fs = require('fs');
const path = require('path');

// Function to add a new student
function addNewStudent(studentData) {
    const filePath = path.join(__dirname, 'data', 'students.json');
    
    // Read current data
    const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Create new student object
    const newStudent = {
        id: Date.now().toString(),
        name: studentData.name,
        password: studentData.password,
        currentSurah: studentData.currentSurah,
        lastSurah: studentData.lastSurah,
        schedule: studentData.schedule || [],
        evaluation: "جديد",
        sessionsAttended: 0,
        paymentType: studentData.paymentType || 'perSession',
        notes: studentData.notes || '',
        photo: studentData.photo || null,
        currentMonthPaid: false,
        lastPaymentDate: null,
        createdAt: new Date().toISOString(),
        progress: 0,
        lessons: [],
        payments: []
    };
    
    // Add to students array
    currentData.students.push(newStudent);
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log('Student added successfully:', newStudent.name);
}

// Example usage:
const newStudent = {
    name: "اسم الطالب",
    password: "1234",
    currentSurah: "البقرة",
    lastSurah: "الفاتحة",
    schedule: [
        {
            day: "الأحد",
            time: "10:00"
        }
    ],
    paymentType: "perSession",
    notes: "ملاحظات عن الطالب"
};

// Call the function to add the student
addNewStudent(newStudent);
