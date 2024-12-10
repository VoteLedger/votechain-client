type Status = "pending" | "success" | "error";

interface Resource<T> {
  read: () => T;
}

export function createResource<T>(promise: Promise<T>): Resource<T> {
  let status: Status = "pending";
  let result: T;
  let error: Error;

  const suspender = promise.then(
    (res) => {
      status = "success";
      result = res;
    },
    (err) => {
      status = "error";
      error = err;
    }
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender; // Suspense catches this Promise
      } else if (status === "error") {
        throw error; // ErrorBoundary catches this error
      } else if (status === "success") {
        return result;
      }
      throw new Error("Unexpected status");
    },
  };
}
