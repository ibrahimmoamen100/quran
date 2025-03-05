const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken'); 
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Create necessary directories
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const certificatesDir = path.join(publicDir, 'certificates');
const dataDir = path.join(__dirname, 'data');
const logsDir = path.join(__dirname, 'logs');

[publicDir, uploadsDir, certificatesDir, dataDir, logsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'certificates') {
            cb(null, certificatesDir);
        } else {
            cb(null, uploadsDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Serve students.json from data directory
app.use('/data/students.json', (req, res) => {
    const data = readStudentsData();
    // Remove sensitive data like passwords before sending
    const sanitizedData = {
        students: data.students.map(student => {
            const { password, ...studentData } = student;
            return studentData;
        })
    };
    res.json(sanitizedData);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Handle 404 errors for static files
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', req.path));
    } else {
        next();
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Helper Functions
function readStudentsData() {
    const studentsFilePath = path.join(__dirname, 'data', 'students.json');
    
    try {
        // محاولة قراءة الملف
        if (fs.existsSync(studentsFilePath)) {
            const data = fs.readFileSync(studentsFilePath, 'utf8');
            return JSON.parse(data);
        }

        // إذا لم يوجد الملف، نقوم بإنشاء ملف جديد
        const defaultData = { students: [] };
        writeStudentsData(defaultData);
        return defaultData;
    } catch (error) {
        const defaultData = { students: [] };
        writeStudentsData(defaultData);
        return defaultData;
    }
}

function writeStudentsData(data) {
    const studentsFilePath = path.join(__dirname, 'data', 'students.json');
    
    try {
        // التأكد من وجود المجلد
        const dataDir = path.dirname(studentsFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // التحقق من صحة البيانات
        if (!data || !data.students || !Array.isArray(data.students)) {
            throw new Error('Invalid data structure');
        }

        // كتابة البيانات بتنسيق مقروء
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(studentsFilePath, jsonString, { encoding: 'utf8', flag: 'w' });
        
        // التحقق من نجاح الكتابة
        const written = fs.readFileSync(studentsFilePath, 'utf8');
        const parsedWritten = JSON.parse(written);
        
        if (JSON.stringify(parsedWritten) !== JSON.stringify(data)) {
            throw new Error('Data verification failed');
        }
        
        return true;
    } catch (error) {
        console.error('Error writing students data:', error);
        throw error;
    }
}

// API Routes
app.get('/api/students', (req, res) => {
    try {
        const data = readStudentsData();
        res.json(data.students);
    } catch (error) {
        console.error('Error getting students:', error);
        res.status(500).json({ error: 'Failed to get students' });
    }
});

app.get('/api/students/:id', (req, res) => {
    try {
        const data = readStudentsData();
        
        const student = data.students.find(s => {
            return s.id === req.params.id;
        });
        
        
        if (!student) {
            return res.status(404).json({ error: 'الطالب غير موجود' });
        }
        
        // إخفاء كلمة المرور قبل إرسال البيانات
        const { password, ...studentData } = student;
        
        res.json(studentData);
    } catch (error) {
        console.error('Error getting student:', error);
        res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطالب' });
    }
});

app.post('/api/students', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
]), (req, res) => {
    try {


        // التحقق من البيانات المطلوبة
        if (!req.body.name) {
            return res.status(400).json({ message: 'الرجاء إدخال اسم الطالب' });
        }
        if (!req.body.password) {
            return res.status(400).json({ message: 'الرجاء إدخال الرقم السري للطالب' });
        }
        if (!req.body.currentSurah) {
            return res.status(400).json({ message: 'الرجاء إدخال السورة الحالية' });
        }

        const data = readStudentsData();
        
        // Generate a unique ID
        const id = Date.now().toString();
        
        // Process the photo file
        let photoPath = '';
        if (req.files && req.files.photo && req.files.photo[0]) {
            photoPath = '/uploads/' + req.files.photo[0].filename;
        }

        // Process certificate files
        let certificatePaths = [];
        if (req.files && req.files.certificates) {
            certificatePaths = req.files.certificates.map(file => '/certificates/' + file.filename);
        }

        const newStudent = {
            id,
            name: req.body.name,
            password: req.body.password,
            currentSurah: req.body.currentSurah,
            lastSurah: req.body.lastSurah,
            paymentType: req.body.paymentType,
            schedule: JSON.parse(req.body.schedule || '[]'),
            notes: req.body.notes,
            photo: photoPath,
            certificates: certificatePaths,
            sessionCount: 0
        };

        data.students.push(newStudent);
        writeStudentsData(data);

        // Remove password before sending response
        const { password, ...studentResponse } = newStudent;
        res.status(201).json(studentResponse);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Failed to add student' });
    }
});

app.post('/api/students/new', upload.single('photo'), (req, res) => {
    try {
        const studentsData = readStudentsData();
        
        // إنشاء معرف فريد للطالب
        const studentId = Date.now().toString();
        
        const newStudent = {
            id: studentId,
            name: req.body.name,
            password: req.body.password, // في الإنتاج يجب تشفير كلمة المرور
            currentSurah: req.body.currentSurah,
            lastSurah: req.body.lastSurah,
            schedule: [{
                day: req.body.day,
                time: req.body.time
            }],
            evaluation: "جديد",
            sessionsAttended: 0,
            paymentType: req.body.paymentType,
            notes: req.body.notes,
            photo: req.file ? `/uploads/${req.file.filename}` : null,
            currentMonthPaid: false,
            lastPaymentDate: null,
            createdAt: new Date().toISOString(),
            progress: 0,
            lessons: [],
            payments: []
        };

        studentsData.students.push(newStudent);
        writeStudentsData(studentsData);

        res.status(201).json({ message: 'تم إضافة الطالب بنجاح', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'حدث خطأ في إضافة الطالب' });
    }
});

app.put('/api/students/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificates', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('Received update request for student:', req.params.id);
        console.log('Request body:', req.body);

        const data = readStudentsData();
        const studentId = req.params.id;
        const studentIndex = data.students.findIndex(s => s.id === studentId);
        
        if (studentIndex === -1) {
            console.log('Student not found:', studentId);
            return res.status(404).json({ error: 'Student not found' });
        }

        let updatedStudent = { ...data.students[studentIndex] };

        // Handle payment status update
        if (req.body.currentMonthPaid !== undefined || req.body.sessionsAttended !== undefined) {
            if (req.body.currentMonthPaid !== undefined) {
                updatedStudent.currentMonthPaid = req.body.currentMonthPaid;
                updatedStudent.lastPaymentDate = req.body.currentMonthPaid ? new Date().toISOString() : null;
            }
            if (req.body.sessionsAttended !== undefined) {
                updatedStudent.sessionsAttended = req.body.sessionsAttended;
            }
        } 
        // Handle full student update
        else {
            // Update basic info
            updatedStudent = {
                ...updatedStudent,
                name: req.body.name || updatedStudent.name,
                currentSurah: req.body.currentSurah || updatedStudent.currentSurah,
                lastSurah: req.body.lastSurah || updatedStudent.lastSurah,
                evaluation: req.body.evaluation || updatedStudent.evaluation,
                paymentType: req.body.paymentType || updatedStudent.paymentType,
                notes: req.body.notes || updatedStudent.notes
            };

            // Handle password update
            if (req.body.password && req.body.password.trim() !== '') {
                console.log('Updating password for student:', studentId);
                updatedStudent.password = req.body.password.trim();
            }

            // Handle payment type change
            if (req.body.paymentType && req.body.paymentType !== data.students[studentIndex].paymentType) {
                updatedStudent.currentMonthPaid = false;
                updatedStudent.lastPaymentDate = null;
                updatedStudent.sessionsAttended = 0;
            }

            // Handle photo update
            if (req.file) {
                if (data.students[studentIndex].photo) {
                    const oldPhotoPath = path.join(__dirname, 'public', data.students[studentIndex].photo);
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
                updatedStudent.photo = '/uploads/' + req.file.filename;
            }

            // Handle certificates update
            if (req.files && req.files.certificates) {
                const certificatePaths = req.files.certificates.map(file => '/certificates/' + file.filename);
                updatedStudent.certificates = certificatePaths;
            }

            // Handle schedule update
            if (req.body.schedule) {
                updatedStudent.schedule = JSON.parse(req.body.schedule);
            }
        }

        console.log('Updated schedule:', updatedStudent.schedule);
        console.log('Updated certificates:', updatedStudent.certificates);
        // Update the student data
        data.students[studentIndex] = updatedStudent;
        
        // Write to both files
        writeStudentsData(data);
        
        console.log('Student updated successfully:', updatedStudent);
        res.json(updatedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student', message: error.message });
    }
});


app.delete('/api/students/:id/certificates/:index', (req, res) => {
    try {
        const data = readStudentsData();
        const studentId = req.params.id;
        const certificateIndex = parseInt(req.params.index, 10);
        const studentIndex = data.students.findIndex(s => s.id === studentId);
        
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = data.students[studentIndex];
        if (certificateIndex < 0 || certificateIndex >= student.certificates.length) {
            return res.status(400).json({ error: 'Invalid certificate index' });
        }

        // Remove the certificate file
        const certificatePath = path.join(__dirname, 'public', student.certificates[certificateIndex]);
        if (fs.existsSync(certificatePath)) {
            fs.unlinkSync(certificatePath);
        }

        // Remove the certificate from the student's certificates array
        student.certificates.splice(certificateIndex, 1);

        // Update the student data
        data.students[studentIndex] = student;
        writeStudentsData(data);

        console.log('Certificate deleted successfully');
        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        res.status(500).json({ error: 'Failed to delete certificate', message: error.message });
    }
});
app.delete('/api/students/:id', (req, res) => {
    try {
        const data = readStudentsData();
        const studentId = req.params.id;
        
        const initialLength = data.students.length;
        data.students = data.students.filter(student => student.id !== studentId);
        
        if (data.students.length === initialLength) {
            return res.status(404).json({ message: 'الطالب غير موجود' });
        }
        
        writeStudentsData(data);
        res.json({ message: 'تم حذف الطالب بنجاح' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'حدث خطأ في حذف الطالب' });
    }
});

// Student login endpoint
app.post('/api/student/login', async (req, res) => {
    try {
        const { studentName, password } = req.body;

        // Read students data
        const studentsData = readStudentsData();
        
        // Normalize and clean the input name
        const normalizeArabicText = (text) => {
            return text.trim()
                      .normalize('NFKD') // Decompose characters into base characters and diacritics
                      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
        };

        const normalizedInputName = normalizeArabicText(studentName);
        
        // Find student with matching credentials
        const student = studentsData.students.find(s => {
            const normalizedStoredName = normalizeArabicText(s.name);

            return normalizedStoredName === normalizedInputName && s.password === password;
        });

        if (!student) {
            return res.status(401).json({ 
                success: false, 
                error: 'اسم الطالب أو الرقم السري غير صحيح' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { studentId: student.id, studentName: student.name },
            'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            studentId: student.id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'حدث خطأ في تسجيل الدخول' 
        });
    }
});

app.get('/api/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        
        if (!studentId) {
            return res.status(400).json({ error: 'معرف الطالب مطلوب' });
        }
        
        const studentsData = readStudentsData();
        const student = studentsData.students.find(s => s.id === studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'الطالب غير موجود'
            });
        }

        // Send all student data except password
        const { password, ...studentData } = student;
        res.json(studentData);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({
            success: false,
            error: 'حدث خطأ في جلب بيانات الطالب'
        });
    }
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    try {
        const { password } = req.body;
        
        // Check if password is correct
        if (password === '45086932') {
            // Generate a simple token
            const token = 'admin_' + Date.now();
            res.json({ token });
        } else {
            res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
    }
});

// إضافة نقطة نهاية للطلاب المتميزين
app.get('/api/outstanding-students', (req, res) => {
    try {
        const studentsData = readStudentsData();
        const outstandingStudents = studentsData.students
            .filter(student => student.evaluation === 'ممتاز')
            .map(student => ({
                id: student.id,
                name: student.name,
                currentSurah: student.currentSurah,
                lastSurah: student.lastSurah,
                evaluation: student.evaluation,
                paymentType: student.paymentType,
                notes: student.notes,
                sessionsAttended: student.sessionsAttended,
                certificates: student.certificates,

                photo: student.photo
            }));

        res.json(outstandingStudents);
    } catch (error) {
        console.error('Error fetching outstanding students:', error);
        res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطلاب المتميزين' });
    }
});

// Middleware للتحقق من الـ token
function authenticateStudent(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'الرجاء تسجيل الدخول أولاً' });
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'الرجاء تسجيل الدخول أولاً' });
        }

        // في الإنتاج يجب التحقق من الـ JWT
        // هنا نقوم فقط بالتحقق من وجود الـ token
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'حدث خطأ في التحقق من الهوية' });
    }
}

app.get('/api/student/:id', authenticateStudent, (req, res) => {
    try {
        const studentId = req.params.id;
        
        if (!studentId) {
            return res.status(400).json({ error: 'معرف الطالب مطلوب' });
        }
        
        const studentsData = readStudentsData();
        const student = studentsData.students.find(s => s.id === studentId);

        if (!student) {
            return res.status(404).json({ error: 'الطالب غير موجود' });
        }

        // Send all student data except password
        const { password, ...studentData } = student;
        res.json(studentData);
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطالب' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// إضافة نقطة نهاية للطلاب المتميزين
app.get('/api/outstanding-students', (req, res) => {
    try {
        const studentsData = readStudentsData();
        const outstandingStudents = studentsData.students
            .filter(student => student.evaluation === 'ممتاز')
            .map(student => ({
                id: student.id,
                name: student.name,
                currentSurah: student.currentSurah,
                photo: student.photo
            }));

        res.json(outstandingStudents);
    } catch (error) {
        console.error('Error fetching outstanding students:', error);
        res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطلاب المتميزين' });
    }
});

app.listen(port, () => {
});
