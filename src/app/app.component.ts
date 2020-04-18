import {Component} from '@angular/core';
import {CellValueEnum} from './cell-value.enum';
import {CellColorConst} from './cell-color.const';
import {MoveEnum} from './move.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  gameIsRunning = false;
  gameBoard;
  gameBoardWidth = 100;
  gameBoardHeight = 100;
  cellSize = 5;
  CellColorConst = CellColorConst;
  snake: any[];
  food;

  constructor() {
    this.generateGameBoard();
    this.generateSnake();
    this.generateFood();
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
    this.snake = [];
    const point = {
      x: Math.round(Math.random() * 99),
      y: Math.round(Math.random() * 99)
    };
    this.snake.push(point);
    this.gameBoard[point.y][point.x] = CellValueEnum.Snake;
  }

  private generateFood() {
    const point = {
      x: Math.round(Math.random() * 99),
      y: Math.round(Math.random() * 99)
    };
    this.food = point;
    this.gameBoard[point.y][point.x] = CellValueEnum.Food;
  }

  async play() {
    if (this.gameIsRunning === false) {
      this.gameIsRunning = true;
      while (this.gameIsRunning) {
        this.moveSnake();
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

  moveSnake() {
    const move = Math.round(Math.random() * 3);
    let lastMove = this.snake[this.snake.length - 1];
    switch (move) {
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
    lastMove = this.snake[this.snake.length - 1];
    // Draw the move on the board
    this.gameBoard[lastMove.y][lastMove.x] = CellValueEnum.Snake;
    // Remove the last tail
    const firstMove = this.snake[0];
    this.gameBoard[firstMove.y][firstMove.x] = CellValueEnum.Empty;
    this.snake.shift();
  }

}
