const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'agrogest_backup_2026-01-27 (2).json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const transactions = data.payload?.transactions || [];

    console.log(`Total transactions found: ${transactions.length}`);

    const categories = new Set();
    const types = new Set();
    const suspiciousDates = [];

    transactions.forEach(t => {
        categories.add(t.category);
        types.add(t.type);
        if (t.date && (t.date.length > 10 || t.date.startsWith('22'))) {
            suspiciousDates.push({ id: t.id, date: t.date, description: t.description });
        }
    });

    console.log("Categories found in backup:", Array.from(categories).sort());
    console.log("Types found:", Array.from(types));
    if (suspiciousDates.length > 0) {
        console.log("Suspicious dates found:");
        suspiciousDates.forEach(d => console.log(`  - ${d.date} (ID: ${d.id}, ${d.description})`));
    }

} catch (err) {
    console.error("Error reading or parsing file:", err);
}
