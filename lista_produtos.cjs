const fs = require('fs');

async function generateDetailedList() {
    const inputFile = 'agrogest_backup_2026-01-27 (2).json';

    if (!fs.existsSync(inputFile)) {
        console.error(`Erro: Arquivo ${inputFile} não encontrado.`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(rawData);
        const products = data.payload?.products || [];

        console.log("=== RELATÓRIO DETALHADO DE INSUMOS (AGROGEST) ===\n");

        products.forEach((p, index) => {
            const name = p.name || '---';
            const category = p.category || 'Sem Categoria';
            const unit = p.unit || 'un';
            const stock = parseFloat(p.stock) || 0;
            const price = parseFloat(p.price) || 0;
            const unitWeight = p.unitWeight || p.unit_weight || 1;

            // Determinar Unidade de Saída vs Logística
            let logisticsUnit = unit;
            let outputUnit = unit;

            if (unit.toLowerCase() === 'sc' || unit.toLowerCase().includes('saco')) {
                logisticsUnit = 'Saco (Logística)';
                outputUnit = 'kg (Base)';
            } else if (unit.toLowerCase() === 'l' || unit.toLowerCase() === 'litro') {
                logisticsUnit = 'Litro';
                outputUnit = 'ml / L';
            } else if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'quilo') {
                logisticsUnit = 'Quilo';
                outputUnit = 'g / kg';
            }

            console.log(`[Item ${String(index + 1).padStart(2, '0')}]`);
            console.log(`Nome:                      ${name}`);
            console.log(`Divisão:                   ${category}`);
            console.log(`Unidade Logística:         ${logisticsUnit}`);
            console.log(`Unidade de Saída (Medida): ${outputUnit}`);
            console.log(`Saldo Atual:               ${stock} ${unit}`);
            console.log(`Peso/Capacidade Unitária:  ${unitWeight}`);
            console.log(`Valor Unitário:            R$ ${price.toFixed(2).replace('.', ',')}`);
            console.log("--------------------------------------------------");
        });

        console.log(`\nFim do relatório: ${products.length} itens processados.`);

    } catch (err) {
        console.error(`Erro na geração: ${err.message}`);
    }
}

generateDetailedList();
