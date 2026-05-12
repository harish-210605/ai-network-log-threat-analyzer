import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState('');
  const [pcapFile, setPcapFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    if (activeTab === 'logs') {
      const reader = new FileReader();
      reader.onload = (ev) => setLogs(ev.target.result);
      reader.readAsText(file);
    } else {
      setPcapFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (activeTab === 'logs' && !logs.trim()) {
      setError('Please upload a log file or paste log content.');
      return;
    }
    if (activeTab === 'pcap' && !pcapFile) {
      setError('Please upload a pcap file.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let res;
      if (activeTab === 'logs') {
        res = await axios.post('http://127.0.0.1:5000/analyze', { logs });
      } else {
        const formData = new FormData();
        formData.append('file', pcapFile);
        res = await axios.post('http://127.0.0.1:5000/analyze-pcap', formData);
      }
      setResult(res.data);
    } catch (err) {
      setError('Failed to connect to backend. Make sure Flask is running.');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setLogs('');
    setPcapFile(null);
    setResult(null);
    setError('');
    setFileName('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setResult(null);
    setLogs('');
    setPcapFile(null);
    setFileName('');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <div>
              <h1>AI Network & Log Threat Analyzer</h1>
              <p>AI powered Cybersecurity Threat Detection</p>
            </div>
          </div>
          {result && (
            <button className="btn-outline" onClick={handleReset}>
              ↩ Analyze New File
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {!result ? (
          <div className="upload-section">
            <div className="upload-card">

              {/* Tabs */}
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('logs')}
                >
                  📄 Log File Analyzer
                </button>
                <button
                  className={`tab ${activeTab === 'pcap' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('pcap')}
                >
                  🌐 Network Traffic (PCAP)
                </button>
              </div>

              {activeTab === 'logs' ? (
                <>
                  <h2>Upload Log File</h2>
                  <p className="subtitle">Supports auth logs, Apache/Nginx logs, syslog, or any server log format</p>

                  <label className="file-drop">
                    <input type="file" accept=".log,.txt,.csv" onChange={handleFileUpload} hidden />
                    <span className="drop-icon">📂</span>
                    <span className="drop-text">{fileName || 'Click to upload a log file'}</span>
                    <span className="drop-sub">.log, .txt, .csv supported</span>
                  </label>

                  <div className="divider"><span>or paste logs directly</span></div>

                  <textarea
                    className="log-input"
                    placeholder="Paste your log content here..."
                    value={logs}
                    onChange={(e) => setLogs(e.target.value)}
                    rows={10}
                  />

                  <div className="sample-section">
                    <p className="sample-label">No log file? Try a sample:</p>
                    <button className="btn-sample" onClick={() => {
                      setLogs(`192.168.1.105 - - [11/May/2026:08:21:01 +0000] "GET /admin HTTP/1.1" 401 512
192.168.1.105 - - [11/May/2026:08:21:03 +0000] "GET /admin HTTP/1.1" 401 512
192.168.1.105 - - [11/May/2026:08:21:05 +0000] "GET /admin HTTP/1.1" 401 512
192.168.1.105 - - [11/May/2026:08:21:07 +0000] "GET /admin HTTP/1.1" 401 512
192.168.1.105 - - [11/May/2026:08:21:09 +0000] "GET /admin HTTP/1.1" 401 512
10.0.0.22 - - [11/May/2026:08:45:00 +0000] "GET /index.php?id=1' OR '1'='1 HTTP/1.1" 200 1024
10.0.0.55 - - [11/May/2026:09:10:00 +0000] "GET /login HTTP/1.1" 200 2048
203.0.113.42 - - [11/May/2026:03:15:00 +0000] "POST /wp-login.php HTTP/1.1" 200 512
198.51.100.7 - - [11/May/2026:10:00:01 +0000] "GET /?page=../../../../etc/passwd HTTP/1.1" 200 342
192.168.1.200 - - [11/May/2026:10:05:00 +0000] "GET /normal-page HTTP/1.1" 200 1024`);
                      setFileName('sample-logs.log');
                    }}>
                      Load Sample Logs
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2>Upload PCAP File</h2>
                  <p className="subtitle">Upload a network packet capture file to detect suspicious traffic patterns</p>

                  <label className="file-drop">
                    <input type="file" accept=".pcap,.pcapng,.cap" onChange={handleFileUpload} hidden />
                    <span className="drop-icon">🌐</span>
                    <span className="drop-text">{fileName || 'Click to upload a PCAP file'}</span>
                    <span className="drop-sub">.pcap, .pcapng, .cap supported</span>
                  </label>

                  <div className="pcap-info">
                    <p>💡 <strong>What is a PCAP file?</strong> It's a network traffic recording captured by tools like Wireshark, tcpdump, or your router. It contains raw packet data that AI can analyze for threats like port scans, C2 beaconing, and data exfiltration.</p>
                    <p style={{marginTop: '0.75rem'}}>🧪 <strong>Need a sample?</strong> Download one from <a href="https://wiki.wireshark.org/SampleCaptures" target="_blank" rel="noreferrer" style={{color: '#4f7fff'}}>Wireshark Sample Captures</a></p>
                  </div>
                </>
              )}

              {error && <div className="error-box">⚠️ {error}</div>}

              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || (activeTab === 'logs' ? !logs.trim() : !pcapFile)}
              >
                {loading ? (
                  <span className="loading-text">
                    <span className="spinner" /> Analyzing {activeTab === 'logs' ? 'logs' : 'network traffic'}...
                  </span>
                ) : (
                  `🔍 Analyze ${activeTab === 'logs' ? 'Logs' : 'Network Traffic'}`
                )}
              </button>
            </div>
          </div>
        ) : (
          <Dashboard result={result} fileName={fileName} mode={activeTab} />
        )}
      </main>
    </div>
  );
}

export default App;