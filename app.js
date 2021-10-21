document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const rotateBtn = document.getElementById('rotate')
  const leftBtn = document.getElementById('left')
  const rightBtn = document.getElementById('right')
  const downBtn = document.getElementById('down')

  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0
  let isGameStart = false;
  const defaultPower = 100;
  const doublePower = 200;
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue'
  ]

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  console.log(theTetrominoes[0][0])

  //randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  //draw the Tetromino
  function draw() {
    current.forEach(position => {
      squares[currentPosition + position].classList.add('tetromino')
      squares[currentPosition + position].style.backgroundColor = colors[random]
    })
  }

  //undraw the Tetromino
  function undraw() {
    current.forEach(position => {
      squares[currentPosition + position].classList.remove('tetromino')
      squares[currentPosition + position].style.backgroundColor = ''

    })
  }

  //assign functions to keyCodes
  function control(e) {
    if(!isGameStart) return;
    if(e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }
  document.addEventListener('keyup', control)

  //move down function
  function moveDown() {
    if(!isGameStart) return;
    undraw()
    currentPosition += width
    draw()
    freeze()
    // setTimeout(function(){
    //   freeze()
    // }, 500)
  }

  //freeze function
  function freeze() {
    if(current.some(position => squares[currentPosition + position + width].classList.contains('taken'))) {
      current.forEach(position => squares[currentPosition + position].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    if(!isGameStart) return;
    undraw()
    const isAtLeftEdge = current.some(position => (currentPosition + position) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(position => squares[currentPosition + position].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
  }

  //move the tetromino right, unless is at the edge or there is a blockage
  function moveRight() {
    if(!isGameStart) return;
    undraw()
    const isAtRightEdge = current.some(position => (currentPosition + position) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(position => squares[currentPosition + position].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
  }

  
  ///FIX ROTATION OF TETROMINOS A THE EDGE 
  function isAtRight() {
    return current.some(position=> (currentPosition + position + 1) % width === 0)  
  }
  
  function isAtLeft() {
    return current.some(position=> (currentPosition + position) % width === 0)
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }
  
  //rotate the tetromino
  function rotate() {
    if(!isGameStart) return;
   
    currentRotation ++;
    //if the current rotation gets to 4, make it go back to 0
    if(currentRotation === current.length) currentRotation = 0;
    // get next position
    let newPositions = theTetrominoes[random][currentRotation];
    // check new position already taken, if taken undo rotation and deny rotation
    if(newPositions.some(position => squares[currentPosition + position].classList.contains('taken'))) {
      currentRotation --;
      //if the current rotation gets to -1, make it go back to last position
      if(currentRotation < 0) currentRotation = current.length - 1;
    } else { // rotation possible earse and rotate to new position
      undraw()
      current = newPositions;
      checkRotatedPosition()
      draw()
    }
    
  }
  /////////

  
  
  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0


  //the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( position => {
      displaySquares[displayIndex + position].classList.add('tetromino')
      displaySquares[displayIndex + position].style.backgroundColor = colors[nextRandom]
    })
  }

  //add functionality to the button
  startBtn.addEventListener('click', () => {
    if (timerId) {
      isGameStart = false;
      clearInterval(timerId)
      timerId = null
      startBtn.innerHTML = "Start"
    } else {
      isGameStart = true;
      startBtn.innerHTML = "Pause"
      draw()
      timerId = setInterval(moveDown, 1000)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  })

  // joystick listeners
  rotateBtn.addEventListener('click', rotate);
  leftBtn.addEventListener('click', moveLeft);
  rightBtn.addEventListener('click', moveRight);
  downBtn.addEventListener('click', moveDown);

  //add score
  function addScore() {
    for (let i = 0; i < 199; i +=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(position => squares[position].classList.contains('taken'))) {
        score += defaultPower;
        scoreDisplay.innerHTML = score;
        row.forEach(position => {
          squares[position].classList.remove('taken')
          squares[position].classList.remove('tetromino')
          squares[position].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  //game over
  function gameOver() {
    if(current.some(position => squares[currentPosition + position].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'end';
      clearInterval(timerId);
      isGameStart = false;
    }
  }

})
