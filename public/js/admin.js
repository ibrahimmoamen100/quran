// المتغيرات العامة
let selectedStudentId = null;

// وظيفة معاينة الصورة
function previewImage(input, imageId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(imageId).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// وظيفة إغلاق النافذة المنبثقة
function closeEditModal() {
    document.getElementById('editStudentModal').style.display = 'none';
}

// وظيفة تحرير الطالب
function editStudent(studentId) {
    selectedStudentId = studentId;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('الرجاء تسجيل الدخول أولاً');
            return;
        }

        fetch(`/api/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(student => {
            populateEditForm(student);
            document.getElementById('editStudentModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching student:', error);
            alert('حدث خطأ في جلب بيانات الطالب');
        });
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في جلب بيانات الطالب');
    }
}

// وظيفة ملء نموذج التحرير
function populateEditForm(student) {
    const form = document.getElementById('editStudentForm');
    form.name.value = student.name || '';
    form.currentSurah.value = student.currentSurah || '';
    form.lastSurah.value = student.lastSurah || '';
    form.evaluation.value = student.evaluation || 'جديد';
    form.paymentType.value = student.paymentType || 'شهري';
    form.notes.value = student.notes || '';
    
    // عرض الصورة الحالية
    const currentPhoto = document.getElementById('currentPhoto');
    if (student.photo) {
        currentPhoto.src = student.photo;
    } else {
        currentPhoto.src = '/images/default-avatar.png';
    }
}

// إضافة مستمع الحدث لنموذج التحرير
document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('الرجاء تسجيل الدخول أولاً');
            return;
        }

        console.log('Sending update for student:', selectedStudentId);
        const response = await fetch(`/api/students/${selectedStudentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            const updatedStudent = await response.json();
            console.log('Student updated successfully:', updatedStudent);
            alert('تم تحديث بيانات الطالب بنجاح');
            closeEditModal();
            loadStudents();
        } else {
            const errorData = await response.json();
            console.error('Update failed:', errorData);
            alert(errorData.message || 'حدث خطأ أثناء تحديث بيانات الطالب');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        alert('حدث خطأ أثناء تحديث بيانات الطالب');
    }
});
