import Phaser from 'phaser';

class Game2048 extends Phaser.Scene {
  private tiles: Phaser.GameObjects.Container[][] = [];
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private tileSize: number = 80;
  private padding: number = 8;
  private isProcessing: boolean = false;
  private bestScore: number = 0;
  private bestScoreText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Game2048' });
  }

  create() {
    // 创建游戏标题
    this.add.text(
      this.game.config.width as number / 2,
      20,
      '2048',
      {
        fontSize: '36px',
        color: '#776e65',
        fontWeight: 'bold'
      }
    ).setOrigin(0.5, 0);

    // 创建顶部面板
    this.createTopPanel();
    
    // 创建游戏背景
    this.createBackground();
    
    // 初始化游戏网格
    this.initGrid();
    
    // 添加两个初始方块
    this.addNewTile();
    this.addNewTile();

    // 添加键盘控制
    this.input.keyboard.on('keydown', this.handleInput, this);
  }

  private createTopPanel() {
    const panelY = 80;
    const panelSpacing = 10;
    const panelWidth = 100;
    const panelHeight = 50;
    const startX = (this.game.config.width as number - (panelWidth * 3 + panelSpacing * 4)) / 2;

    // 当前分数面板
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0xbbada0);
    scoreBg.fillRoundedRect(startX, panelY, panelWidth, panelHeight, 6);
    
    this.add.text(
      startX + panelWidth / 2,
      panelY + 8,
      this.t('games.2048.score'),
      {
        fontSize: '13px',
        color: '#eee4da',
        fontWeight: 'bold'
      }
    ).setOrigin(0.5);
    
    this.scoreText = this.add.text(
      startX + panelWidth / 2,
      panelY + 30,
      '0',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontWeight: 'bold'
      }
    ).setOrigin(0.5);

    // 最高分面板
    const bestBg = this.add.graphics();
    bestBg.fillStyle(0xbbada0);
    bestBg.fillRoundedRect(startX + panelWidth + panelSpacing, panelY, panelWidth, panelHeight, 6);
    
    this.add.text(
      startX + panelWidth + panelSpacing + panelWidth / 2,
      panelY + 8,
      this.t('games.2048.bestScore'),
      {
        fontSize: '13px',
        color: '#eee4da',
        fontWeight: 'bold'
      }
    ).setOrigin(0.5);

    this.bestScore = Number(localStorage.getItem('2048_best_score')) || 0;
    this.bestScoreText = this.add.text(
      startX + panelWidth + panelSpacing + panelWidth / 2,
      panelY + 30,
      this.bestScore.toString(),
      {
        fontSize: '20px',
        color: '#ffffff',
        fontWeight: 'bold'
      }
    ).setOrigin(0.5);

    // 新游戏按钮 - 调整位置
    const button = this.add.container(
      startX + (panelWidth + panelSpacing) * 2 + panelSpacing * 8, // 增加额外间距
      panelY + panelHeight / 2
    );
    
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x8f7a66);
    buttonBg.fillRoundedRect(-panelWidth/2, -20, panelWidth, 40, 3);
    
    const buttonText = this.add.text(0, 0, this.t('games.2048.newGame'), {
      fontSize: '13px',
      color: '#f9f6f2',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    button.add([buttonBg, buttonText]);

    const hitArea = new Phaser.Geom.Rectangle(-panelWidth/2, -20, panelWidth, 40);
    button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x9f8a76);
      buttonBg.fillRoundedRect(-panelWidth/2, -20, panelWidth, 40, 3);
    });

    button.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x8f7a66);
      buttonBg.fillRoundedRect(-panelWidth/2, -20, panelWidth, 40, 3);
    });

    button.on('pointerdown', () => this.startNewGame());
  }

  private createBackground() {
    const graphics = this.add.graphics();
    const startY = 150;
    
    // 主游戏区背景
    graphics.fillStyle(0xbbada0);
    graphics.fillRoundedRect(
      (this.game.config.width as number - (this.tileSize * 4 + this.padding * 5)) / 2,
      startY,
      this.tileSize * 4 + this.padding * 5,
      this.tileSize * 4 + this.padding * 5,
      8
    );

    // 网格背景
    const gridStartX = (this.game.config.width as number - (this.tileSize * 4 + this.padding * 5)) / 2 + this.padding;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        graphics.fillStyle(0xcdc1b4);
        graphics.fillRoundedRect(
          gridStartX + col * (this.tileSize + this.padding),
          startY + this.padding + row * (this.tileSize + this.padding),
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
    const gridStartX = (this.game.config.width as number - (this.tileSize * 4 + this.padding * 5)) / 2 + this.padding;
    const x = gridStartX + col * (this.tileSize + this.padding) + this.tileSize / 2;
    const y = 150 + this.padding + row * (this.tileSize + this.padding) + this.tileSize / 2;

    const container = this.add.container(x, y);
    
    const background = this.add.graphics();
    background.fillStyle(this.getTileColor(value));
    background.fillRoundedRect(-this.tileSize/2, -this.tileSize/2, this.tileSize, this.tileSize, 8);
    
    const text = this.add.text(0, 0, value.toString(), {
      fontSize: value >= 100 ? '24px' : '28px',
      color: value <= 4 ? '#776e65' : '#f9f6f2',
      fontWeight: 'bold'
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
      // 先移动
      for (let col = 1; col < 4; col++) {
        if (this.tiles[row][col]) {
          let newCol = col;
          // 找到最远可以移动到的位置
          while (newCol > 0 && !this.tiles[row][newCol - 1]) {
            newCol--;
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
      // 再合并
      for (let col = 0; col < 3; col++) {
        if (this.tiles[row][col] && this.tiles[row][col + 1]) {
          const value1 = this.getTileValue(row, col);
          const value2 = this.getTileValue(row, col + 1);
          if (value1 === value2) {
            // 合并方块
            const newValue = value1 * 2;
            this.updateScore(newValue);
            
            // 移动并合并方块
            const targetTile = this.tiles[row][col];
            const mergingTile = this.tiles[row][col + 1];
            await this.moveTileToPosition(mergingTile, row, col);
            
            // 创建新方块
            this.tiles[row][col].destroy();
            this.tiles[row][col + 1].destroy();
            this.createTile(row, col, newValue);
            this.tiles[row][col + 1] = null;
            
            // 移动后面的方块
            for (let nextCol = col + 2; nextCol < 4; nextCol++) {
              if (this.tiles[row][nextCol]) {
                const tile = this.tiles[row][nextCol];
                await this.moveTileToPosition(tile, row, nextCol - 1);
                this.tiles[row][nextCol - 1] = tile;
                this.tiles[row][nextCol] = null;
              }
            }
            moved = true;
          }
        }
      }
    }
    
    if (moved) {
      // 检查游戏是否结束
      if (this.checkGameOver()) {
        this.showGameOver();
      }
    }
    
    return moved;
  }

  private async moveRight() {
    let moved = false;
    for (let row = 0; row < 4; row++) {
      // 先移动
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
      // 再合并
      for (let col = 3; col > 0; col--) {
        if (this.tiles[row][col] && this.tiles[row][col - 1]) {
          const value1 = this.getTileValue(row, col);
          const value2 = this.getTileValue(row, col - 1);
          if (value1 === value2) {
            const newValue = value1 * 2;
            this.updateScore(newValue);
            
            const mergingTile = this.tiles[row][col - 1];
            await this.moveTileToPosition(mergingTile, row, col);
            
            this.tiles[row][col].destroy();
            this.tiles[row][col - 1].destroy();
            this.createTile(row, col, newValue);
            this.tiles[row][col - 1] = null;
            
            for (let nextCol = col - 2; nextCol >= 0; nextCol--) {
              if (this.tiles[row][nextCol]) {
                const tile = this.tiles[row][nextCol];
                await this.moveTileToPosition(tile, row, nextCol + 1);
                this.tiles[row][nextCol + 1] = tile;
                this.tiles[row][nextCol] = null;
              }
            }
            moved = true;
          }
        }
      }
    }
    
    if (moved) {
      if (this.checkGameOver()) {
        this.showGameOver();
      }
    }
    
    return moved;
  }

  private async moveUp() {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      // 先移动
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
      // 再合并
      for (let row = 0; row < 3; row++) {
        if (this.tiles[row][col] && this.tiles[row + 1][col]) {
          const value1 = this.getTileValue(row, col);
          const value2 = this.getTileValue(row + 1, col);
          if (value1 === value2) {
            const newValue = value1 * 2;
            this.updateScore(newValue);
            
            const mergingTile = this.tiles[row + 1][col];
            await this.moveTileToPosition(mergingTile, row, col);
            
            this.tiles[row][col].destroy();
            this.tiles[row + 1][col].destroy();
            this.createTile(row, col, newValue);
            this.tiles[row + 1][col] = null;
            
            for (let nextRow = row + 2; nextRow < 4; nextRow++) {
              if (this.tiles[nextRow][col]) {
                const tile = this.tiles[nextRow][col];
                await this.moveTileToPosition(tile, nextRow - 1, col);
                this.tiles[nextRow - 1][col] = tile;
                this.tiles[nextRow][col] = null;
              }
            }
            moved = true;
          }
        }
      }
    }
    
    if (moved) {
      if (this.checkGameOver()) {
        this.showGameOver();
      }
    }
    
    return moved;
  }

  private async moveDown() {
    let moved = false;
    for (let col = 0; col < 4; col++) {
      // 先移动
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
      // 再合并
      for (let row = 3; row > 0; row--) {
        if (this.tiles[row][col] && this.tiles[row - 1][col]) {
          const value1 = this.getTileValue(row, col);
          const value2 = this.getTileValue(row - 1, col);
          if (value1 === value2) {
            const newValue = value1 * 2;
            this.updateScore(newValue);
            
            const mergingTile = this.tiles[row - 1][col];
            await this.moveTileToPosition(mergingTile, row, col);
            
            this.tiles[row][col].destroy();
            this.tiles[row - 1][col].destroy();
            this.createTile(row, col, newValue);
            this.tiles[row - 1][col] = null;
            
            for (let nextRow = row - 2; nextRow >= 0; nextRow--) {
              if (this.tiles[nextRow][col]) {
                const tile = this.tiles[nextRow][col];
                await this.moveTileToPosition(tile, nextRow + 1, col);
                this.tiles[nextRow + 1][col] = tile;
                this.tiles[nextRow][col] = null;
              }
            }
            moved = true;
          }
        }
      }
    }
    
    if (moved) {
      if (this.checkGameOver()) {
        this.showGameOver();
      }
    }
    
    return moved;
  }

  private async moveTileToPosition(tile: Phaser.GameObjects.Container, row: number, col: number) {
    const gridStartX = (this.game.config.width as number - (this.tileSize * 4 + this.padding * 5)) / 2 + this.padding;
    const x = gridStartX + col * (this.tileSize + this.padding) + this.tileSize / 2;
    const y = 150 + this.padding + row * (this.tileSize + this.padding) + this.tileSize / 2;

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
      this.t('games.2048.gameOver'),
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
    this.scoreText.setText(this.score.toString());
    
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(this.bestScore.toString());
      localStorage.setItem('2048_best_score', this.bestScore.toString());
    }
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
    this.scoreText.setText(this.score.toString());

    // 添加初始方块
    this.addNewTile();
    this.addNewTile();

    // 隐藏游戏结束文本
    if (this.gameOverText) {
      this.gameOverText.setVisible(false);
    }
  }

  // 添加国际化辅助方法
  private t(key: string): string {
    const i18n = (this.game as Game).i18n;
    return i18n ? i18n.t(key) : key;
  }

  // 添加更新文本的方法
  updateTexts() {
    // 更新分数面板文本
    const scoreLabel = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Text && 
      child.text === this.t('games.2048.score')
    ) as Phaser.GameObjects.Text;
    if (scoreLabel) {
      scoreLabel.setText(this.t('games.2048.score'));
    }

    // 更新最高分文本
    const bestScoreLabel = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Text && 
      child.text === this.t('games.2048.bestScore')
    ) as Phaser.GameObjects.Text;
    if (bestScoreLabel) {
      bestScoreLabel.setText(this.t('games.2048.bestScore'));
    }

    // 更新新游戏按钮文本
    const newGameButton = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Container
    ) as Phaser.GameObjects.Container;
    if (newGameButton) {
      const buttonText = newGameButton.list[1] as Phaser.GameObjects.Text;
      buttonText.setText(this.t('games.2048.newGame'));
    }

    // 更新游戏结束文本
    if (this.gameOverText) {
      this.gameOverText.setText(this.t('games.2048.gameOver'));
    }
  }
}

export default class Game extends Phaser.Game {
  i18n: any;

  constructor(config: Phaser.Types.Core.GameConfig & { i18n: any }) {
    const { i18n, ...gameConfig } = config;
    
    super({
      type: Phaser.AUTO,
      ...gameConfig,
      scene: Game2048,
      backgroundColor: '#faf8ef'
    });
    
    this.i18n = i18n;
  }

  updateLanguage(i18n: any) {
    this.i18n = i18n;
    if (this.scene.scenes[0]) {
      (this.scene.scenes[0] as Game2048).updateTexts();
    }
  }
} 