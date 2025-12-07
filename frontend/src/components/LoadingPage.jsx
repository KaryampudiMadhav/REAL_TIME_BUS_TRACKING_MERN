import React from "react";

const FullPageLoader = () => {
  return (
    // Main container: Fixed position to cover the entire viewport
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      {/* Container for the stylish icon. It's a flex container to center the SVG. */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* The spinning border element. It's positioned absolutely to sit behind the icon. */}
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>

        {/* The Bus Icon in the center (it does not spin) */}
        <svg
          className="h-16 w-16 text-blue-600" // Sized down to fit inside the spinner
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          role="img"
          aria-label="loading icon"
        >
          <path d="M20 8H4V6H20V8ZM20 18H4V12H20V18ZM21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H4C4 21.1 4.9 22 6 22C7.1 22 8 21.1 8 20H16C16 21.1 16.9 22 18 22C19.1 22 20 21.1 20 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4ZM6.5 21C6.22 21 6 20.78 6 20.5C6 20.22 6.22 20 6.5 20C6.78 20 7 20.22 7 20.5C7 20.78 6.78 21 6.5 21ZM17.5 21C17.22 21 17 20.78 17 20.5C17 20.22 17.22 20 17.5 20C17.78 20 18 20.22 18 20.5C18 20.78 17.78 21 17.5 21Z" />
        </svg>
      </div>

      {/* Optional Loading Text */}
      <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
        Loading...
      </p>
    </div>
  );
};

export default FullPageLoader;
