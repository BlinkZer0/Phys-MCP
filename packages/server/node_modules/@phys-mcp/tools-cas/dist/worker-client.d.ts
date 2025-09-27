/**
 * Client for communicating with the Python worker process
 */
declare class PythonWorkerClient {
    private proc;
    private pending;
    private buffer;
    /**
     * Ensure the Python worker process is running. On Windows, prefer the 'py' launcher
     * if PYTHON_PATH is not set. Elsewhere, default to 'python'.
     */
    private ensureProcess;
    private processBuffer;
    private rejectAllPending;
    call(method: string, params: any): Promise<any>;
    shutdown(): void;
}
export declare function getWorkerClient(): PythonWorkerClient;
export declare function shutdownWorkerClient(): void;
export {};
