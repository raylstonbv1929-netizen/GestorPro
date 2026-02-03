const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'agrogest_backup_2026-01-27 (2).json');

try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const transactions = data.payload?.transactions || [];

    const cleanedTransactions = transactions.map(t => {
        let newDate = t.date;
        if (t.date === '222226-01-22') {
            newDate = '2026-01-22';
        }

        // Map fields to match Transaction interface + new optional fields
        return {
            id: t.id,
            description: t.description,
            category: t.category,
            amount: t.amount,
            date: newDate,
            status: t.status,
            type: t.type,
            entity: t.entity,
            propertyId: t.property_id,
            propertyName: t.property_name
        };
    });

    fs.writeFileSync('clean_finance_data.json', JSON.stringify(cleanedTransactions, null, 2));
    console.log(`Successfully cleaned and exported ${cleanedTransactions.length} transactions to clean_finance_data.json`);

} catch (err) {
    console.error("Error migrating data:", err);
}
