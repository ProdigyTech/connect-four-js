import Layout from "../components/Layouts";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";

const lastRows = [35, 36, 37, 38, 39, 40, 41];
const indexColumnMap = {
  0: [0, 7, 14, 21, 28, 35],
  1: [1, 8, 15, 22, 29, 36],
  2: [2, 9, 16, 23, 30, 37],
  3: [3, 10, 17, 24, 31, 38],
  4: [4, 11, 18, 25, 32, 39],
  5: [5, 12, 19, 26, 33, 40],
  6: [6, 13, 20, 27, 34, 41],
};


export default function Home() {
  const [gridState, setGridState] = useState([]);
  const [animationInProgress, setAnimationInProgress] = useState(false);
 

 // todo: rework this 
  const findCellPlacement = (initialPos: Number) => {
    const moveBy = 7;
    let previous = initialPos;
    let pos = null;

    let notFound = true;

    if (gridState.includes(initialPos)) return;

    let newPos = initialPos;

    while (notFound) {
      if (gridState.includes(newPos + moveBy)) {
        pos = newPos;
        notFound = false;
      } else {
        previous = newPos;
        newPos = newPos + moveBy;
      }

      if (lastRows.includes(newPos)) {
        switch (newPos) {
          case 35:
            pos = 35;
            notFound = false;
            break;

          case 36:
            pos = 36;
            notFound = false;
            break;

          case 37:
            pos = 37;
            notFound = false;
            break;

          case 38:
            pos = 38;
            notFound = false;
            break;

          case 39:
            pos = 39;
            notFound = false;
            break;

          case 40:
            pos = 40;
            notFound = false;
            break;

          case 41:
            pos = 41;
            notFound = false;
            break;
        }
      }
    }

    return pos;
  };

  // todo rename this
  const thing = (iteration, element) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // add element to end of state array to start animation
        if (iteration == 0) {
          flushSync(() => {
            setGridState((g) => [...g, element]);
            resolve();
          });
        } else {
          flushSync(() => {
            // remove the previous element from the animation, add new element to the array.
            // this simulates "dropping" the chip in the gameboard.
            setGridState((g) => {
              const lastElement = g[g.length - 1];
              const filtered = g.filter((e) => e !== lastElement);
              return [...filtered, element];
            });
            resolve();
          });
        }
      }, 50);
    });
  };

  const onClickCell = async (e: React.MouseEvent<HTMLElement>, i: Number) => {
    flushSync(() => {
      setAnimationInProgress(true);
    });
    const finalPosition = findCellPlacement(i);
    const previousState = gridState;
    let iteration = 0;
    const associatedColumnIndexes = indexColumnMap[i];
    const unusedColumnIndexes = associatedColumnIndexes.filter(
      (d) => !gridState.includes(d)
    );

    for (i of unusedColumnIndexes) {
      await thing(iteration, i);
      iteration++;
    }

    setGridState([...previousState, finalPosition]);
    setAnimationInProgress(false);
    
  };
  return (
    <Layout>
      <div className="score-left"></div>
      <div className="grid">
        {Array.from(new Array(42)).map((_, i) => {
          return (
            <div
              className={`cell ${i} ${gridState.includes(i) ? "fill" : ""}`}
              onClick={
                animationInProgress
                  ? () => {
                      console.log("onClick blocked, animation in progress");
                    }
                  : (e) => i <= 7 && onClickCell(e, i)
              }
              key={i}
            ></div>
          );
        })}
      </div>
      <div className="score-right"></div>
    </Layout>
  );
}
