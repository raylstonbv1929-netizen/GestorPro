const fs = require('fs');

async function audit() {
    const inputFile = 'agrogest_backup_2026-01-27 (2).json';

    if (!fs.existsSync(inputFile)) {
        console.error(`Erro: Arquivo ${inputFile} não encontrado.`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(rawData);
        const products = data.payload?.products || [];

        console.log("=== AUDITORIA DE ESTOQUE (AGROGEST BACKUP) ===");
        console.log(`Total de produtos analisados: ${products.length}\n`);

        const lowStock = [];
        const criticalStock = [];
        const okStock = [];
        const zeroStock = [];

        products.forEach(p => {
            const stock = parseFloat(p.stock) || 0;
            const min = parseFloat(p.minStock) || 0;
            const name = p.name || 'Produto Sem Nome';
            const unit = p.unit || 'un';

            if (stock === 0) {
                zeroStock.push({ name, stock, min, unit });
            } else if (stock <= min / 2) {
                criticalStock.push({ name, stock, min, unit });
            } else if (stock <= min) {
                lowStock.push({ name, stock, min, unit });
            } else {
                okStock.push({ name, stock, min, unit });
            }
        });

        if (zeroStock.length > 0) {
            console.log("❌ ESTOQUE ZERADO:");
            zeroStock.forEach(p => console.log(` - ${p.name.padEnd(25)} | Atual: 0 ${p.unit} (Mín: ${p.min})`));
            console.log("");
        }

        if (criticalStock.length > 0) {
            console.log("⚠️ ESTOQUE CRÍTICO (Abaixo de 50% do mínimo):");
            criticalStock.forEach(p => console.log(` - ${p.name.padEnd(25)} | Atual: ${p.stock} ${p.unit} (Mín: ${p.min})`));
            console.log("");
        }

        if (lowStock.length > 0) {
            console.log("🟡 ESTOQUE BAIXO (Abaixo do mínimo):");
            lowStock.forEach(p => console.log(` - ${p.name.padEnd(25)} | Atual: ${p.stock} ${p.unit} (Mín: ${p.min})`));
            console.log("");
        }

        console.log("--- RESUMO GERAL ---");
        console.log(`✅ Em conformidade: ${okStock.length}`);
        console.log(`🟡 Estoque baixo:   ${lowStock.length}`);
        console.log(`⚠️ Críticos:        ${criticalStock.length}`);
        console.log(`❌ Zerados:         ${zeroStock.length}`);

    } catch (err) {
        console.error(`Erro na auditoria: ${err.message}`);
    }
}

audit();
