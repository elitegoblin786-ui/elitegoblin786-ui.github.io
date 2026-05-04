#!/usr/bin/env python3
"""
Simple tunneling script using pyngrok
"""
import subprocess
import sys

try:
    # Try to install pyngrok if not available
    import pyngrok
except ImportError:
    print("Installing pyngrok...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyngrok"])
    import pyngrok

from pyngrok import ngrok

try:
    # Open tunnel
    public_url = ngrok.connect(8080)
    print(f"\n{'='*60}")
    print(f"PUBLIC URL: {public_url}")
    print(f"{'='*60}")
    print(f"\nShare this link with others to access your website:")
    print(f"{public_url}")
    print(f"\nPress Ctrl+C to stop the tunnel")
    print(f"{'='*60}\n")
    
    # Keep tunnel running
    ngrok_process = ngrok.get_ngrok_process()
    ngrok_process.proc.wait()
    
except KeyboardInterrupt:
    print("\n\nTunnel closed.")
    ngrok.kill()
except Exception as e:
    print(f"Error: {e}")
    ngrok.kill()
