// api/students.js
import fs from 'fs';
import path from 'path';

const studentsFilePath = path.join(process.cwd(), 'data', 'students.json');

function readStudents() {
  if (!fs.existsSync(studentsFilePath)) {
    return { students: [] };
  }
  const data = fs.readFileSync(studentsFilePath, 'utf8');
  return JSON.parse(data);
}

function writeStudents(data) {
  fs.writeFileSync(studentsFilePath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = readStudents();
      const sanitized = data.students.map(({ password, ...s }) => s);
      res.status(200).json({ students: sanitized });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load students' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const student = req.body;
      if (!student.name || !student.password || !student.currentSurah) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const data = readStudents();
      student.id = Date.now().toString();
      data.students.push(student);
      writeStudents(data);
      const { password, ...studentWithoutPassword } = student;
      res.status(201).json(studentWithoutPassword);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add student' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
