// دالة لجلب وعرض الطلاب المتميزين
async function loadOutstandingStudents() {
    try {
        const response = await fetch('/api/outstanding-students');
        const students = await response.json();
        console.log(students);
        
        const container = document.getElementById('outstanding-students');
        container.innerHTML = students.map(student => `
<div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:translate-y-1 transition-all duration-300 relative">
<!-- Top curved design element -->
<div class="absolute top-0 left-0 right-0 h-32 bg-green-600 rounded-br-full rounded-bl-full transform scale-125"></div>

<!-- Circular Student Photo -->
<div class="relative pt-8 pb-5 flex justify-center z-10">
<div class="w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden">
    <img src="${student.photo || '/images/default-avatar.png'}"
        alt="${student.name}"
        class="h-full w-full object-cover">
</div>
</div>

<!-- Status Badge -->
<div class="absolute top-4 right-4 z-20">
<span class="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium shadow-sm">
    <span class="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
    طالب متميز
</span>
</div>

<!-- Student Information -->
<div class="px-6 pb-4 text-center relative z-10">
<h3 class="text-2xl font-bold mb-2 text-gray-800">${student.name}</h3>
<div class="inline-flex items-center justify-center px-3 py-1 bg-green-50 text-green-700 rounded-lg mb-3">
    <i class="fas fa-book-quran text-green-600 text-2xl ml-2"></i>
    <span class="ml-2 text-xl" >وصل إلى سورة <span class="font-bold"> { ${student.currentSurah + student.currentSurahRate+ '/10' } } </span> </span>
</div>


</div>


<!-- Certificates Section -->
<div class="p-5 bg-gray-50 border-t border-gray-100">
<h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
    <i class="fas fa-certificate text-green-500 ml-2"></i>
    الشهادات
</h4>
<div class="grid grid-cols-3 gap-3">
    ${student.certificates && student.certificates.length > 0 ?
        student.certificates.slice(0, 3).map(cert => `
            <div class="aspect-square relative rounded-lg overflow-hidden shadow-sm group">
                <img src="${cert}"
                    alt="شهادة ${student.name}"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                <div class="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                    <span class="text-white text-xs truncate">شهادة تقدير</span>
                </div>
            </div>
        `).join('') :
        '<p class="text-gray-500 text-center col-span-3">لا توجد شهادات بعد</p>'
    }
</div>
</div>
</div>
        `).join('');

        // Add fade-in animation to elements



        // Add rose petals animation
        const section = document.getElementById('outstanding-section');






    } catch (error) {
        console.error('Error loading outstanding students:', error);
    }
}

// تحميل الطلاب المتميزين عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', loadOutstandingStudents);
