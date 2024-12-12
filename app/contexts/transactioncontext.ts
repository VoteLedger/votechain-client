import { createContext } from "react";

// This context will be used to store transactions that are currently being processed.
// This will allow us to display a loading spinner while the transaction is being processed
// and actually show to the user that it is processing in the background!

interface TransactionContextType {}

export const TransactionContext = createContext<TransactionContextType>({});
