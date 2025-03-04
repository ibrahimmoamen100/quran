// دالة لجلب وعرض الطلاب المتميزين
async function loadOutstandingStudents() {
    try {
        const response = await fetch('/api/outstanding-students');
        const students = await response.json();
        
        const container = document.getElementById('outstanding-students');
        container.innerHTML = students.map(student => `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl relative group">
                <!-- صورة الطالب -->
                <div class="relative pb-48 overflow-hidden">
                    <img src="${student.photo || '/images/default-avatar.png'}" 
                         alt="${student.name}" 
                         class="absolute h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
        
                <!-- معلومات الطالب -->
                <div class="p-6 text-center relative z-10">
                    <h3 class="text-2xl font-bold mb-3 text-gray-800">${student.name}</h3>
                    <p class="text-gray-600 flex items-center justify-center space-x-2 mb-2">
                        <i class="fas fa-book-quran text-green-600 text-xl"></i>
                        <span class="mr-2">وصل إلى سورة ${student.currentSurah}</span>
                    </p>
                    <div class="mt-4 pt-3 border-t border-gray-100">
                        <span class="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold">
                            طالب متميز 
                        </span>
                    </div>
                </div>
        
                <!-- قسم الشهادات -->
                <div class="p-6 bg-gray-50">
                
                    <h4 class="text-lg font-semibold text-gray-800 mb-4">الشهادات</h4>
                    <div class="flex flex-wrap gap-4">
                        ${student.certificates && student.certificates.length > 0 ? 
                            student.certificates.map(cert => `
                                <div class="relative group">
                                    <img src="${cert}" 
                                         alt="شهادة ${student.name}" 
                                         class="w-24 h-24 object-cover rounded-lg shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300">
      
                                </div>
                            `).join('') : 
                            '<p class="text-gray-500 text-center w-full">لا توجد شهادات بعد</p>'
                        }
                    </div>
                </div>
            </div>
        `).join('');

        // Add fade-in animation to cards
        const cards = container.querySelectorAll('div[class*="bg-white"]');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    } catch (error) {
        console.error('Error loading outstanding students:', error);
    }
}

// تحميل الطلاب المتميزين عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', loadOutstandingStudents);
