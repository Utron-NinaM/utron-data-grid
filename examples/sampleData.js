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
const descriptions = [
  'This is a very long description that will demonstrate text truncation in the data grid cell. It contains multiple sentences and should be truncated with ellipsis when the column width is narrow.',
  'Another example of a lengthy description that showcases the truncation feature. The text should be cut off with three dots when it exceeds the available space.',
  'A comprehensive vehicle description that includes details about the condition, maintenance history, and overall state of the vehicle. This text is intentionally long to test truncation.',
  'Short text',
  'Medium length description that might or might not be truncated depending on the column width settings.',
  'This vehicle has been well-maintained and is in excellent condition. It has a complete service history and all recommended maintenance has been performed regularly.',
  'Brand new vehicle straight from the dealership with zero miles and full manufacturer warranty coverage.',
  'Used vehicle in good condition with minor wear and tear. Regular maintenance performed. Ready for immediate use.',
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomYear() { return 2017 + Math.floor(Math.random() * 7); }
function randomPrice() { return 22000 + Math.floor(Math.random() * 55000); }
function randomDate() {
  const y = 2019 + Math.floor(Math.random() * 5);
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function randomDateTime() {
  const y = 2019 + Math.floor(Math.random() * 5);
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export const sampleData = Array.from({ length: 10005 }, (_, i) => ({
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
  description: randomItem(descriptions),
  descriptionHebrew: randomItem(descriptionsHebrew),
  date: randomDateTime(),
}));
