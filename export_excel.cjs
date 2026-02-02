const fs = require('fs');

async function exportToCSV() {
    const inputFile = 'agrogest_backup_2026-01-27 (2).json';
    const outputFile = 'lista_produtos_agrogest.csv';

    if (!fs.existsSync(inputFile)) {
        console.error(`Erro: Arquivo ${inputFile} não encontrado.`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(inputFile, 'utf-8');
        const data = JSON.parse(rawData);
        const products = data.payload?.products || [];

        // Cabeçalho do CSV (usando ponto e vírgula para compatibilidade com Excel em PT-BR)
        let csvContent = "Nome;Divisao;Unidade Logistica;Unidade de Saida;Saldo Atual;Peso Unitario;Valor Unitario (R$)\n";

        products.forEach(p => {
            const name = p.name || '';
            const category = p.category || '';
            const unit = p.unit || '';
            const stock = String(p.stock || 0).replace('.', ',');
            const price = String(p.price || 0).replace('.', ',');
            const unitWeight = String(p.unitWeight || p.unit_weight || 1).replace('.', ',');

            let logisticsUnit = unit;
            let outputUnit = unit;

            if (unit.toLowerCase() === 'sc' || unit.toLowerCase().includes('saco')) {
                logisticsUnit = 'Saco';
                outputUnit = 'kg';
            } else if (unit.toLowerCase() === 'l' || unit.toLowerCase() === 'litro') {
                logisticsUnit = 'Litro';
                outputUnit = 'L';
            } else if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'quilo') {
                logisticsUnit = 'Quilo';
                outputUnit = 'kg';
            }

            // Sanitização simples para evitar quebras no CSV
            const row = [
                name.replace(/;/g, ','),
                category.replace(/;/g, ','),
                logisticsUnit,
                outputUnit,
                stock,
                unitWeight,
                price
            ];

            csvContent += row.join(';') + "\n";
        });

        // Grava com encoding Windows-1252 para o Excel abrir caracteres especiais (acentos) corretamente no Brasil
        fs.writeFileSync(outputFile, csvContent, { encoding: 'latin1' });
        console.log(`Sucesso! Arquivo Excel gerado: ${outputFile}`);
        console.log(`Total de itens exportados: ${products.length}`);

    } catch (err) {
        console.error(`Erro na exportação: ${err.message}`);
    }
}

exportToCSV();
