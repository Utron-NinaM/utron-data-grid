/** Example car-like rows */

const makes = ['Ford', 'Toyota', 'Tesla', 'Honda', 'BMW', 'Nissan', 'Chevrolet', 'Audi', 'Mercedes', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Jeep'];
const models = ['Altima', 'Camry', 'Model 3', 'Civic', 'X5', 'Leaf', 'F-150', 'Bolt', 'A4', 'C-Class', 'Elantra', 'Sorento', 'CX-5', 'Outback', 'Golf', 'Wrangler', 'Model Y', 'Accord', 'RAV4', 'Silverado', 'Corolla', 'Mustang', 'Explorer', 'Pilot', 'CR-V', 'Tucson', 'Optima', '3 Series', 'Q5', 'E-Class'];
const colors = ['White', 'Black', 'Red', 'Silver', 'Blue', 'Green', 'Gray', 'Pearl', 'Bronze', 'Navy'];
const statuses = ['Active', 'Inactive', 'Pending'];
const colorsHebrew = ['לבן', 'שחור', 'אדום', 'כסף', 'כחול', 'ירוק', 'אפור', 'פנינה', 'ברונזה', 'כחול כהה'];
const statusesHebrew = ['פעיל', 'לא פעיל', 'ממתין'];
const descriptionsHebrew = ['רכב במצב מעולה', 'דורש תחזוקה', 'חדש מהסלון', 'מצב טוב מאוד', 'דורש תיקון קל', 'מוכן לשימוש', 'בדיקה נדרשת', 'מצב תקין'];
const electricHebrew = ['כן', 'לא'];
const electric = ['Yes', 'No'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomYear() { return 2017 + Math.floor(Math.random() * 7); }
function randomPrice() { return 22000 + Math.floor(Math.random() * 55000); }
function randomDate() {
  const y = 2019 + Math.floor(Math.random() * 5);
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const sampleData = Array.from({ length: 272 }, (_, i) => ({
  id: i + 1,
  make: randomItem(makes),
  model: randomItem(models),
  price: randomPrice(),
  year: randomYear(),
  color: randomItem(colors),
  colorHebrew: randomItem(colorsHebrew),
  electric: randomItem(electric),
  electricHebrew: randomItem(electricHebrew),
  status: randomItem(statuses),
  statusHebrew: randomItem(statusesHebrew),
  descriptionHebrew: randomItem(descriptionsHebrew),
  date: randomDate(),
}));
