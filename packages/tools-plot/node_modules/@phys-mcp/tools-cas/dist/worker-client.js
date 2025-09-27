/**
 * Client for communicating with the Python worker process
 */
import { spawn, spawnSync } from "child_process";
import { randomUUID } from "crypto";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class PythonWorkerClient {
    proc = null;
    pending = new Map();
    buffer = "";
    /**
     * Ensure the Python worker process is running. On Windows, prefer the 'py' launcher
     * if PYTHON_PATH is not set. Elsewhere, default to 'python'.
     */
    ensureProcess() {
        if (this.proc)
            return;
        // Find the Python worker script
        const workerPath = path.resolve(__dirname, "../../../python-worker/worker.py");
        // Resolve Python executable by probing candidates
        const pythonFromEnv = process.env.PYTHON_PATH?.trim();
        const username = process.env.USERNAME || process.env.USER || '';
        const winCandidatesAbs = [
            `C:\\Python313\\python.exe`,
            `C:\\Python312\\python.exe`,
            `C:\\Python311\\python.exe`,
            username ? `C:\\Users\\${username}\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe` : ''
        ].filter(Boolean);
        const candidates = [
            ...(pythonFromEnv ? [pythonFromEnv] : []),
            ...(process.platform === 'win32' ? ['py', 'python', 'python3', ...winCandidatesAbs] : ['python', 'python3'])
        ];
        let pythonCmd = null;
        for (const cmd of candidates) {
            try {
                const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
                if (probe.error)
                    continue;
                if (probe.status === 0 || probe.status === null) {
                    pythonCmd = cmd;
                    break;
                }
            }
            catch {
                // try next
            }
        }
        if (!pythonCmd) {
            throw new Error("No suitable Python interpreter found. Set PYTHON_PATH or install Python.");
        }
        console.log(`Starting Python worker: ${workerPath} (cmd: ${pythonCmd})`);
        const isWin = process.platform === 'win32';
        if (isWin) {
            const cmdString = `"${pythonCmd}" "${workerPath}"`;
            this.proc = spawn(cmdString, {
                stdio: ["pipe", "pipe", "inherit"],
                cwd: path.dirname(workerPath),
                shell: true,
            });
        }
        else {
            this.proc = spawn(pythonCmd, [workerPath], {
                stdio: ["pipe", "pipe", "inherit"],
                cwd: path.dirname(workerPath)
            });
        }
        this.proc.stdout?.on("data", (data) => {
            this.buffer += data.toString();
            this.processBuffer();
        });
        this.proc.on("error", (error) => {
            console.error("Python worker error:", error);
            this.rejectAllPending(error);
        });
        this.proc.on("exit", (code) => {
            console.log(`Python worker exited with code ${code}`);
            this.proc = null;
            this.rejectAllPending(new Error(`Worker process exited with code ${code}`));
        });
    }
    processBuffer() {
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop() || ""; // Keep incomplete line in buffer
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const response = JSON.parse(line);
                const pending = this.pending.get(response.id);
                if (pending) {
                    this.pending.delete(response.id);
                    if (response.error) {
                        pending.reject(new Error(response.error.message || "Unknown error"));
                    }
                    else {
                        pending.resolve(response.result);
                    }
                }
            }
            catch (error) {
                console.error("Failed to parse worker response:", line, error);
            }
        }
    }
    rejectAllPending(error) {
        for (const pending of this.pending.values()) {
            pending.reject(error);
        }
        this.pending.clear();
    }
    async call(method, params) {
        this.ensureProcess();
        const id = randomUUID();
        const request = { id, method, params };
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            const payload = JSON.stringify(request) + "\n";
            this.proc.stdin?.write(payload);
        });
    }
    shutdown() {
        if (this.proc) {
            this.proc.kill();
            this.proc = null;
        }
        this.rejectAllPending(new Error("Worker client shutdown"));
    }
}
// Singleton instance
let workerClient = null;
export function getWorkerClient() {
    if (!workerClient) {
        workerClient = new PythonWorkerClient();
    }
    return workerClient;
}
export function shutdownWorkerClient() {
    if (workerClient) {
        workerClient.shutdown();
        workerClient = null;
    }
}
