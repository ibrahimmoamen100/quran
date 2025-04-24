// api/student-details.js
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const studentsFilePath = path.join(process.cwd(), 'data', 'students.json');

function readStudents() {
  if (!fs.existsSync(studentsFilePath)) return { students: [] };
  const data = fs.readFileSync(studentsFilePath, 'utf8');
  return JSON.parse(data);
}

function verifyToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return null;
  try {
    return jwt.verify(token, 'your-secret-key');
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'الرجاء تسجيل الدخول أولاً' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing student ID' });
  }

  try {
    const data = readStudents();
    const student = data.students.find(s => s.id === id);

    if (!student) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    const { password, ...studentData } = student;
    res.status(200).json(studentData);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطالب' });
  }
}
