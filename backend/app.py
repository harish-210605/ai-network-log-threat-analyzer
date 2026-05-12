from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
import os
import re
import json
import tempfile
import subprocess

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def parse_logs(log_text):
    lines = [line.strip() for line in log_text.strip().split('\n') if line.strip()]
    return lines

def chunk_logs(lines, chunk_size=50):
    for i in range(0, len(lines), chunk_size):
        yield lines[i:i + chunk_size]

def analyze_chunk(chunk_text):
    prompt = f"""You are a cybersecurity expert analyzing server logs for threats.
Analyze these log entries and identify ANY suspicious activity.

Respond ONLY in this exact JSON format, nothing else, no markdown, no backticks:
{{
  "threats": [
    {{
      "type": "threat type (e.g. Brute Force, Port Scan, Suspicious Login, SQL Injection, etc.)",
      "severity": "High or Medium or Low",
      "line": "the exact log line that triggered this",
      "explanation": "1-2 sentence plain English explanation of why this is suspicious",
      "recommendation": "one short actionable fix"
    }}
  ],
  "summary": "2-3 sentence overall summary of what you found"
}}

If no threats found, return {{"threats": [], "summary": "No suspicious activity detected in this log segment."}}

Log entries:
{chunk_text}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    return json.loads(raw)

def analyze_pcap_chunk(packets_text):
    prompt = f"""You are a cybersecurity expert analyzing network packet data for threats.
Analyze these network packets and identify ANY suspicious activity.

Respond ONLY in this exact JSON format, nothing else, no markdown, no backticks:
{{
  "threats": [
    {{
      "type": "threat type (e.g. Port Scan, C2 Beaconing, DNS Tunneling, Data Exfiltration, ARP Spoofing, etc.)",
      "severity": "High or Medium or Low",
      "line": "the exact packet info that triggered this",
      "explanation": "1-2 sentence plain English explanation of why this is suspicious",
      "recommendation": "one short actionable fix"
    }}
  ],
  "summary": "2-3 sentence overall summary of what you found"
}}

If no threats found, return {{"threats": [], "summary": "No suspicious activity detected in these packets."}}

Network packet data:
{packets_text}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    return json.loads(raw)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    log_text = data.get('logs', '')

    if not log_text.strip():
        return jsonify({'error': 'No log content provided'}), 400

    lines = parse_logs(log_text)
    all_threats = []
    summaries = []

    for chunk in chunk_logs(lines, chunk_size=50):
        chunk_text = '\n'.join(chunk)
        result = analyze_chunk(chunk_text)
        all_threats.extend(result.get('threats', []))
        summaries.append(result.get('summary', ''))

    high = len([t for t in all_threats if t['severity'] == 'High'])
    medium = len([t for t in all_threats if t['severity'] == 'Medium'])
    low = len([t for t in all_threats if t['severity'] == 'Low'])

    if high > 0:
        overall_risk = 'High'
    elif medium > 0:
        overall_risk = 'Medium'
    else:
        overall_risk = 'Low'

    return jsonify({
        'threats': all_threats,
        'summary': ' '.join(summaries),
        'stats': {
            'total': len(all_threats),
            'high': high,
            'medium': medium,
            'low': low,
            'lines_analyzed': len(lines),
            'overall_risk': overall_risk
        }
    })

@app.route('/analyze-pcap', methods=['POST', 'OPTIONS'])
def analyze_pcap():
    if request.method == 'OPTIONS':
        return '', 200

    if 'file' not in request.files:
        return jsonify({'error': 'No pcap file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    with tempfile.NamedTemporaryFile(suffix='.pcap', delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            ['tshark', '-r', tmp_path,
             '-T', 'fields',
             '-e', 'frame.number',
             '-e', 'ip.src',
             '-e', 'ip.dst',
             '-e', 'ipv6.src',
             '-e', 'ipv6.dst',
             '-e', 'ip.proto',
             '-e', 'tcp.srcport',
             '-e', 'tcp.dstport',
             '-e', 'udp.srcport',
             '-e', 'udp.dstport',
             '-e', 'frame.len',
             '-e', '_ws.col.Protocol',
             '-e', '_ws.col.Info',
             '-E', 'header=y',
             '-E', 'separator=,'],
             capture_output=True, text=True, timeout=30
        )
        packets_text = result.stdout

        if result.stderr:
            print(f"TSHARK STDERR: {result.stderr}")

        if not packets_text.strip():
            return jsonify({'error': 'Could not parse pcap file. Make sure it is a valid pcap.'}), 400

        lines = packets_text.strip().split('\n')
        all_threats = []
        summaries = []

        for chunk in chunk_logs(lines, chunk_size=50):
            chunk_text = '\n'.join(chunk)
            result_chunk = analyze_pcap_chunk(chunk_text)
            all_threats.extend(result_chunk.get('threats', []))
            summaries.append(result_chunk.get('summary', ''))

        high = len([t for t in all_threats if t['severity'] == 'High'])
        medium = len([t for t in all_threats if t['severity'] == 'Medium'])
        low = len([t for t in all_threats if t['severity'] == 'Low'])

        if high > 0:
            overall_risk = 'High'
        elif medium > 0:
            overall_risk = 'Medium'
        else:
            overall_risk = 'Low'

        return jsonify({
            'threats': all_threats,
            'summary': ' '.join(summaries),
            'stats': {
                'total': len(all_threats),
                'high': high,
                'medium': medium,
                'low': low,
                'lines_analyzed': len(lines),
                'overall_risk': overall_risk
            }
        })

    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Pcap file too large or tshark timed out'}), 500
    except Exception as e:
        print(f"PCAP ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        os.unlink(tmp_path)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)