/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
export function handle_error(error: Error) {
  console.error(`Failed to execute content script: ${error.message}`);
}
