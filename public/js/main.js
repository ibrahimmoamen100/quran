// DOM Elements
const addStudentForm = document.getElementById("addStudentForm");
const editStudentForm = document.getElementById("editStudentForm");
const studentsList = document.getElementById("studentsList");
const editModal = document.getElementById("editStudentModal");
const currentPhoto = document.getElementById("currentPhoto");
const studentSearch = document.getElementById("studentSearch");

// Utility Functions

// Check for existing login
window.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (token) {
    showAdminPanel();
  }
});

// Login form submission
document
  .getElementById("adminLoginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const password = document.getElementById("adminPassword").value;

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        showAdminPanel();
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ في تسجيل الدخول");
    }
  });

function showAdminPanel() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("adminContent").style.display = "block";
}

function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}
function formatSchedule(schedule) {
  return schedule.map((s) => `${s.day} - ${s.time}`).join("<br>");
}

function addScheduleItem() {
  const container = document.getElementById("scheduleContainer");
  const newItem = document.createElement("div");
  newItem.className = "schedule-item grid grid-cols-2 gap-4";
  newItem.innerHTML = `
        <div>
            <label class="block text-sm">اليوم</label>
            <select name="day" class="w-full p-2 border rounded-md" required>
                <option value="">اختر اليوم</option>
                <option value="الأحد">الأحد</option>
                <option value="الإثنين">الإثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
                <option value="الجمعة">الجمعة</option>
                <option value="السبت">السبت</option>
            </select>
        </div>
        <div>
            <label class="block text-sm">الوقت</label>
            <input type="time" name="time" class="w-full p-2 border rounded-md" required>
        </div>
        <button type="button" onclick="removeScheduleItem(this)" class="text-red-600 hover:text-red-800 text-sm">
            حذف الموعد
        </button>
    `;
  container.appendChild(newItem);
}

function addEditScheduleItem() {
  const container = document.getElementById("editScheduleContainer");
  const newItem = document.createElement("div");
  newItem.className = "schedule-item grid grid-cols-2 gap-4";
  newItem.innerHTML = `
        <div>
            <label class="block text-sm">اليوم</label>
            <select name="day" class="w-full p-2 border rounded-md" required>
                <option value="">اختر اليوم</option>
                <option value="الأحد">الأحد</option>
                <option value="الإثنين">الإثنين</option>
                <option value="الثلاثاء">الثلاثاء</option>
                <option value="الأربعاء">الأربعاء</option>
                <option value="الخميس">الخميس</option>
                <option value="الجمعة">الجمعة</option>
                <option value="السبت">السبت</option>
            </select>
        </div>
        <div>
            <label class="block text-sm">الوقت</label>
            <input type="time" name="time" class="w-full p-2 border rounded-md" required>
        </div>
        <button type="button" onclick="removeScheduleItem(this)" class="text-red-600 hover:text-red-800 text-sm">
            حذف الموعد
        </button>
    `;
  container.appendChild(newItem);
}

function removeScheduleItem(button) {
  button.parentElement.remove();
}

// Toggle Payment Status Container
function togglePaymentStatus(select) {
  const container = document.getElementById("paymentStatusContainer");
  if (select.value === "perMonth") {
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
    container.querySelector('input[type="checkbox"]').checked = false;
  }
}

function toggleEditPaymentStatus(select) {
  const container = document.getElementById("editPaymentStatusContainer");
  if (select.value === "perMonth") {
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
    container.querySelector('input[type="checkbox"]').checked = false;
  }
}

// Format Payment Status
function formatPaymentStatus(student) {
  if (student.paymentType === "perMonth") {
    return `
            <div class="flex items-center">
                <input type="checkbox" 
                       ${student.currentMonthPaid ? "checked" : ""} 
                       onchange="updatePaymentStatus('${
                         student.id
                       }', this.checked)"
                       class="form-checkbox h-5 w-5 text-green-600">
                <span class="mr-2">${
                  student.currentMonthPaid ? "تم الدفع" : "لم يتم الدفع"
                }</span>
            </div>
        `;
  }
  return "-";
}

// Update Payment Status
async function updatePaymentStatus(id, paid) {
  try {
    const response = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentMonthPaid: paid,
      }),
    });

    const responseData = await response.json();
    console.log("Server response:", responseData);

    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to update payment status"
      );
    }

    loadStudents();
  } catch (error) {
    console.error("Error updating payment status:", error);
    alert("حدث خطأ أثناء تحديث حالة الدفع");
  }
}

// Increment Sessions
function incrementSessions(id, currentCount) {
  // If monthly payment and already at 8 sessions, reset to 0
  const newCount = currentCount >= 8 ? 0 : currentCount + 1;

  // If resetting to 0, also reset the payment status
  const shouldResetPayment = currentCount >= 8;

  fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionsAttended: newCount,
      currentMonthPaid: shouldResetPayment ? false : undefined,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Server response:", data);
      if (data.error) {
        throw new Error(data.error);
      }
      loadStudents();
    })
    .catch((error) => {
      console.error("Error updating sessions:", error);
      alert("حدث خطأ أثناء تحديث عدد الحلقات");
    });
}

// Load students when page loads
// Load students when page loads
loadStudents();

// Search functionality
studentSearch.addEventListener("input", function () {
  const searchTerm = this.value.trim().toLowerCase();
  loadStudents(searchTerm);
});

// Add student form submission
addStudentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData(addStudentForm);
    const schedule = [];
    const scheduleItems = document.querySelectorAll(
      "#scheduleContainer .schedule-item"
    );
    scheduleItems.forEach((item) => {
      const day = item.querySelector('select[name="day"]').value;
      const time = item.querySelector('input[name="time"]').value;
      schedule.push({ day, time });
    });
    formData.set("schedule", JSON.stringify(schedule));

    // Log form data before sending
    console.log("Form data before sending:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch("/api/students", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    console.log("Server response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to add student");
    }

    addStudentForm.reset();
    loadStudents();
  } catch (error) {
    console.error("Error adding student:", error);
    alert("حدث خطأ أثناء إضافة الطالب");
  }
});

// Edit student form submission
document
  .getElementById("editStudentForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const studentId = formData.get("studentId"); // Get the student ID from the form
      const token = localStorage.getItem("token");
      if (!token) {
        alert("الرجاء تسجيل الدخول أولاً");
        return;
      }

      const certificatesInput = document.getElementById(
        "editCertificateImages"
      );
      console.log("certificatesInput:", certificatesInput);
      if (certificatesInput) {
        console.log("certificatesInput.files:", certificatesInput.files);
        if (certificatesInput.files.length > 0) {
          for (let i = 0; i < certificatesInput.files.length; i++) {
            formData.append("certificates[]", certificatesInput.files[i]);
          }
        }
      }

      const schedule = [];
      const scheduleItems = document.querySelectorAll(
        "#editScheduleContainer .schedule-item"
      );
      scheduleItems.forEach((item) => {
        const day = item.querySelector('select[name="day"]').value;
        const time = item.querySelector('input[name="time"]').value;
        schedule.push({ day, time });
      });
      formData.set("schedule", JSON.stringify(schedule));
      console.log("Sending update with data:", formData);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student");
      }

      console.log("Update successful");
      closeEditModal();
      loadStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("حدث خطأ أثناء تحديث بيانات الطالب: " + error.message);
    }
  });

// Load students from server
function loadStudents(searchTerm = "") {
  fetch("/api/students")
    .then((response) => response.json())
    .then((students) => {
      console.log("Server response:", students);
      const tbody = document.getElementById("studentsList");
      tbody.innerHTML = "";

      let filteredStudents = students;
      if (searchTerm) {
        filteredStudents = students.filter((student) =>
          student.name.toLowerCase().includes(searchTerm)
        );

        // Prioritize the matching student
        const matchingStudent = filteredStudents.find(
          (student) => student.name.toLowerCase() === searchTerm
        );

        if (matchingStudent) {
          filteredStudents = [
            matchingStudent,
            ...filteredStudents.filter(
              (student) => student !== matchingStudent
            ),
          ];
        }
      }

      filteredStudents.forEach((student) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                        <img src="${
                          student.photo || "/uploads/placeholder.png"
                        }" alt="${student.name}" 
                             class="w-12 h-12 rounded-full object-cover">
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${student.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      student.currentSurah
                    }</td>
                    <td class="px-6 py-4 whitespace-normal">${formatSchedule(
                      student.schedule
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <span class="sessions-count ml-2">${
                              student.sessionsAttended
                            }</span>
                            <button onclick="incrementSessions('${
                              student.id
                            }', ${student.sessionsAttended})" 
                                    class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                تم حضور حلقة
                            </button>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${
                      student.paymentType === "perMonth" ? "شهري" : "بالحلقة"
                    }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formatPaymentStatus(
                      student
                    )}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <select onchange="updateEvaluation('${
                          student.id
                        }', this.value)" class="border rounded p-1">
                            <option value="" ${
                              !student.evaluation ? "selected" : ""
                            }>-</option>
                            <option value="ممتاز" ${
                              student.evaluation === "ممتاز" ? "selected" : ""
                            }>ممتاز</option>
                            <option value="جيد جداً" ${
                              student.evaluation === "جيد جداً"
                                ? "selected"
                                : ""
                            }>جيد جداً</option>
                            <option value="جيد" ${
                              student.evaluation === "جيد" ? "selected" : ""
                            }>جيد</option>
                            <option value="مقبول" ${
                              student.evaluation === "مقبول" ? "selected" : ""
                            }>مقبول</option>
                            <option value="ضعيف" ${
                              student.evaluation === "ضعيف" ? "selected" : ""
                            }>ضعيف</option>
                        </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                        <div class="flex space-x-2">
                            <button onclick="openEditModal('${
                              student.id
                            }')" class="text-blue-600 hover:text-blue-800 ml-2">تعديل</button>
                            <button onclick="deleteStudent('${
                              student.id
                            }')" class="text-red-600 hover:text-red-800">حذف</button>
                        </div>
                    </td>
                `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading students:", error);
      alert("حدث خطأ أثناء تحميل بيانات الطلاب");
    });
}

// Edit student
async function openEditModal(studentId) {
  try {
    const response = await fetch("/api/students");
    if (!response.ok) {
      throw new Error("Failed to fetch students data");
    }
    const data = await response.json();
    const students = data;
    const student = students.find((s) => s.id === studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    // Fill the edit form with student data
    const form = document.getElementById("editStudentForm");
    document.getElementById("editStudentId").value = student.id;
    form.querySelector('input[name="name"]').value = student.name;
    form.querySelector('input[name="currentSurah"]').value =
      student.currentSurah;
    form.querySelector('input[name="currentSurahRate"]').value =
      student.currentSurahRate;
    form.querySelector('input[name="lastSurah"]').value =
      student.lastSurah || "";
    form.querySelector('input[name="lastSurahRate"]').value =
      student.lastSurahRate || "";
    form.querySelector('input[name="lastSurah2"]').value =
      student.lastSurah2 || "";
    form.querySelector('input[name="lastSurahRate2"]').value =
      student.lastSurahRate2 || "";
    form.querySelector('select[name="evaluation"]').value =
      student.evaluation || "";
    form.querySelector('select[name="paymentType"]').value =
      student.paymentType || "بالشهر";
    form.querySelector('textarea[name="notes"]').value = student.notes || "";
    form.querySelector('textarea[name="points"]').value = student.points || "";

    // Clear existing schedule items
    const scheduleContainer = document.getElementById("editScheduleContainer");
    scheduleContainer.innerHTML = "";

    // Add schedule items
    if (student.schedule && student.schedule.length > 0) {
      student.schedule.forEach((schedule) => {
        const newItem = document.createElement("div");
        newItem.className = "schedule-item grid grid-cols-2 gap-4";
        newItem.innerHTML = `
                    <div>
                        <label class="block text-sm">اليوم</label>
                        <select name="day" class="w-full p-2 border rounded-md" required>
                            <option value="">اختر اليوم</option>
                            <option value="الأحد" ${
                              schedule.day === "الأحد" ? "selected" : ""
                            }>الأحد</option>
                            <option value="الإثنين" ${
                              schedule.day === "الإثنين" ? "selected" : ""
                            }>الإثنين</option>
                            <option value="الثلاثاء" ${
                              schedule.day === "الثلاثاء" ? "selected" : ""
                            }>الثلاثاء</option>
                            <option value="الأربعاء" ${
                              schedule.day === "الأربعاء" ? "selected" : ""
                            }>الأربعاء</option>
                            <option value="الخميس" ${
                              schedule.day === "الخميس" ? "selected" : ""
                            }>الخميس</option>
                            <option value="الجمعة" ${
                              schedule.day === "الجمعة" ? "selected" : ""
                            }>الجمعة</option>
                            <option value="السبت" ${
                              schedule.day === "السبت" ? "selected" : ""
                            }>السبت</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm">الوقت</label>
                        <input type="time" name="time" class="w-full p-2 border rounded-md" value="${
                          schedule.time
                        }" required>
                    </div>
                    <button type="button" onclick="removeScheduleItem(this)" class="text-red-600 hover:text-red-800 text-sm">
                        حذف الموعد
                    </button>
                `;
        scheduleContainer.appendChild(newItem);
      });
    }

    // Show current photo if exists
    const currentPhotoElement = document.getElementById("currentPhoto");
    if (student.photo) {
      currentPhotoElement.src = student.photo;
      currentPhotoElement.style.display = "block";
    } else {
      currentPhotoElement.style.display = "none";
    }

    // Show certificate images if they exist
    const certificatesContainer = document.getElementById("certificateImages");
    certificatesContainer.innerHTML = ""; // Clear previous images

    if (student.certificates && student.certificates.length > 0) {
      student.certificates.forEach((certificate) => {
        const img = document.createElement("img");
        img.src = certificate;
        img.alt = "Certificate";
        img.className = "w-24 h-24 object-cover rounded mt-2";
        certificatesContainer.appendChild(img);
      });
    }

    // Show the modal
    const modal = document.getElementById("editStudentModal");
    modal.style.display = "block";
  } catch (error) {
    console.error("Error:", error);
  }
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById("editStudentModal");
  modal.style.display = "none";
}

// Update student evaluation
async function updateEvaluation(studentId, evaluation) {
  try {
    const formData = new FormData();
    formData.append("evaluation", evaluation);

    // Log form data before sending
    console.log("Form data before sending:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PUT",
      body: formData,
    });

    const responseData = await response.json();
    console.log("Server response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update evaluation");
    }
  } catch (error) {
    console.error("Error updating evaluation:", error);
    alert("حدث خطأ أثناء تحديث التقييم");
  }
}

// Delete student
async function deleteStudent(studentId) {
  if (confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to delete student");
      }

      loadStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("حدث خطأ أثناء حذف الطالب");
    }
  }
}

// Close modal when clicking outside
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});
