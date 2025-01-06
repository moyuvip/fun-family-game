import Phaser from 'phaser';

class SnakeGame extends Phaser.Scene {
  private snake: Phaser.GameObjects.Rectangle[] = [];
  private food: Phaser.GameObjects.Rectangle | null = null;
  private direction = { x: 0, y: 0 };
  private lastMoveTime = 0;
  private moveInterval = 100;
  private gridSize = 20;

  constructor() {
    super({ key: 'SnakeGame' });
  }

  create() {
    // 初始化蛇
    this.snake = [];
    const startX = 10;
    const startY = 10;
    
    for (let i = 0; i < 3; i++) {
      const segment = this.add.rectangle(
        (startX - i) * this.gridSize,
        startY * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2,
        0x00ff00
      );
      this.snake.push(segment);
    }

    // 创建食物
    this.createFood();

    // 添加键盘控制
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  update(time: number) {
    if (time < this.lastMoveTime + this.moveInterval) {
      return;
    }

    this.lastMoveTime = time;
    this.moveSnake();
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        if (this.direction.y !== 1) {
          this.direction = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        if (this.direction.y !== -1) {
          this.direction = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        if (this.direction.x !== 1) {
          this.direction = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        if (this.direction.x !== -1) {
          this.direction = { x: 1, y: 0 };
        }
        break;
    }
  }

  private moveSnake() {
    const head = this.snake[0];
    const newHead = this.add.rectangle(
      head.x + this.direction.x * this.gridSize,
      head.y + this.direction.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2,
      0x00ff00
    );

    this.snake.unshift(newHead);
    this.snake.pop()?.destroy();

    this.checkCollision();
  }

  private createFood() {
    const x = Math.floor(Math.random() * (this.game.config.width as number / this.gridSize)) * this.gridSize;
    const y = Math.floor(Math.random() * (this.game.config.height as number / this.gridSize)) * this.gridSize;
    
    this.food = this.add.rectangle(x, y, this.gridSize - 2, this.gridSize - 2, 0xff0000);
  }

  private checkCollision() {
    // 检查是否吃到食物
    if (this.food && this.snake[0].x === this.food.x && this.snake[0].y === this.food.y) {
      this.food.destroy();
      this.createFood();
      // 增加蛇的长度
      const tail = this.snake[this.snake.length - 1];
      const newTail = this.add.rectangle(tail.x, tail.y, this.gridSize - 2, this.gridSize - 2, 0x00ff00);
      this.snake.push(newTail);
    }

    // 检查是否撞墙
    const head = this.snake[0];
    if (
      head.x < 0 ||
      head.x >= this.game.config.width ||
      head.y < 0 ||
      head.y >= this.game.config.height
    ) {
      this.gameOver();
    }

    // 检查是否撞到自己
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver();
        break;
      }
    }
  }

  private gameOver() {
    this.scene.pause();
    // 触发游戏结束事件
    this.game.events.emit('gameOver', this.snake.length - 3);
  }
}

export default class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super({
      type: Phaser.AUTO,
      ...config,
      scene: SnakeGame,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }
        }
      }
    });
  }
} 