// api/admin-login.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    if (password === '45086932') {
      const token = 'admin_' + Date.now();
      res.json({ token });
    } else {
      res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
  }
}
