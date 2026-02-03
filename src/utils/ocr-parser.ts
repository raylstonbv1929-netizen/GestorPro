/**
 * Utilitário de análise de texto OCR para o Sistema Sentinel.
 * Focado em extrair padrões financeiros brasileiros de texto bruto.
 */

export interface ExtractedData {
    amount: string;
    date: string;
    description: string;
}

export const parseOCRText = (text: string): ExtractedData => {
    // 1. Limpeza básica
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let amount = '';
    let date = '';
    let description = '';

    // 2. Procura por valores monetários (R$ XX,XX ou apenas XX,XX)
    // Padrão: R$ opcional, seguido de números com ponto/vírgula
    const amountRegex = /(?:R\$|VALOR|TOTAL|PAGO)\s*[:=]?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
    const fallbackAmountRegex = /(\d{1,3}(?:\.\d{3})*,\d{2})/g;

    const amountMatches = Array.from(text.matchAll(amountRegex));
    if (amountMatches.length > 0) {
        // Pega o último "Total" ou o maior valor geralmente é o total
        amount = amountMatches[amountMatches.length - 1][1];
    } else {
        const fallbackMatches = Array.from(text.matchAll(fallbackAmountRegex));
        if (fallbackMatches.length > 0) {
            // Se houver vários, tentamos pegar um que pareça um total (geralmente no fim do recibo)
            amount = fallbackMatches[fallbackMatches.length - 1][1];
        }
    }

    // 3. Procura por datas (DD/MM/AAAA ou DD/MM/AA)
    const dateRegex = /(\d{2}\/\d{2}\/(?:\d{4}|\d{2}))/g;
    const dateMatches = Array.from(text.matchAll(dateRegex));
    if (dateMatches.length > 0) {
        // Geralmente a primeira data é a da emissão/pagamento
        const rawDate = dateMatches[0][1];
        if (rawDate.length === 8) { // DD/MM/AA
            const parts = rawDate.split('/');
            date = `20${parts[2]}-${parts[1]}-${parts[0]}`; // Simplista, assume 20xx
        } else { // DD/MM/AAAA
            const parts = rawDate.split('/');
            date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    } else {
        // Fallback para data de hoje se não encontrar
        date = new Date().toISOString().split('T')[0];
    }

    // 4. Descrição (Tenta pegar a primeira linha significativa ou o nome da empresa)
    // Evita linhas que contém apenas números ou símbolos
    const possibleDescriptions = lines.filter(l =>
        l.length > 5 &&
        !l.includes('R$') &&
        !l.includes('/') &&
        !/^\d+$/.test(l)
    );

    if (possibleDescriptions.length > 0) {
        description = possibleDescriptions[0].toUpperCase();
    } else if (lines.length > 0) {
        description = lines[0].toUpperCase();
    }

    return {
        amount,
        date,
        description: description.substring(0, 50) // Limita tamanho
    };
};
