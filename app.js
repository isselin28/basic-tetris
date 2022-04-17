document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const ScoreDisplay = document.querySelector("#score");
  const StartBtn = document.querySelector("#start-button");
  const StartOverBtn = document.querySelector("#start-over-button");

  const miniGrid = document.querySelector(".mini-grid");

  const width = 10;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  let speed = 500;

  // cream, yellow, green, orange, red
  const colors = ["#e9d8a6", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];

  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];

  const theTetrominoes = [
    lTetromino,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ];

  let currentPosition = 4;
  let currentRotation = 0;
  //randomly select tetromino
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  //draw the tetromino
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  //undraw the tetromino
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
      squares[currentPosition + index].style.backgroundColor = "";
    });
  }

  //assign functions to keyCode
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }

  function spacebar(e) {
    if (e.keyCode === 32) {
      startPauseButton();
    }
  }
  document.addEventListener("keyup", spacebar);

  //move down function
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  //freeze function when reach bottom
  function freeze() {
    const isReachBottom = current.some((index) =>
      squares[currentPosition + index + width].classList.contains("taken")
    );

    if (isReachBottom) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("taken")
      );

      //start a new tetromino falling
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      gameOver();
      draw();
      displayShape();
      addScore();
    }
  }

  //move the tetromino left, unless it's at edge or there's blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % 10 === 0
    );

    if (!isAtLeftEdge) currentPosition -= 1;

    const isTaken = current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    );

    if (isTaken) currentPosition += 1;

    draw();
  }

  //move the tetromino right, unless it's at edge or there's blockage
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );

    if (!isAtRightEdge) currentPosition += 1;

    const isTaken = current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    );

    if (isTaken) currentPosition -= 1;

    draw();
  }

  //check if tetromino rotates over the edge
  function isAtRight() {
    return current.some((index) => (currentPosition + index + 1) % width === 0);
  }

  function isAtLeft() {
    return current.some((index) => (currentPosition + index) % width === 0);
  }

  function checkRotatedPosition(P) {
    P = P || currentPosition;

    const rightOverflowPosition = (P + 1) % width < 4;
    const leftOverflowPosition = P % width > 5;

    if (isAtRight()) {
      if (rightOverflowPosition) {
        currentPosition += 1;
        checkRotatedPosition(P);
      }
    }

    if (!rightOverflowPosition && isAtLeft()) {
      if (leftOverflowPosition) {
        currentPosition -= 1;
        checkRotatedPosition(P);
      }
    }
  }

  //rotate the tetromino
  function rotate() {
    undraw();
    currentRotation++;

    if (currentRotation === current.length) {
      // if the current rotation gets to 4, make it go back to 0
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    checkRotatedPosition();
    draw();
  }

  // show up next tetromino in mini-frid
  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  const displayIndex = 0;

  // the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
    [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
    [0, 1, displayWidth, displayWidth + 1], //oTetromino
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //iTetromino
  ];

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino from the entire grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });

    // shifting the next tetromino css for display purpose
    if (nextRandom === 1 || nextRandom === 3) {
      miniGrid.style.marginLeft = "40px";
    }
    if (nextRandom === 2 || nextRandom === 4) {
      miniGrid.style.marginLeft = "20px";
    }
    if (nextRandom === 0) {
      miniGrid.style.marginLeft = "0px";
    }

    upNextTetrominoes[nextRandom].forEach((index) => {
      return [
        displaySquares[displayIndex + index].classList.add("tetromino"),
        (displaySquares[displayIndex + index].style.backgroundColor =
          colors[nextRandom]),
      ];
    });
  }

  //add functionality to the button
  function startPauseButton() {
    if (timerId) {
      //pause game
      clearInterval(timerId);
      timerId = null;
      document.removeEventListener("keyup", control);
    } else {
      //start game
      document.addEventListener("keyup", control);
      draw();
      timerId = setInterval(moveDown, speed);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
      StartOverBtn.style.display = "inline";
    }
  }
  StartBtn.addEventListener("click", () => startPauseButton());

  //add score
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (row.every((index) => squares[index].classList.contains("taken"))) {
        score += 10;
        speed = 500 - score * 5;
        if (speed <= 100) speed = 100;
        timerId = setInterval(moveDown, speed);
        ScoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("taken");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundColor = "";
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }

  //game over
  function gameOver() {
    // if the first line of div on top is taken then its game over
    const isOver = current.some((index) =>
      squares[currentPosition + index].classList.contains("taken")
    );
    if (isOver) {
      ScoreDisplay.innerHTML = "end";
      clearInterval(timerId);
      document.removeEventListener("keyup", control);
    }
  }

  //start over
  StartOverBtn.addEventListener("click", () => {
    for (let i = 0; i < 200; i++) {
      squares[i].classList.remove("taken");
      squares[i].style.backgroundColor = "";
    }
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });

    StartOverBtn.style.display = "none";

    clearInterval(timerId);
    timerId = null;
    score = 0;
    ScoreDisplay.innerHTML = score;
    currentPosition = 4;
  });
});
