// Check for authentication
if (
  !localStorage.getItem("studentToken") ||
  !localStorage.getItem("studentId")
) {
  window.location.href = "/students-portal.html";
}

async function fetchStudentDetails() {
  try {
    const studentId = localStorage.getItem("studentId");
    const token = localStorage.getItem("studentToken");
    console.log("Fetching details for student ID:", studentId);

    const response = await fetch(`/api/students/${studentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student details");
    }

    const student = await response.json();

    // Update student information
    updateStudentInfo(student);

    // Show main content and hide loading spinner
    document.getElementById("loading").style.display = "none";
    document.getElementById("main-content").style.display = "block";

    // Display certificates (AFTER making main-content visible)
    displayCertificates(student.certificates);
  } catch (error) {
    console.error("Error fetching student details:", error);
    alert("حدث خطأ في جلب بيانات الطالب");
    window.location.href = "/students-portal.html";
  }
}

function displayCertificates(certificates) {
  const certificatesContainer = document.getElementById("certificates");
  certificatesContainer.innerHTML = "";

  if (certificates && certificates.length > 0) {
    certificates.forEach((cert) => {
      const certificateWrapper = document.createElement("div");
      certificateWrapper.className = "relative group";

      const img = document.createElement("img");
      img.src = cert;
      img.alt = "شهادة";
      img.className =
        "w-48 h-48 object-cover rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105";

      // Add view full size button
      const viewButton = document.createElement("button");
      viewButton.className =
        "absolute bottom-2 right-2 bg-green-600 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300";
      viewButton.textContent = "عرض";
      viewButton.onclick = () => window.open(cert, "_blank");

      certificateWrapper.appendChild(img);
      certificateWrapper.appendChild(viewButton);
      certificatesContainer.appendChild(certificateWrapper);
    });
  } else {
    const noContent = document.createElement("p");
    noContent.className = "text-gray-500 text-center";
    noContent.textContent = "لا توجد شهادات بعد";
    certificatesContainer.appendChild(noContent);
  }
}

function updateStudentInfo(student) {
  document.getElementById("student-name").textContent =
    student.name || "غير محدد";
  document.getElementById("student-id").textContent = student.id || "غير محدد";
  document.getElementById("current-surah").textContent =
    student.currentSurah || "غير محدد";
  document.getElementById("current-surah-rate").textContent =
    `${student.currentSurahRate + "/" + "10"}` || "غير محدد";

  if (student.lastSurah) {
    document.getElementById("last-surah").textContent =
      student.lastSurah || "غير محدد";
    document.getElementById("last-surah-rate").textContent =
      `${student.lastSurahRate + "/" + "10"}` || "غير محدد";
  }

  if (student.lastSurah2) {
    document.getElementById("last-surah2").textContent =
      student.lastSurah2 || "غير محدد";
    document.getElementById("last-surah-rate2").textContent =
      `${student.lastSurahRate2 + "/" + "10"}` || "غير محدد";
  }

  document.getElementById("evaluation").textContent =
    student.evaluation || "غير محدد";

  document.getElementById("payment-type").textContent =
    student.paymentType === "perSession" ? "بالحلقه" : "بالشهر";

  if (student.paymentType === "perSession") {
    document.getElementById("last-payment-date").textContent =
      student.lastPaymentDate || " ";
    document.getElementById("current-month-paid").textContent = "";
    document.getElementById("last-payment-date").textContent =
      student.lastPaymentDate || " ";
  }
  document.getElementById("last-payment-date").textContent =
    student.lastPaymentDate || "غير محدد";
  document.getElementById("current-month-paid").textContent =
    student.currentMonthPaid ? "نعم" : "لا";
  document.getElementById("sessions-attended").textContent = `${
    student.sessionsAttended || 0
  } من 8 حلقات`;
  document.getElementById("last-payment-date").textContent =
    student.lastPaymentDate || "غير محدد";
  document.getElementById("notes").textContent =
    student.notes || "لا توجد ملاحظات";
  document.getElementById("points").textContent =
    student.points || "لا توجد نقاط";

  const studentImage = document.getElementById("student-image");
  studentImage.src = student.photo || "/images/default-avatar.png";

  updateSchedule(student.schedule);
}

function updateSchedule(schedule) {
  const scheduleList = document.getElementById("student-schedule");
  scheduleList.innerHTML = "";

  if (schedule && schedule.length > 0) {
    schedule.forEach((item) => {
      const listItem = document.createElement("li");
      const timeParts = item.time.split(":");
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? "مسائاً" : "صباحاً";
      hours = hours % 12;
      hours = hours ? hours : 12;
      listItem.textContent = `${item.day} - ${hours}:${minutes} ${ampm}`;
      scheduleList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "لا يوجد جدول";
    scheduleList.appendChild(listItem);
  }
}

// Logout handler
document.getElementById("logout-button").addEventListener("click", () => {
  localStorage.removeItem("studentToken");
  localStorage.removeItem("studentId");
  window.location.href = "/students-portal.html";
});

// Initialize page
fetchStudentDetails();
