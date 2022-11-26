import Layout from "../src/components/Layouts";
import Input from "../src/components/Input";
import Button from "../src/components/Button";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useAppContext } from "../src/context/socket-context";

export default function Home() {
  const router = useRouter();
  const [inputState, setInputState] = useState("");
   const { joinRoom } = useAppContext();

  const goToRoom = async(e: React.MouseEvent<HTMLElement>, id: String) => {
    if (inputState.length || id.length) {
      e.preventDefault();
      joinRoom(`${id || inputState}`)
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
