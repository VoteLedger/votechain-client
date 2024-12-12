// Load transaction context to check if user has some processing transactions

import { useTransactionContext } from "~/providers/transactioncontextprovider";
import { Button } from "../ui/button";

export const JobsDropDown: React.FC = () => {
  const { jobs } = useTransactionContext();

  return <Button>Click here! {jobs.length}</Button>;
};
