import { createContext } from "react";

// This context will be used to store transactions that are currently being processed.
// This will allow us to display a loading spinner while the transaction is being processed
// and actually show to the user that it is processing in the background!

// Define a type for a job
export interface Job<T = unknown> {
  info: JobInfo; // Information about the job
  job: Promise<T>; // The job promise
  status: "pending" | "success" | "error"; // Status of the job
  result?: T; // Result of the job
  error?: Error; // Error of the job
}

// Textual job representation
export interface JobInfo {
  id: string | number;
  name: string;
  description: string;
}

interface TransactionContextType {
  submitJob: <T>(
    info: JobInfo,
    job: Promise<T>,
    onDone?: (result: T) => void
  ) => void;
  isProcessing: boolean;
  jobs: Job[];
}

export const TransactionContext = createContext<TransactionContextType>({
  submitJob: () => {
    throw new Error(
      "submitJob must be used within a TransactionContextProvider"
    );
  },
  isProcessing: false,
  jobs: [],
});
