=# 🛡️ AI Network & Log Threat Analyzer
An AI-powered cybersecurity tool that detects threats in server logs and network packet captures using Google Gemini AI.

## 📸 Screenshots
### Upload Page
<img width="2545" height="1396" alt="Image" src="https://github.com/user-attachments/assets/7b28aac4-e551-4e09-bd9c-1bbf16a03e4c" />
<img width="2537" height="1383" alt="Image" src="https://github.com/user-attachments/assets/74478b64-5159-4e74-b151-e6105cb15c9d" />

### Log Analyzer Dashboard
<img width="2537" height="1383" alt="Image" src="https://github.com/user-attachments/assets/a1438e04-96ab-4fe9-badb-cb4ad6329aab" />
<img width="2537" height="1383" alt="Image" src="https://github.com/user-attachments/assets/3b1bdfd1-f4d9-4051-8049-79bcc5c76181" />

### Network Traffic Analyzer
<img width="2545" height="1396" alt="Image" src="https://github.com/user-attachments/assets/6c6a9113-aa23-43e5-9719-33f7b9472386" />
<img width="2545" height="1396" alt="Image" src="https://github.com/user-attachments/assets/f884488b-0763-4ca6-a19e-970d952395d9" />
<img width="2545" height="1396" alt="Image" src="https://github.com/user-attachments/assets/96d87648-c3b9-4881-926f-0fd7e49b95b8" />

## 📌 Features
- 📄 Log File Analyzer — Detects brute force, SQL injection, directory traversal, suspicious logins
- 🌐 Network Traffic Analyzer — Analyzes PCAP files for port scans, C2 beaconing, data exfiltration
- 📊 Visual Dashboard — Risk score, severity pie chart, threat type bar chart
- 🔍 AI Threat Cards — Severity badge, raw log line, plain-English explanation, fix recommendation
- ⚡ Powered by Google Gemini 2.5 Flash AI

## 🛠️ Tech Stack
- Python 3
- Flask
- React
- Recharts
- Google Gemini API
- tshark / Wireshark

## 📦 Installation
```bash
git clone https://github.com/Harish-210605/AI-Network-Log-Threat-Analyzer.git
cd AI-Network-Log-Threat-Analyzer

cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors google-genai python-dotenv
echo "GEMINI_API_KEY=your_key_here" > .env

cd ../frontend
npm install
```

## 🚀 Usage
### Start Backend
```bash
cd backend
source venv/bin/activate
python3 app.py
```
### Start Frontend
```bash
cd frontend
npm start
# Open http://localhost:3000
```

## 🎯 Supported Input Formats
- Server logs: `.log`, `.txt`, `.csv`
- Network captures: `.pcap`, `.pcapng`, `.cap`

## ⚠️ Disclaimer
For educational and authorized security testing purposes only.
Do not use on systems you do not own or have explicit permission to test.
