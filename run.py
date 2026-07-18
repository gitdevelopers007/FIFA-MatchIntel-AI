import subprocess
import sys
import time
import os
import signal

def run():
    print("====================================================")
    print("             FIFA MatchIntel AI Launcher            ")
    print("====================================================")
    
    # 1. Seed database
    print("\n[1/3] Checking and Seeding Database...")
    try:
        # Run seeder
        subprocess.run([sys.executable, "backend/seed_db.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to seed database: {e}")
        sys.exit(1)

    # 2. Run FastAPI Backend
    print("\n[2/3] Starting FastAPI Backend on http://localhost:8000...")
    backend_env = os.environ.copy()
    backend_env["PYTHONPATH"] = os.path.abspath(os.path.dirname(__file__))
    
    # uvicorn app.main:app
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        env=backend_env
    )

    # Give backend a moment to bind to the port
    time.sleep(2)

    # 3. Run React Frontend
    print("\n[3/3] Starting Vite React Frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="frontend",
        shell=True
    )

    print("\n[SUCCESS] FIFA MatchIntel AI is fully launched and running!")
    print("  - Frontend: http://localhost:5173")
    print("  - Backend API: http://localhost:8000")
    print("Press Ctrl+C to terminate both servers safely.\n")

    try:
        # Keep launcher alive and monitor processes
        while True:
            time.sleep(1)
            # Check if any process terminated prematurely
            if backend_proc.poll() is not None:
                print("[WARNING] Backend server stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("[WARNING] Frontend server stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        # Terminate processes cleanly
        try:
            if sys.platform == 'win32':
                # On Windows, taskkill is needed to clean up sub-shells spawned by npm run dev
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                backend_proc.terminate()
                frontend_proc.terminate()
        except Exception:
            pass
        print("Done. Goodbye!")

if __name__ == "__main__":
    run()
