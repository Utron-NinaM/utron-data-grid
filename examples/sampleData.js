/** Example car-like rows. List fields (color, electric, status) store keys; labels come from column options. */

const makes = ['Ford', 'Toyota', 'Tesla', 'Honda', 'BMW', 'Nissan', 'Chevrolet', 'Audi', 'Mercedes', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen', 'Jeep'];
const models = ['Altima', 'Camry', 'Model 3', 'Civic', 'X5', 'Leaf', 'F-150', 'Bolt', 'A4', 'C-Class', 'Elantra', 'Sorento', 'CX-5', 'Outback', 'Golf', 'Wrangler', 'Model Y', 'Accord', 'RAV4', 'Silverado', 'Corolla', 'Mustang', 'Explorer', 'Pilot', 'CR-V', 'Tucson', 'Optima', '3 Series', 'Q5', 'E-Class'];
const colorKeys = ['white', 'black', 'red', 'silver', 'blue', 'green', 'gray', 'pearl', 'bronze', 'navy'];
const statusKeys = ['active', 'inactive', 'pending'];
const electricKeys = ['yes', 'no'];
const engineTypes = ['2.0L I4', '2.5L I4', '3.0L V6', '2.0L Turbo', '1.5L Hybrid', 'Electric'];
const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
const categories = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Coupe', 'Wagon'];
const regions = ['North', 'South', 'East', 'West', 'Central'];
const dealers = ['AutoMax', 'DriveWell', 'Elite Motors', 'Metro Cars', 'Prime Auto', 'SpeedWay'];
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
function randomDateTime() {
  const y = 2019 + Math.floor(Math.random() * 5);
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

function randomMileage() { return Math.floor(Math.random() * 150000) + 1000; }
function randomWarranty() { return [0, 1, 2, 3, 5][Math.floor(Math.random() * 5)]; }
function randomRating() { return (Math.random() * 3 + 2).toFixed(1); }

export function generateSampleData(size = 105) {
  const n = Math.max(1, Math.min(100000, parseInt(size, 10) || 105));
  return Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    make: randomItem(makes),
    model: randomItem(models),
    price: randomPrice(),
    year: randomYear(),
    color: randomItem(colorKeys),
    electric: randomItem(electricKeys),
    status: randomItem(statusKeys),
    description: randomItem(descriptions),
    createdAt: randomDateTime(),
    mileage: randomMileage(),
    engine: randomItem(engineTypes),
    seats: randomItem([2, 4, 5, 6, 7, 8]),
    doors: randomItem([2, 3, 4, 5]),
    fuel: randomItem(fuelTypes),
    warranty: randomWarranty(),
    rating: randomRating(),
    notes: randomItem(['OK', 'Minor wear', 'Excellent', 'Needs service', '']),
    category: randomItem(categories),
    region: randomItem(regions),
    dealer: randomItem(dealers),
  }));
}

export const sampleData = generateSampleData(105);
