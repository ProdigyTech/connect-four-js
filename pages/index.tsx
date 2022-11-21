import Layout from "../components/Layouts";
import Input from "../components/Input";
import Button from "../components/Button";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [inputState, setInputState] = useState("");

  const goToRoom = (e: React.MouseEvent<HTMLElement>, id: String) => {
    if (inputState.length || id.length) {
      e.preventDefault();
      router.push(`/game/${id || inputState}`);
    }
  };

  return (
    <>
      <Input
        onChange={(e: React.MouseEvent<HTMLInputElement>) =>
          setInputState(e.target.value)
        }
        value={inputState}
        placeholder={"Enter a Game ID"}
      />
      <Button
        buttonText="Go To Room"
        onClick={goToRoom}
        disabled={inputState.length == 0}
      ></Button>
      <Button
        buttonText="Generate Random Room"
        disabled={inputState.length > 0}
        onClick={(e: React.MouseEvent<HTMLElement>) => goToRoom(e, uuidv4())}
      ></Button>
    </>
  );
}
