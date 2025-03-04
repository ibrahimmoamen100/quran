// Check for authentication
if (!localStorage.getItem('studentToken') || !localStorage.getItem('studentId')) {
    window.location.href = '/students-portal.html';
}

async function fetchStudentDetails() {
    try {
        const studentId = localStorage.getItem('studentId');
        console.log('Fetching details for student ID:', studentId);
<<<<<<< HEAD

        const response = await fetch('/data/students.json');
        if (!response.ok) throw new Error('Failed to fetch student details');

        const data = await response.json();
        const student = data.students.find(s => s.id == studentId); // Use == for comparison

        if (!student) throw new Error('Student not found');

        console.log('Student certificates:', student.certificates); // Debugging

        // Update student information
        updateStudentInfo(student);

=======
        
        // Fetch student data from JSON file
        const response = await fetch('/data/students.json');
        if (!response.ok) {
            throw new Error('Failed to fetch student details');
        }
        
        const data = await response.json();
        const student = data.students.find(s => s.id === studentId);
        
        if (!student) {
            throw new Error('Student not found');
        }
        
        // Update student information
        updateStudentInfo(student);
        // Display certificates
        displayCertificates(student.certificates);
        
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
        // Show main content and hide loading spinner
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        // Display certificates (AFTER making main-content visible)
        displayCertificates(student.certificates);

    } catch (error) {
        console.error('Error fetching student details:', error);
        alert('حدث خطأ في جلب بيانات الطالب');
        window.location.href = '/students-portal.html';
    }
}

<<<<<<< HEAD


function displayCertificates(certificates) {
    console.log('Certificates:', certificates); // Debugging line
=======
function displayCertificates(certificates) {
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
    const certificatesContainer = document.getElementById('certificates');
    certificatesContainer.innerHTML = '';

    if (certificates && certificates.length > 0) {
        certificates.forEach(cert => {
<<<<<<< HEAD
            console.log('Adding certificate:', cert); // Debugging line
=======
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
            const certificateWrapper = document.createElement('div');
            certificateWrapper.className = 'relative group';

            const img = document.createElement('img');
            img.src = cert;
            img.alt = 'شهادة';
            img.className = 'w-48 h-48 object-cover rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105';
<<<<<<< HEAD

=======
            
            // Add view full size button
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
            const viewButton = document.createElement('button');
            viewButton.className = 'absolute bottom-2 right-2 bg-green-600 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300';
            viewButton.textContent = 'عرض';
            viewButton.onclick = () => window.open(cert, '_blank');

            certificateWrapper.appendChild(img);
            certificateWrapper.appendChild(viewButton);
            certificatesContainer.appendChild(certificateWrapper);
        });
    } else {
        const noContent = document.createElement('p');
        noContent.className = 'text-gray-500 text-center';
        noContent.textContent = 'لا توجد شهادات بعد';
        certificatesContainer.appendChild(noContent);
    }
}

function updateStudentInfo(student) {
    document.getElementById('student-name').textContent = student.name || 'غير محدد';
    document.getElementById('student-id').textContent = student.id || 'غير محدد';
    document.getElementById('current-surah').textContent = student.currentSurah || 'غير محدد';
    document.getElementById('last-surah').textContent = student.lastSurah || 'غير محدد';
    document.getElementById('evaluation').textContent = student.evaluation || 'غير محدد';
    document.getElementById('sessions-attended').textContent = `${student.sessionsAttended || 0} من 8 حلقات`;
    document.getElementById('payment-type').textContent = student.paymentType === 'perSession' ? 'بالشهر' : 'بالحلقه';
    document.getElementById('current-month-paid').textContent = student.currentMonthPaid ? 'نعم' : 'لا';
    document.getElementById('last-payment-date').textContent = student.lastPaymentDate || 'غير محدد';
    document.getElementById('notes').textContent = student.notes || 'لا توجد ملاحظات';

    const studentImage = document.getElementById('student-image');
    studentImage.src = student.photo || '/images/default-avatar.png';

<<<<<<< HEAD

=======
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
    updateSchedule(student.schedule);
}

function updateSchedule(schedule) {
    const scheduleList = document.getElementById('student-schedule');
    scheduleList.innerHTML = '';
    
    if (schedule && schedule.length > 0) {
        schedule.forEach(item => {
            const listItem = document.createElement('li');
            const timeParts = item.time.split(':');
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
<<<<<<< HEAD
            const ampm = hours >= 12 ? 'مسائاً' : 'صباحاً';
=======
            const ampm = hours >= 12 ? 'م' : 'ص';
>>>>>>> d8317554080c57e6fecdf151cc111f60dfef6438
            hours = hours % 12;
            hours = hours ? hours : 12;
            listItem.textContent = `${item.day} - ${hours}:${minutes} ${ampm}`;
            scheduleList.appendChild(listItem);
        });
    } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'لا يوجد جدول';
        scheduleList.appendChild(listItem);
    }
}

// Logout handler
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentId');
    window.location.href = '/students-portal.html';
});

// Initialize page
fetchStudentDetails();
