import React from "react";

// create custom react hook for validate props
export const useValidTabContent = (props?: any ) => {
  const [error, setError] = React.useState(true);

  React.useEffect(() => {
    if (props) {
      setError(true);
    } else {

      setError(false);
    }
  }, [props]);

  return error;
};
