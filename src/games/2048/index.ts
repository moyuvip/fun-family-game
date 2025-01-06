import Phaser from 'phaser';

class Game2048 extends Phaser.Scene {
  private tiles: Phaser.GameObjects.Container[][] = [];
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private tileSize: number = 100;
  private padding: number = 10;
  private isProcessing: boolean = false;
  private bestScore: number = 0;
  private bestScoreText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private newGameButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'Game2048' });
  }

  create() {
    // 创建游戏背景
    this.createBackground();
    
    // 创建分数显示
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#000000'
    });

    // 初始化游戏网格
    this.initGrid();
    
    // 添加两个初始方块
    this.addNewTile();
    this.addNewTile();

    // 添加键盘控制
    this.input.keyboard.on('keydown', this.handleInput, this);

    // 添加最高分显示
    this.bestScore = Number(localStorage.getItem('2048_best_score')) || 0;
    this.bestScoreText = this.add.text(200, 20, `Best: ${this.bestScore}`, {
      fontSize: '24px',
      color: '#000000'
    });

    // 添加新游戏按钮
    this.createNewGameButton();
  }

  private createBackground() {
    // 创建游戏背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0xbbada0);
    graphics.fillRoundedRect(
      this.padding,
      50,
      this.tileSize * 4 + this.padding * 5,
      this.tileSize * 4 + this.padding * 5,
      8
    );

    // 创建网格背景
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        graphics.fillStyle(0xcdc1b4);
        graphics.fillRoundedRect(
          this.padding * 2 + col * (this.tileSize + this.padding),
          this.padding * 2 + 50 + row * (this.tileSize + this.padding),
          this.tileSize,
          this.tileSize,
          8
        );
      }
    }
  }

  private initGrid() {
    this.tiles = Array(4).fill(null).map(() => Array(4).fill(null));
  }

  private addNewTile() {
    const emptyCells = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!this.tiles[row][col]) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.createTile(row, col, value);
    }
  }

  private createTile(row: number, col: number, value: number) {
    const x = this.padding * 2 + col * (this.tileSize + this.padding) + this.tileSize / 2;
    const y = this.padding * 2 + 50 + row * (this.tileSize + this.padding) + this.tileSize / 2;

    const container = this.add.container(x, y);
    
    const background = this.add.graphics();
    background.fillStyle(this.getTileColor(value));
    background.fillRoundedRect(-this.tileSize/2, -this.tileSize/2, this.tileSize, this.tileSize, 8);
    
    const text = this.add.text(0, 0, value.toString(), {
      fontSize: '32px',
      color: value <= 4 ? '#776e65' : '#f9f6f2'
    });
    text.setOrigin(0.5);

    container.add([background, text]);
    this.tiles[row][col] = container;
  }

  private getTileColor(value: number): number {
    const colors: { [key: number]: number } = {
      2: 0xeee4da,
      4: 0xede0c8,
      8: 0xf2b179,
      16: 0xf59563,
      32: 0xf67c5f,
      64: 0xf65e3b,
      128: 0xedcf72,
      256: 0xedcc61,
      512: 0xedc850,
      1024: 0xedc53f,
      2048: 0xedc22e
    };
    return colors[value] || 0xcdc1b4;
  }

  private async handleInput(event: KeyboardEvent) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    let moved = false;

    switch (event.key) {
      case 'ArrowUp':
        moved = await this.moveUp();
        break;
      case 'ArrowDown':
        moved = await this.moveDown();
        break;
      case 'ArrowLeft':
        moved = await this.moveLeft();
        break;
      case 'ArrowRight':
        moved = await this.moveRight();
        break;
    }

    if (moved) {
      this.addNewTile();
    }

    this.isProcessing = false;
  }

  // 移动逻辑实现...
  private async moveLeft() {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      for (let col = 1; col < 4; col++) {
        if (this.tiles[row][col]) {
          let newCol = col;
          while (newCol > 0 && !this.tiles[row][newCol - 1]) {
            newCol--;
          }
          if (newCol !== col) {
            this.tiles[row][newCol] = this.tiles[row][col];
            this.tiles[row][col] = null;
            moved = true;
          }
        }
      }
    }
    return moved;
  }

  private async moveRight() {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      for (let col = 2; col >= 0; col--) {
        if (this.tiles[row][col]) {
          let newCol = col;
          while (newCol < 3 && !this.tiles[row][newCol + 1]) {
            newCol++;
          }
          if (newCol !== col) {
            const tile = this.tiles[row][col];
            await this.moveTileToPosition(tile, row, newCol);
            this.tiles[row][newCol] = tile;
            this.tiles[row][col] = null;
            moved = true;
          }
        }
      }
    }
    return moved;
  }

  private async moveUp() {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      for (let row = 1; row < 4; row++) {
        if (this.tiles[row][col]) {
          let newRow = row;
          while (newRow > 0 && !this.tiles[newRow - 1][col]) {
            newRow--;
          }
          if (newRow !== row) {
            const tile = this.tiles[row][col];
            await this.moveTileToPosition(tile, newRow, col);
            this.tiles[newRow][col] = tile;
            this.tiles[row][col] = null;
            moved = true;
          }
        }
      }
    }
    return moved;
  }

  private async moveDown() {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      for (let row = 2; row >= 0; row--) {
        if (this.tiles[row][col]) {
          let newRow = row;
          while (newRow < 3 && !this.tiles[newRow + 1][col]) {
            newRow++;
          }
          if (newRow !== row) {
            const tile = this.tiles[row][col];
            await this.moveTileToPosition(tile, newRow, col);
            this.tiles[newRow][col] = tile;
            this.tiles[row][col] = null;
            moved = true;
          }
        }
      }
    }
    return moved;
  }

  private async moveTileToPosition(tile: Phaser.GameObjects.Container, row: number, col: number) {
    const x = this.padding * 2 + col * (this.tileSize + this.padding) + this.tileSize / 2;
    const y = this.padding * 2 + 50 + row * (this.tileSize + this.padding) + this.tileSize / 2;

    return new Promise<void>(resolve => {
      this.tweens.add({
        targets: tile,
        x: x,
        y: y,
        duration: 100,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }

  private checkGameOver() {
    // 检查是否还有空格
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!this.tiles[row][col]) {
          return false;
        }
      }
    }

    // 检查是否还能合并
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = this.getTileValue(row, col);
        if (
          (row < 3 && value === this.getTileValue(row + 1, col)) ||
          (col < 3 && value === this.getTileValue(row, col + 1))
        ) {
          return false;
        }
      }
    }

    return true;
  }

  private getTileValue(row: number, col: number): number {
    const tile = this.tiles[row][col];
    if (!tile) return 0;
    return Number((tile.list[1] as Phaser.GameObjects.Text).text);
  }

  private showGameOver() {
    this.gameOverText = this.add.text(
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
      'Game Over!',
      {
        fontSize: '48px',
        color: '#776e65',
        backgroundColor: '#ffffff80',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);
  }

  private updateScore(value: number) {
    this.score += value;
    this.scoreText.setText(`Score: ${this.score}`);
    
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(`Best: ${this.bestScore}`);
      localStorage.setItem('2048_best_score', this.bestScore.toString());
    }
  }

  private createNewGameButton() {
    const button = this.add.container(350, 20);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x8f7a66);
    bg.fillRoundedRect(-40, -15, 80, 30, 5);
    
    const text = this.add.text(0, 0, 'New Game', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setInteractive(new Phaser.Geom.Rectangle(-40, -15, 80, 30), Phaser.Geom.Rectangle.Contains);
    button.on('pointerdown', () => this.startNewGame());

    this.newGameButton = button;
  }

  private startNewGame() {
    // 清除所有方块
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.tiles[row][col]) {
          this.tiles[row][col].destroy();
          this.tiles[row][col] = null;
        }
      }
    }

    // 重置分数
    this.score = 0;
    this.scoreText.setText(`Score: ${this.score}`);

    // 添加初始方块
    this.addNewTile();
    this.addNewTile();

    // 隐藏游戏结束文本
    if (this.gameOverText) {
      this.gameOverText.setVisible(false);
    }
  }
}

export default class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super({
      type: Phaser.AUTO,
      ...config,
      scene: Game2048,
      backgroundColor: '#faf8ef'
    });
  }
} 