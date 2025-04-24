// api/outstanding-students.js
import fs from 'fs';
import path from 'path';

const studentsFilePath = path.join(process.cwd(), 'data', 'students.json');

function readStudents() {
  if (!fs.existsSync(studentsFilePath)) return { students: [] };
  const data = fs.readFileSync(studentsFilePath, 'utf8');
  return JSON.parse(data);
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = readStudents();
    const outstanding = data.students.filter(s => s.evaluation === 'ممتاز').map(s => ({
      id: s.id,
      name: s.name,
      currentSurah: s.currentSurah,
      currentSurahRate: s.currentSurahRate,
      lastSurah: s.lastSurah,
      lastSurahRate: s.lastSurahRate,
      lastSurah2: s.lastSurah2,
      lastSurahRate2: s.lastSurahRate2,
      evaluation: s.evaluation,
      paymentType: s.paymentType,
      notes: s.notes,
      points: s.points,
      sessionsAttended: s.sessionsAttended,
      certificates: s.certificates,
      photo: s.photo,
    }));

    res.json(outstanding);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في جلب بيانات الطلاب المتميزين' });
  }
}
