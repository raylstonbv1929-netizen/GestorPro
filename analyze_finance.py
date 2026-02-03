import json

file_path = r'c:\Users\Administrator\Desktop\PROJETOS\GestorPro\GestorPro-main\GestorPro\agrogest_backup_2026-01-27 (2).json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

transactions = data.get('payload', {}).get('transactions', [])

print(f"Total transactions found: {len(transactions)}")

# Analyze categories
categories = set()
for t in transactions:
    categories.add(t.get('category'))

print("Categories found in backup:", sorted(list(categories)))

# Check for date errors
for t in transactions:
    date = t.get('date', '')
    if len(date) > 10 or date.startswith('22'):
        print(f"Suspicious date: {date} in transaction {t.get('id')} ({t.get('description')})")

# Check types
types = set()
for t in transactions:
    types.add(t.get('type'))
print("Types found:", types)
