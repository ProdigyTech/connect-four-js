import { useState, forwardRef } from "react";

const Input = (props, ref) => {
  const [inputState, setInputState] = useState("");

  return (
    <input
      value={inputState}
      onChange={(e) => setInputState(e.target.value)}
      className={`input`}
      {...props}
      ref={ref}
    />
  );
};

export default forwardRef(Input);
