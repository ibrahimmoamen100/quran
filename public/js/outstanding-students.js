// دالة لجلب وعرض الطلاب المتميزين
async function loadOutstandingStudents() {
    try {
        const response = await fetch('/api/outstanding-students');
        const students = await response.json();
        
        const container = document.getElementById('outstanding-students');
        container.innerHTML = students.map(student => `
   <div class="bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl relative group">
    <!-- Glass morphism effect container -->
    <div class="absolute inset-0 bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"></div>
    
    <!-- Hero section with animated gradient border -->
    <div class="relative">
        <!-- Animated border -->
        <div class="absolute inset-0 p-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">
            <div class="absolute inset-0 bg-white rounded-t-2xl"></div>
        </div>
        
        <!-- Student photo with advanced hover effects -->
        <div class="relative h-64 overflow-hidden rounded-t-xl">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 mix-blend-overlay z-10"></div>
            <img src="${student.photo || '/images/default-avatar.png'}" 
                 alt="${student.name}" 
                 class="absolute h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out">
            
            <!-- Overlay gradient with animated opacity -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
            
            <!-- Student name with floating animation on hover -->
            <div class="absolute bottom-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 ease-out">
                <h3 class="text-3xl font-bold text-white drop-shadow-lg">${student.name}</h3>
                <div class="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2 transform scale-0 group-hover:scale-100 transition-all duration-500 delay-100"></div>
            </div>
        </div>
    </div>
    
    <!-- Student information with animated reveal -->
    <div class="p-8 relative z-20">
        <!-- Achievement badge with pulse animation -->
        <div class="absolute -top-6 right-8 transform -translate-y-1/2">
            <div class="relative">
                <span class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold shadow-lg group-hover:shadow-purple-500/30 transition-all duration-500">
                    متميز
                    <span class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-75 duration-1000"></span>
                </span>
            </div>
        </div>
        
        <!-- Current Surah with icon -->
        <div class="flex items-center space-x-4 mb-6">
            <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                <i class="fas fa-book-quran text-2xl"></i>
            </div>
            <div class="mr-4">
                <p class="text-gray-400 text-sm">المستوى الحالي</p>
                <p class="text-gray-800 font-bold text-lg">سورة ${student.currentSurah}</p>
            </div>
        </div>
        
        <!-- Progress bar -->
        <div class="mb-8">
            <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-600">التقدم العام</span>
                <span class="text-sm font-medium text-blue-600">75%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full w-3/4 group-hover:animate-pulse"></div>
            </div>
        </div>
    </div>
    
    <!-- Certificates section with 3D hover effects -->
    <div class="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <h4 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <span class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white mr-3">
                <i class="fas fa-award"></i>
            </span>
            الشهادات
        </h4>
        
        <div class="grid grid-cols-3 gap-4">
            ${student.certificates && student.certificates.length > 0 ? 
                student.certificates.map(cert => `
                    <div class="group/cert relative perspective-500">
                        <div class="relative transition-all duration-500 transform group-hover/cert:rotate-y-180 preserve-3d h-32">
                            <!-- Front -->
                            <div class="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-md">
                                <img src="${cert}" 
                                     alt="شهادة ${student.name}" 
                                     class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                            
                            <!-- Back -->
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 flex flex-col justify-center items-center text-white">
                                <i class="fas fa-medal text-2xl mb-2"></i>
                                <p class="text-sm font-bold text-center">شهادة إتمام</p>
                            </div>
                        </div>
                    </div>
                `).join('') : 
                '<p class="text-gray-500 text-center col-span-3 py-6">لا توجد شهادات بعد</p>'
            }
        </div>
    </div>
    
    <!-- Footer with social links -->
    <div class="p-4 bg-gradient-to-r from-blue-500 to-purple-600 flex justify-center space-x-6">
        <a href="#" class="text-white/80 hover:text-white transition-colors duration-300">
            <i class="fab fa-telegram text-xl"></i>
        </a>
        <a href="#" class="text-white/80 hover:text-white transition-colors duration-300">
            <i class="fab fa-whatsapp text-xl"></i>
        </a>
        <a href="#" class="text-white/80 hover:text-white transition-colors duration-300">
            <i class="fab fa-instagram text-xl"></i>
        </a>
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
