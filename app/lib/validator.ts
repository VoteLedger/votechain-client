import { CreatePoll } from "~/types/services";

// Adjust the return type to match the actual return values.
// If you're returning a response or errors object, adjust accordingly.
export const validateCreatePoll = (
  create_poll: CreatePoll
): Record<string, string> | null => {
  // **4. Initialize Errors Object**
  const errors: Record<string, string> = {};

  // Destructure necessary fields from create_poll for clarity and consistency
  const {
    name,
    description,
    options: optionsRaw,
    start_time,
    end_time,
  } = create_poll;

  // **6. Validate 'name' Field**
  if (!name || name.trim() === "") {
    errors.name = "Name is required and cannot be empty.";
  }

  // **7. Validate 'description' Field**
  if (!description || description.trim() === "") {
    errors.description = "Description is required.";
  }

  // **8. Validate 'options' Field**
  if (!Array.isArray(optionsRaw)) {
    errors.options = "Options must be an array.";
  } else {
    const options = optionsRaw
      .map((opt) => opt.trim())
      .filter((opt) => opt !== "");

    if (options.length < 2) {
      errors.options = "At least two options are required.";
    }
  }

  // **9. Validate 'startTime' and 'endTime' Fields**
  if (!start_time) {
    errors.startTime = "Start time is required.";
  }

  if (!end_time) {
    errors.endTime = "End time is required.";
  }

  if (start_time) {
    if (isNaN(start_time.getTime())) {
      errors.startTime = "Start time must be a valid date and time.";
    }
  }

  if (end_time) {
    if (isNaN(end_time.getTime())) {
      errors.endTime = "End time must be a valid date and time.";
    }
  }

  if (
    start_time &&
    end_time &&
    !isNaN(start_time.getTime()) &&
    !isNaN(end_time.getTime())
  ) {
    if (end_time <= start_time) {
      errors.endTime = "End time must be after start time.";
    }
  }

  // **10. Check for Validation Errors**
  if (Object.keys(errors).length > 0) {
    // Instead of returning a Response object, return the errors.
    // Handling the response should be done outside this function.
    return errors;
  }

  // Optionally, return sanitized data or null if no errors
  // Here, returning null to indicate no validation errors
  return null;
};
