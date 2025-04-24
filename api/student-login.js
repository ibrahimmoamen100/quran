// api/student-login.js
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const studentsFilePath = path.join(process.cwd(), 'data', 'students.json');

function readStudents() {
  if (!fs.existsSync(studentsFilePath)) return { students: [] };
  const data = fs.readFileSync(studentsFilePath, 'utf8');
  return JSON.parse(data);
}

function normalize(text) {
  return text.trim().normalize("NFKC").replace(/\s+/g, ' ');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, password } = req.body;
    if (!studentName || !password) {
      return res.status(400).json({ error: 'Missing student name or password' });
    }

    const data = readStudents();
    const normalizedInputName = normalize(studentName);

    const student = data.students.find(s => normalize(s.name) === normalizedInputName && s.password === password);

    if (!student) {
      return res.status(401).json({ error: 'اسم الطالب أو الرقم السري غير صحيح' });
    }

    const token = jwt.sign({ studentId: student.id, studentName: student.name }, 'your-secret-key', { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      studentId: student.id
    });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
  }
}
