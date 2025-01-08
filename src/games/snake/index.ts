import Phaser from 'phaser';

interface SnakeSegment {
  sprite: Phaser.GameObjects.Rectangle;
  x: number;
  y: number;
}

class SnakeGame extends Phaser.Scene {
  private snake: SnakeSegment[] = [];
  private food: Phaser.GameObjects.Rectangle | null = null;
  private direction = { x: 1, y: 0 };
  private nextDirection = { x: 1, y: 0 };
  private lastMoveTime = 0;
  private moveInterval = 150;
  private gridSize = 20;
  private score: number = 0;
  private bestScore: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;

  constructor() {
    super({ key: 'SnakeGame' });
  }

  create() {
    // 创建游戏标题
    this.add.text(
      this.game.config.width as number / 2,
      20,
      this.t('games.snake.title'),
      {
        fontSize: '24px',
        color: '#4a90e2',
        backgroundColor: '#ffffff',
        padding: { x: 15, y: 5 },
        fixedWidth: 120,
        align: 'center'
      }
    ).setOrigin(0.5);

    // 创建分数面板
    this.createScorePanel();

    // 创建新游戏按钮
    this.createNewGameButton();

    // 初始化游戏
    this.initGame();

    // 添加键盘控制
    this.input.keyboard.on('keydown', this.handleKeyDown, this);

    // 显示开始提示
    this.showStartPrompt();
  }

  private createScorePanel() {
    const startY = 65;
    const panelWidth = 100;
    const panelHeight = 50;
    const spacing = 20;
    const startX = (this.game.config.width as number - (panelWidth * 2 + spacing)) / 2;

    // 当前分数面板
    this.createPanel(
      startX,
      startY,
      panelWidth,
      panelHeight,
      this.t('games.snake.score'),
      '0',
      text => this.scoreText = text,
      '#4a90e2'
    );

    // 最高分面板
    this.bestScore = Number(localStorage.getItem('snake-best-score')) || 0;
    this.createPanel(
      startX + panelWidth + spacing,
      startY,
      panelWidth,
      panelHeight,
      this.t('games.snake.best'),
      this.bestScore.toString(),
      text => this.bestScoreText = text,
      '#4a90e2'
    );
  }

  private createPanel(x: number, y: number, width: number, height: number,
    title: string, value: string,
    callback: (text: Phaser.GameObjects.Text) => void,
    color: string) {
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff);
    panel.fillRoundedRect(x, y, width, height, 8);
    panel.lineStyle(2, Number('0x' + color.slice(1)));
    panel.strokeRoundedRect(x, y, width, height, 8);

    this.add.text(
      x + width / 2,
      y + 8,
      title,
      {
        fontSize: '14px',
        color: color
      }
    ).setOrigin(0.5);

    const valueText = this.add.text(
      x + width / 2,
      y + 32,
      value,
      {
        fontSize: '18px',
        color: color,
        fontWeight: 'bold'
      }
    ).setOrigin(0.5);

    callback(valueText);
  }

  private createNewGameButton() {
    const button = this.add.container(
      this.game.config.width as number - 60,
      80
    );

    const bg = this.add.graphics();
    bg.fillStyle(0x4a90e2);
    bg.fillRoundedRect(-40, -15, 80, 30, 6);

    const text = this.add.text(
      0,
      0,
      this.t('games.snake.newGame'),
      {
        fontSize: '13px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    button.add([bg, text]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-40, -15, 80, 30),
      Phaser.Geom.Rectangle.Contains
    );

    button.on('pointerdown', () => this.startNewGame());
    button.on('pointerover', () => bg.fillStyle(0x357abd).fillRoundedRect(-40, -15, 80, 30, 6));
    button.on('pointerout', () => bg.fillStyle(0x4a90e2).fillRoundedRect(-40, -15, 80, 30, 6));
  }

  private initGame() {
    this.snake = [];
    this.score = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.moveInterval = 150;

    // 创建蛇的初始身体
    const startX = 5;
    const startY = Math.floor((this.game.config.height as number - 150) / this.gridSize / 2);

    for (let i = 0; i < 3; i++) {
      const segment = this.add.rectangle(
        (startX - i) * this.gridSize,
        startY * this.gridSize + 150,
        this.gridSize - 2,
        this.gridSize - 2,
        0x4a90e2
      );
      this.snake.push({ sprite: segment, x: startX - i, y: startY });
    }

    // 创建食物
    this.createFood();
    this.updateScore(0);
  }

  private createFood() {
    if (this.food) {
      this.food.destroy();
    }

    const availablePositions = [];
    const gridWidth = Math.floor((this.game.config.width as number) / this.gridSize);
    const gridHeight = Math.floor(((this.game.config.height as number) - 150) / this.gridSize);

    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        if (!this.snake.some(segment => segment.x === x && segment.y === y)) {
          availablePositions.push({ x, y });
        }
      }
    }

    if (availablePositions.length > 0) {
      const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      this.food = this.add.rectangle(
        pos.x * this.gridSize,
        pos.y * this.gridSize + 150,
        this.gridSize - 2,
        this.gridSize - 2,
        0xff6b6b
      );
    }
  }

  update(time: number) {
    if (!this.gameStarted || this.gameOver) return;

    if (time < this.lastMoveTime + this.moveInterval) {
      return;
    }

    this.lastMoveTime = time;
    this.direction = this.nextDirection;
    this.moveSnake();
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.hideStartPrompt();
    }

    switch (event.key) {
      case 'ArrowUp':
        if (this.direction.y !== 1) {
          this.nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        if (this.direction.y !== -1) {
          this.nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        if (this.direction.x !== 1) {
          this.nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        if (this.direction.x !== -1) {
          this.nextDirection = { x: 1, y: 0 };
        }
        break;
    }
  }

  private moveSnake() {
    const head = this.snake[0];
    const newX = head.x + this.direction.x;
    const newY = head.y + this.direction.y;

    // 检查碰撞
    if (this.checkCollision(newX, newY)) {
      this.handleGameOver();
      return;
    }

    // 创建新的头部
    const newHead = this.add.rectangle(
      newX * this.gridSize,
      newY * this.gridSize + 150,
      this.gridSize - 2,
      this.gridSize - 2,
      0x4a90e2
    );

    this.snake.unshift({ sprite: newHead, x: newX, y: newY });

    // 检查是否吃到食物
    if (this.food && newX === this.food.x / this.gridSize && newY === (this.food.y - 150) / this.gridSize) {
      this.handleFoodCollision();
    } else {
      // 移除尾部
      const tail = this.snake.pop();
      if (tail) {
        tail.sprite.destroy();
      }
    }
  }

  private checkCollision(x: number, y: number): boolean {
    // 检查墙壁碰撞
    if (
      x < 0 ||
      x >= Math.floor((this.game.config.width as number) / this.gridSize) ||
      y < 0 ||
      y >= Math.floor(((this.game.config.height as number) - 150) / this.gridSize)
    ) {
      return true;
    }

    // 检查自身碰撞
    return this.snake.some(segment => segment.x === x && segment.y === y);
  }

  private handleFoodCollision() {
    this.updateScore(10);
    this.createFood();
    this.moveInterval = Math.max(50, this.moveInterval - 2);
  }

  private handleGameOver() {
    this.gameOver = true;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('snake-best-score', this.score.toString());
      this.bestScoreText.setText(this.bestScore.toString());
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.game.config.width as number, this.game.config.height as number);

    this.add.text(
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
      this.t('games.snake.gameOver'),
      {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);
  }

  private updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(this.score.toString());
  }

  private startNewGame() {
    this.snake.forEach(segment => segment.sprite.destroy());
    if (this.food) {
      this.food.destroy();
    }
    this.initGame();
  }

  private showStartPrompt() {
    this.add.text(
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
      this.t('games.snake.startPrompt'),
      {
        fontSize: '24px',
        color: '#4a90e2',
        backgroundColor: '#ffffff',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5).setName('startPrompt');
  }

  private hideStartPrompt() {
    const prompt = this.children.getByName('startPrompt');
    if (prompt) {
      prompt.destroy();
    }
  }

  private t(key: string): string {
    const i18n = (this.game as Game).i18n;
    return i18n ? i18n.t(key) : key;
  }
}

export default class Game extends Phaser.Game {
  i18n: any;

  constructor(config: Phaser.Types.Core.GameConfig & { i18n: any }) {
    const { i18n, ...gameConfig } = config;
    super({
      type: Phaser.AUTO,
      ...gameConfig,
      scene: SnakeGame,
      backgroundColor: '#f8fafc'
    });
    this.i18n = i18n;
  }
} 