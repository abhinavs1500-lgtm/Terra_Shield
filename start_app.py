"""
TerraShield AI — Unified Development Launcher
Starts both FastAPI Backend (port 8000) and Vite Frontend (port 5173).
"""
import subprocess
import time
import sys
import os

def main():
    print("================================================================")
    print("   TERRASHIELD AI — GEOSPATIAL INTELLIGENCE & DIGITAL TWIN      ")
    print("================================================================")
    print("[1/2] Starting FastAPI backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=os.path.dirname(os.path.abspath(__file__))
    )

    time.sleep(2)

    print("[2/2] Starting Vite frontend on http://localhost:5173 ...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    print("\n>>> TerraShield AI is running!")
    print(">>> Frontend: http://localhost:5173")
    print(">>> Backend Docs: http://127.0.0.1:8000/docs")
    print(">>> Press Ctrl+C to stop both servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping TerraShield AI...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
