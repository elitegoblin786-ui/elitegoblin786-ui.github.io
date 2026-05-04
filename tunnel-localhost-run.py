#!/usr/bin/env python3
"""
Create public tunnel using localhost.run (simple SSH tunnel)
"""
import subprocess
import time

print("\n" + "="*70)
print("Creating public access link for your website...")
print("="*70 + "\n")

try:
    # Try direct SSH tunnel to localhost.run
    cmd = ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null',
           '-R', '80:localhost:8080', 'localhost.run']
    
    print("Connecting to localhost.run (free tunneling service)...")
    print("Waiting for public URL...\n")
    
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
                             text=True, bufsize=1)
    
    # Read output line by line
    lines_read = 0
    for line in process.stdout:
        print(line.rstrip())
        lines_read += 1
        
        # Look for URL patterns
        if 'localhost.run' in line or 'https://' in line:
            print("\n" + "="*70)
            print("✓ SUCCESS! Your website is now publicly accessible!")
            print("="*70)
            print("\nShare this link with others - they can access it from any device/network!")
            print("\nTunnel is active. Press Ctrl+C to stop.\n")
        
        if lines_read > 100:  # Safety limit
            break
    
    process.wait()
    
except KeyboardInterrupt:
    print("\n\nTunnel closed.")
    process.terminate()
except FileNotFoundError:
    print("SSH client not found. Please install OpenSSH:")
    print("  - Windows: Settings → Apps → Optional features → Add feature → Search for 'OpenSSH Client'")
    print("  - Or use: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0")
except Exception as e:
    print(f"Error: {e}")
    print("\nAlternative: Deploy using Render (already configured)")
    print("  1. Push your code to GitHub")
    print("  2. Connect your GitHub repo to Render.com")
    print("  3. Render will auto-deploy and give you a public URL")
