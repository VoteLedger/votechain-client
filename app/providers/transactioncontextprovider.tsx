import React, { PropsWithChildren, useState, useCallback } from "react";
import {
  Job,
  JobInfo,
  TransactionContext,
} from "~/contexts/transactioncontext.client";

export const TransactionContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);

  const submitJob = useCallback(function <T>(
    info: JobInfo,
    job: Promise<T>,
    onDone?: (result: T) => void
  ) {
    // Add the new job to the list of jobs
    setJobs((prevJobs) => [...prevJobs, { info, job, status: "pending" }]);

    job
      .then((result) => {
        // Update the job as successful
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.info.id === j.info.id ? { ...j, status: "success", result } : j
          )
        );
        if (onDone) {
          onDone(result);
        }
      })
      .catch((error) => {
        // Update the job as failed
        setJobs((prevJobs) =>
          prevJobs.map((j) =>
            j.info.id === j.info.id ? { ...j, status: "error", error } : j
          )
        );
      });
  },
  []);

  const isProcessing = jobs.some((job) => job.status === "pending");

  return (
    <TransactionContext.Provider value={{ submitJob, isProcessing, jobs }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = React.useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within a TransactionContextProvider"
    );
  }
  return context;
};
