require('dotenv').config(); const mongoose = require('mongoose'), bcrypt = require('bcryptjs'); const { User, Category } = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI); const h = await bcrypt.hash('Password@123', 10);
  const cats = [
    ['Roads & Potholes', 'Public Works', ['pothole', 'road', 'crack', 'asphalt', 'speed breaker', 'manhole']],
    ['Street Lighting', 'Electricity', ['streetlight', 'street light', 'lamp', 'dark', 'live wire', 'pole', 'power']],
    ['Water Supply', 'Water Department', ['water', 'pipe', 'leak', 'tap', 'supply', 'burst']],
    ['Sewage & Drainage', 'Sanitation', ['sewage', 'drain', 'overflow', 'gutter', 'flood', 'sewer']],
    ['Garbage & Waste', 'Sanitation', ['garbage', 'trash', 'waste', 'dump', 'litter', 'smell']],
    ['Parks & Trees', 'Horticulture', ['park', 'tree', 'garden', 'branch', 'bench']]];
  for (const [name, department, keywords] of cats) await Category.updateOne({ name }, { name, department, keywords }, { upsert: true });
  const users = [['Municipal Admin', 'admin@civicpulse.test', 'admin'], ['Ravi Supervisor', 'supervisor@civicpulse.test', 'supervisor'],
    ['Public Works Officer', 'works@civicpulse.test', 'officer', 'Public Works'], ['Electricity Officer', 'power@civicpulse.test', 'officer', 'Electricity'],
    ['Water Officer', 'water@civicpulse.test', 'officer', 'Water Department'], ['Sanitation Officer', 'sanitation@civicpulse.test', 'officer', 'Sanitation'],
    ['Demo Citizen', 'citizen@civicpulse.test', 'citizen']];
  for (const [name, email, role, department] of users) await User.updateOne({ email }, { name, email, role, department, password: h, verified: true }, { upsert: true });
  console.log('Seeded. All demo accounts use password: Password@123'); process.exit();
})();
