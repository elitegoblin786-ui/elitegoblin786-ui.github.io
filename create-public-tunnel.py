#!/usr/bin/env python3
"""
Create a public tunnel using SSH reverse tunneling
This uses serveo.net which requires no authentication
"""
import subprocess
import sys
import socket

def get_available_port():
    """Find an available port for SSH"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

print("\n" + "="*60)
print("Setting up public tunnel for your website...")
print("="*60 + "\n")

# Check if SSH is available
try:
    subprocess.run(['ssh', '-V'], capture_output=True, timeout=2)
except (FileNotFoundError, subprocess.TimeoutExpired):
    print("SSH is not available. Installing OpenSSH...")
    subprocess.run(['powershell', '-Command', 'Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0'], 
                   capture_output=True)

try:
    # Create SSH reverse tunnel through serveo.net
    print("Creating tunnel through serveo.net...")
    print("Starting SSH connection to serveo.net for port 8080...")
    
    cmd = ['ssh', '-o', 'StrictHostKeyChecking=no', '-R', '80:localhost:8080', 'serveo.net']
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    print("\n" + "="*60)
    print("TUNNEL ACTIVE!")
    print("="*60)
    print("\nWaiting for public URL from serveo.net...")
    print("(This may take 5-10 seconds...)\n")
    
    # Read output to find the public URL
    for line in process.stdout:
        line = line.strip()
        if line:
            print(line)
            if 'serveo.net' in line:
                print("\n✓ Your website is now publicly accessible!")
                print(f"  Share this URL with others: {line}\n")
    
    print("\nTunnel is running. Press Ctrl+C to stop.\n")
    process.wait()
    
except KeyboardInterrupt:
    print("\n\nTunnel stopped.")
    process.terminate()
except Exception as e:
    print(f"Error: {e}")
