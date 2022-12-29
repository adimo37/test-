const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const cw = canvas.width;
const ch = canvas.height;
context.scale(20, 20);
const player = {
   position: { x: 0, y: 0 },
   matrix: createPiece("I"),
   score: 0,
};

function arenaSweep() {
   let rowCount = 1;
   outer: for (let y = arena.length - 1; y > 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
         if (arena[y][x] == 0) {
            continue outer;
         }
      }

      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
      player.score += rowCount * 10;
      rowCount *= 2;
   }
}

function collide(arena, player) {
   const [matrix, offset] = [player.matrix, player.position];
   for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < matrix[y].length; ++x) {
         if (
            matrix[y][x] !== 0 &&
            (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0
         ) {
            return true;
         }
      }
   }
   return false;
}

function createMatrix(w, h) {
   const matrix = [];
   while (h--) {
      matrix.push(new Array(w).fill(0));
   }
   return matrix;
}

function createPiece(type) {
   if (type === "T") {
      return [
         [0, 0, 0],
         [1, 1, 1],
         [0, 1, 0],
      ];
   }
   if (type === "O") {
      return [
         [2, 2],
         [2, 2],
      ];
   }
   if (type === "L") {
      return [
         [0, 3, 0],
         [0, 3, 0],
         [0, 3, 3],
      ];
   }
   if (type === "J") {
      return [
         [0, 4, 0],
         [0, 4, 0],
         [4, 4, 0],
      ];
   }
   if (type === "I") {
      return [
         [0, 1, 0, 0],
         [0, 5, 0, 0],
         [0, 5, 0, 0],
         [0, 5, 0, 0],
      ];
   }
   if (type === "S") {
      return [
         [0, 6, 6],
         [6, 6, 0],
         [0, 0, 0],
      ];
   }
   if (type === "Z") {
      return [
         [7, 7, 0],
         [0, 7, 7],
         [0, 0, 0],
      ];
   }
}

function draw() {
   context.fillStyle = "black";
   context.fillRect(0, 0, cw, ch);
   drawMatrix(arena, { x: 0, y: 0 });
   drawMatrix(player.matrix, player.position);
}

function drawMatrix(matrix, offset) {
   matrix.forEach((row, y) => {
      row.forEach((value, x) => {
         if (value != 0) {
            // console.log(y, x);
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
         }
      });
   });
}

function merge(arena, player) {
   player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
         if (value !== 0) {
            arena[y + player.position.y][x + player.position.x] = value;
         }
      });
   });
}

function playerDrop() {
   player.position.y++;
   if (collide(arena, player)) {
      player.position.y--;
      merge(arena, player);
      playerReset();
      arenaSweep();
      updateScore();
   }
   dropCounter = 0;
}

function playerMove(direction) {
   player.position.x += direction;
   if (collide(arena, player)) {
      player.position.x -= direction;
   }
}

function playerReset() {
   const pieces = "ILJOTSZ";
   player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
   player.position.y = 0;
   player.position.x =
      ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
   if (collide(arena, player)) {
      arena.forEach((row) => row.fill(0));
      player.score = 0;
      updateScore();
   }
}

function playerRotate(direction) {
   const pos = player.position.x;
   let offset = 1;
   rotate(player.matrix, direction);
   if (collide(arena, player)) {
      player.position.y -= direction;
      while (collide(arena, player)) {
         console.log(offset);
         player.position.x += offset;
         console.log(player.position.x);
         offset = -(offset + (offset > 0 ? 1 : -1));
         if (offset > player.matrix[0].length + 1) {
            rotate(player.matrix, -direction);
            player.position.x = pos;
            return;
         }
      }
   }
}

function rotate(matrix, direction) {
   for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
         [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
   }
   if (direction > 0) {
      matrix.forEach((row) => row.reverse());
   } else {
      matrix.reverse();
   }
}

let dropCounter = 0;
let dropInterval = 800;

let lastTime = 0;
function update(time = 0) {
   deltaTime = time - lastTime;
   lastTime = time;

   dropCounter += deltaTime;
   if (dropCounter > dropInterval) {
      playerDrop();
   }
   draw();
   requestAnimationFrame(update);
}

function updateScore() {
   document.getElementById("score").innerText = player.score;
}

function updateUserName() {
   const inputUserName = document.getElementById("inputUsername");
   inputUserName.addEventListener("change", (e) => {
      document.getElementById("username").innerText = inputUserName.value;
      inputUserName.style.visibility = "hidden";
   });
}

const colors = [
   null,
   "purple",
   "yellow",
   "orange",
   "darkblue",
   "lightblue",
   "green",
   "red",
];
const arena = createMatrix(12, 20);

document.addEventListener("keydown", (e) => {
   // left37 up38 right39 down40  space32 q81 g71
   // console.log(e.keyCode);
   if (e.keyCode == 37) {
      playerMove(-1);
   }
   if (e.keyCode == 39) {
      playerMove(1);
   }
   if (e.keyCode == 40) {
      playerDrop();
   }
   if (e.keyCode == 81) {
      playerRotate(-1);
   }
   if (e.keyCode == 71 || e.keyCode === 32) {
      playerRotate(1);
   }
});
// playerReset();
updateScore();
update();
// updateUserName();