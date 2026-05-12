# 🛡️ AI Network & Log Threat Analyzer

An AI-powered cybersecurity tool that analyzes server logs and network packet captures (PCAP) to detect threats in real time using Google Gemini AI.

## 🔍 Features
- 📄 **Log File Analyzer** — Detects brute force, SQL injection, directory traversal, suspicious logins from server/auth logs
- 🌐 **Network Traffic Analyzer** — Analyzes PCAP files to identify port scans, C2 beaconing, data exfiltration
- 📊 **Visual Dashboard** — Risk score, severity pie chart, threat type bar chart, detailed threat cards with AI explanations
- ⚡ **Powered by Google Gemini 2.5 Flash AI**

## 🛠️ Tech Stack
- **Frontend:** React, Recharts
- **Backend:** Python, Flask
- **AI:** Google Gemini API
- **Network Parsing:** tshark / Wireshark

## ⚙️ Setup & Installation

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors google-genai python-dotenv
```

Create `.env` file:
```
GEMINI_API_KEY=your_key_here
```

```bash
python3 app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🚀 Usage
1. Open `http://localhost:3000`
2. Choose **Log File Analyzer** or **Network Traffic (PCAP)** tab
3. Upload a file or paste log content
4. Click **Analyze** and view the threat dashboard

## 📸 Screenshots
### Log Analyzer Dashboard
![Log Analyzer](screenshots/log-dashboard.png)

### Network Traffic Analyzer
![PCAP Analyzer](screenshots/pcap-dashboard.png)
