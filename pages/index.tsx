import Input from "../src/components/Input";
import Button from "../src/components/Button";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useGameContext } from "../src/context/game-context";
import React from "react";

export default function Home() {
  const router = useRouter();
  const [inputState, setInputState] = useState("");
  const [error, setError] = useState("")
   const { joinRoom } = useGameContext();

  const goToRoom = async(e: React.MouseEvent<HTMLElement>, id: String) => {
    if (inputState.length || id?.length) {
      e.preventDefault();
      joinRoom(`${id || inputState}`);
      // @ts-ignore
      window.connectFour = true;
      router.push(`/game/${id || inputState}`);
    } else {
      setError("You must enter a valid game ID or go to a random room")
      setTimeout(() => {setError("")}, 7000)
    }
  };

  return (
    <div className="layout">
      <div className="tagline">
        <h2> Online Connect Four </h2>
      </div>
      <Input
        onChange={(e: React.MouseEvent<HTMLInputElement>) =>
          // @ts-ignore
          setInputState(e.target.value)
        }
        value={inputState}
        placeholder={"Enter a Game ID"}
      />
      {error.length > 0 && <div className="error"> {error} </div>}
      <Button
        buttonText="Go To Game"
        onClick={goToRoom}
      ></Button>
      <Button
        buttonText="Generate Random Room"
        disabled={inputState.length > 0}
        onClick={(e: React.MouseEvent<HTMLElement>) => goToRoom(e, uuidv4())}
      ></Button>
    </div>
  );
}
