import React, { PropsWithChildren } from "react";
import { TransactionContext } from "~/contexts/transactioncontext";

export const TransactionContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const submitJob = function <T>(
    job: Promise<T>,
    onDone?: (result: T) => void
  ) {
    setIsProcessing(true);
    job
      .then((result) => {
        setIsProcessing(false);
        if (onDone) {
          onDone(result);
        }
      })
      .catch(() => {
        setIsProcessing(false); // Ensure the state resets on failure too
      });
  };

  return (
    <TransactionContext.Provider value={{ submitJob, isProcessing }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = React.useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactionContext must be used within an TransactionContextProvider"
    );
  }
  return context;
};
