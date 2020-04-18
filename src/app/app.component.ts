import {Component} from '@angular/core';
import {CellValueEnum} from './cell-value.enum';
import {CellColorConst} from './cell-color.const';
import {MoveEnum} from './move.enum';
import {AnnService} from './services/ann/ann.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  gameIsRunning = false;
  gameBoard;
  gameBoardWidth = 30;
  gameBoardHeight = 30;
  cellSize = 5;
  CellColorConst = CellColorConst;
  snake: any[];
  food;
  gameMode: 'normal' | 'random' | 'ann';

  constructor(
    private annService: AnnService
  ) {
    this.annService.createModel();
    this.resetGame();
    this.listenToPress();
  }

  private generateGameBoard() {
    this.gameBoard = [];
    for (let i = 0; i < this.gameBoardWidth; i++) {
      this.gameBoard.push([]);
      for (let j = 0; j < this.gameBoardHeight; j++) {
        this.gameBoard[i].push(CellValueEnum.Empty);
      }
    }
  }

  private generateSnake() {
    this.snake = [
      {x: Math.floor(this.gameBoardWidth / 2) - 2, y: Math.floor(this.gameBoardHeight / 2)},
      {x: Math.floor(this.gameBoardWidth / 2) - 1, y: Math.floor(this.gameBoardHeight / 2)},
      {x: Math.floor(this.gameBoardWidth / 2), y: Math.floor(this.gameBoardHeight / 2)},
    ];
    this.gameBoard[this.snake[0].y][this.snake[0].x] = CellValueEnum.Snake;
    this.gameBoard[this.snake[1].y][this.snake[1].x] = CellValueEnum.Snake;
    this.gameBoard[this.snake[2].y][this.snake[2].x] = CellValueEnum.Snake;
  }

  private generateFood() {
    const point = {
      x: Math.round(Math.random() * (this.gameBoardWidth - 1)),
      y: Math.round(Math.random() * (this.gameBoardHeight - 1))
    };
    this.food = point;
    this.gameBoard[point.y][point.x] = CellValueEnum.Food;
  }

  async play(mode: 'normal' | 'random' | 'ann') {
    this.gameMode = mode;
    if (this.gameIsRunning === false) {
      this.gameIsRunning = true;
      while (this.gameIsRunning) {
        await this.moveSnake();
        await this.wait(50);
      }
    }
  }

  private wait(time: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  async moveSnake(userMove?) {
    let move;
    let lastMove = this.snake[this.snake.length - 1];
    switch (this.gameMode) {
      case 'normal':
        if (userMove !== undefined) {
          move = userMove;
        } else {
          move = MoveEnum.Continue;
        }
        break;
      case 'random':
        move = Math.round(Math.random() * 4);
        break;
      case 'ann':
        move = await this.annService.getPrediction(
          this.iSExistInGameBoard(lastMove.x, lastMove.y - 1) ? this.gameBoard[lastMove.y - 1][lastMove.x] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.y, lastMove.y + 1) ? this.gameBoard[lastMove.y + 1][lastMove.x] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.x - 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x - 1] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.x + 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x + 1] : CellValueEnum.Snake,
          this.food.x,
          this.food.y
        );
        break;
    }
    const lastMoveDirection = this.getLastMoveDirection();
    let continueMove = false;
    switch (move) {
      case MoveEnum.Up:
        if (lastMoveDirection === MoveEnum.Down) {
          continueMove = true;
        } else {
          this.snake.push({
            x: lastMove.x,
            y: lastMove.y - 1
          });
        }
        break;
      case MoveEnum.Down:
        if (lastMoveDirection === MoveEnum.Up) {
          continueMove = true;
        } else {
          this.snake.push({
            x: lastMove.x,
            y: lastMove.y + 1
          });
        }
        break;
      case MoveEnum.Left:
        if (lastMoveDirection === MoveEnum.Right) {
          continueMove = true;
        } else {
          this.snake.push({
            x: lastMove.x - 1,
            y: lastMove.y
          });
        }
        break;
      case MoveEnum.Right:
        if (lastMoveDirection === MoveEnum.Left) {
          continueMove = true;
        } else {
          this.snake.push({
            x: lastMove.x + 1,
            y: lastMove.y
          });
        }
        break;
      case MoveEnum.Continue:
        continueMove = true;
        break;
    }
    if (continueMove) {
      switch (lastMoveDirection) {
        case MoveEnum.Up:
          this.snake.push({
            x: lastMove.x,
            y: lastMove.y - 1
          });
          break;
        case MoveEnum.Down:
          this.snake.push({
            x: lastMove.x,
            y: lastMove.y + 1
          });
          break;
        case MoveEnum.Left:
          this.snake.push({
            x: lastMove.x - 1,
            y: lastMove.y
          });
          break;
        case MoveEnum.Right:
          this.snake.push({
            x: lastMove.x + 1,
            y: lastMove.y
          });
          break;
      }
    }
    lastMove = this.snake[this.snake.length - 1];
    if (this.isLose()) {
      if (this.gameMode === 'ann') {
        await this.annService.fit(
          this.iSExistInGameBoard(lastMove.x, lastMove.y - 1) ? this.gameBoard[lastMove.y - 1][lastMove.x] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.y, lastMove.y + 1) ? this.gameBoard[lastMove.y + 1][lastMove.x] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.x - 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x - 1] : CellValueEnum.Snake,
          this.iSExistInGameBoard(lastMove.x + 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x + 1] : CellValueEnum.Snake,
          this.food.x,
          this.food.y,
          move === MoveEnum.Up ? -1 : 0,
          move === MoveEnum.Down ? -1 : 0,
          move === MoveEnum.Left ? -1 : 0,
          move === MoveEnum.Right ? -1 : 0,
        );
      }
      this.gameIsRunning = false;
      alert('You lose');
      this.resetGame();
    } else {
      // Check if eat
      if (lastMove.x === this.food.x && lastMove.y === this.food.y) {
        if (this.gameMode === 'ann') {
          await this.annService.fit(
            this.iSExistInGameBoard(lastMove.x, lastMove.y - 1) ? this.gameBoard[lastMove.y - 1][lastMove.x] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.y, lastMove.y + 1) ? this.gameBoard[lastMove.y + 1][lastMove.x] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.x - 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x - 1] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.x + 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x + 1] : CellValueEnum.Snake,
            this.food.x,
            this.food.y,
            move === MoveEnum.Up ? 1 : 0,
            move === MoveEnum.Down ? 1 : 0,
            move === MoveEnum.Left ? 1 : 0,
            move === MoveEnum.Right ? 1 : 0,
          );
        }
        this.generateFood();
        // Draw the move on the board
        this.gameBoard[lastMove.y][lastMove.x] = CellValueEnum.Snake;
      } else {
        if (this.gameMode === 'ann') {
          await this.annService.fit(
            this.iSExistInGameBoard(lastMove.x, lastMove.y - 1) ? this.gameBoard[lastMove.y - 1][lastMove.x] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.y, lastMove.y + 1) ? this.gameBoard[lastMove.y + 1][lastMove.x] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.x - 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x - 1] : CellValueEnum.Snake,
            this.iSExistInGameBoard(lastMove.x + 1, lastMove.y) ? this.gameBoard[lastMove.y][lastMove.x + 1] : CellValueEnum.Snake,
            this.food.x,
            this.food.y,
            0,
            0,
            0,
            0,
          );
        }
        // Draw the move on the board
        this.gameBoard[lastMove.y][lastMove.x] = CellValueEnum.Snake;
        // Remove the last tail
        const firstMove = this.snake[0];
        this.gameBoard[firstMove.y][firstMove.x] = CellValueEnum.Empty;
        this.snake.shift();
      }
    }
  }

  private isLose() {
    const lastMove = this.snake[this.snake.length - 1];
    if (
      lastMove.x > (this.gameBoardWidth - 1) ||
      lastMove.x < 0 ||
      lastMove.y > (this.gameBoardHeight - 1) ||
      lastMove.y < 0 ||
      this.gameBoard[lastMove.y][lastMove.x] === CellValueEnum.Snake
    ) {
      return true;
    } else {
      return false;
    }
  }

  private getLastMoveDirection() {
    const lastSnakeMove = this.snake[this.snake.length - 1];
    const lastSnakeSecondMove = this.snake[this.snake.length - 2];
    switch (true) {
      case lastSnakeMove.y < lastSnakeSecondMove.y:
        return MoveEnum.Up;
      case lastSnakeMove.y > lastSnakeSecondMove.y:
        return MoveEnum.Down;
      case lastSnakeMove.x < lastSnakeSecondMove.x:
        return MoveEnum.Left;
      case lastSnakeMove.x > lastSnakeSecondMove.x:
        return MoveEnum.Right;
    }
  }

  private resetGame() {
    this.generateGameBoard();
    this.generateSnake();
    this.generateFood();
  }

  private listenToPress() {
    document.addEventListener('keypress', ($event) => {
      if (this.gameMode === 'normal' && this.gameIsRunning === true) {
        switch ($event.key) {
          case 'w':
            this.moveSnake(MoveEnum.Up);
            break;
          case 's':
            this.moveSnake(MoveEnum.Down);
            break;
          case 'a':
            this.moveSnake(MoveEnum.Left);
            break;
          case 'd':
            this.moveSnake(MoveEnum.Right);
            break;
        }
      }
    });
  }

  private iSExistInGameBoard(x, y) {
    if (x < 0 || x > (this.gameBoardWidth - 1) || y < 0 || y > (this.gameBoardHeight - 1)) {
      return false;
    } else {
      return true;
    }
  }

}
