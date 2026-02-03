import json

with open(r'c:\Users\Administrator\Desktop\PROJETOS\GestorPro\GestorPro-main\GestorPro\agrogest_backup_2026-01-27 (2).json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    if 'payload' in data:
        print("Keys in payload:", data['payload'].keys())
        if 'fieldApplications' in data['payload']:
            print("Number of fieldApplications:", len(data['payload']['fieldApplications']))
