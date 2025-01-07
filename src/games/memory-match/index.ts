import Phaser from 'phaser';

interface Tile {
  id: number;
  value: string;
  sprite: Phaser.GameObjects.Text;
  row: number;
  col: number;
  isMatched: boolean;
}

class MemoryMatch extends Phaser.Scene {
  private tiles: Tile[][] = [];
  private selectedTile: Tile | null = null;
  private canSelect: boolean = true;
  private score: number = 0;
  private bestScore: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private readonly gridSize: number = 6;
  private readonly tileSize: number = 60;
  private readonly padding: number = 5;
  private readonly emojis = ['🍦', '🧁', '🐰', '🐺', '🎡', '🍭'];
  private readonly startY: number = 180;

  constructor() {
    super({ key: 'MemoryMatch' });
  }

  create() {
    // 创建游戏标题
    this.add.text(
      this.game.config.width as number / 2,
      20,
      this.t('games.memoryMatch.title'),
      {
        fontSize: '24px',
        color: '#9333ea',
        fontWeight: 'bold',
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
    this.initializeGame();
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
      this.t('games.memoryMatch.score'),
      '0',
      text => this.scoreText = text,
      '#9333ea'
    );

    // 最高分面板
    this.bestScore = Number(localStorage.getItem('memory-match-best')) || 0;
    this.createPanel(
      startX + panelWidth + spacing, 
      startY, 
      panelWidth, 
      panelHeight,
      this.t('games.memoryMatch.best'),
      this.bestScore.toString(),
      text => this.bestScoreText = text,
      '#9333ea'
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
    bg.fillStyle(0x9333ea);
    bg.fillRoundedRect(-40, -15, 80, 30, 6);

    const text = this.add.text(
      0,
      0,
      this.t('games.memoryMatch.newGame'),
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
    button.on('pointerover', () => bg.fillStyle(0x7e22ce).fillRoundedRect(-40, -15, 80, 30, 6));
    button.on('pointerout', () => bg.fillStyle(0x9333ea).fillRoundedRect(-40, -15, 80, 30, 6));
  }

  private initializeGame() {
    this.tiles = [];
    this.selectedTile = null;
    this.canSelect = true;
    this.score = 0;
    this.updateScore();

    // 创建网格
    const startX = (this.game.config.width as number - (this.tileSize * this.gridSize + this.padding * (this.gridSize - 1))) / 2;
    const startY = this.startY;

    for (let row = 0; row < this.gridSize; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const x = startX + col * (this.tileSize + this.padding);
        const y = startY + row * (this.tileSize + this.padding);
        const value = this.emojis[Math.floor(Math.random() * this.emojis.length)];
        this.tiles[row][col] = this.createTile(x, y, row, col, value);
      }
    }

    // 确保初始状态有可消除的组合
    while (!this.hasMatches()) {
      this.shuffleBoard();
    }
  }

  private createTile(x: number, y: number, row: number, col: number, value: string): Tile {
    const sprite = this.add.text(x, y, value, {
      fontSize: '36px',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 },
      fixedWidth: this.tileSize,
      fixedHeight: this.tileSize,
      align: 'center',
      lineSpacing: 10
    });
    
    sprite.setOrigin(0);
    sprite.setInteractive();
    sprite.on('pointerdown', () => this.selectTile(sprite.tile));

    const tile: Tile = {
      id: this.tiles.flat().length,
      value,
      sprite,
      row,
      col,
      isMatched: false
    };

    sprite.tile = tile;
    return tile;
  }

  private selectTile(tile: Tile) {
    if (!this.canSelect || tile.isMatched) return;

    if (!this.selectedTile) {
      // 第一次选择
      this.selectedTile = tile;
      tile.sprite.setBackgroundColor('#e0e0e0');
    } else {
      // 第二次选择
      if (this.isAdjacent(this.selectedTile, tile)) {
        this.swapTiles(this.selectedTile, tile);
      } else {
        // 不相邻，取消第一次选择
        this.selectedTile.sprite.setBackgroundColor('#ffffff');
        this.selectedTile = tile;
        tile.sprite.setBackgroundColor('#e0e0e0');
      }
    }
  }

  private isAdjacent(tile1: Tile, tile2: Tile): boolean {
    const rowDiff = Math.abs(tile1.row - tile2.row);
    const colDiff = Math.abs(tile1.col - tile2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  private async swapTiles(tile1: Tile, tile2: Tile) {
    this.canSelect = false;

    // 交换位置
    const tempX = tile1.sprite.x;
    const tempY = tile1.sprite.y;
    const tempRow = tile1.row;
    const tempCol = tile1.col;

    await Promise.all([
      this.moveTile(tile1, tile2.sprite.x, tile2.sprite.y),
      this.moveTile(tile2, tempX, tempY)
    ]);

    // 更新数组中的位置
    this.tiles[tile1.row][tile1.col] = tile2;
    this.tiles[tile2.row][tile2.col] = tile1;
    tile1.row = tile2.row;
    tile1.col = tile2.col;
    tile2.row = tempRow;
    tile2.col = tempCol;

    // 检查是否有匹配
    const matches = this.findMatches();
    if (matches.length > 0) {
      await this.handleMatches(matches);
    } else {
      // 如果没有匹配，交换回来
      await Promise.all([
        this.moveTile(tile1, tempX, tempY),
        this.moveTile(tile2, tile2.sprite.x, tile2.sprite.y)
      ]);
      this.tiles[tempRow][tempCol] = tile1;
      this.tiles[tile2.row][tile2.col] = tile2;
      tile1.row = tempRow;
      tile1.col = tempCol;
    }

    // 重置选择状态
    tile1.sprite.setBackgroundColor('#ffffff');
    tile2.sprite.setBackgroundColor('#ffffff');
    this.selectedTile = null;
    this.canSelect = true;
  }

  private async moveTile(tile: Tile, x: number, y: number) {
    return new Promise<void>(resolve => {
      this.tweens.add({
        targets: tile.sprite,
        x: x,
        y: y,
        duration: 200,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }

  private findMatches(): Tile[][] {
    const matches: Tile[][] = [];
    
    // 检查水平匹配
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 2; col++) {
        const tile1 = this.tiles[row][col];
        const tile2 = this.tiles[row][col + 1];
        const tile3 = this.tiles[row][col + 2];
        if (tile1.value === tile2.value && tile2.value === tile3.value) {
          matches.push([tile1, tile2, tile3]);
        }
      }
    }

    // 检查垂直匹配
    for (let row = 0; row < this.gridSize - 2; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tile1 = this.tiles[row][col];
        const tile2 = this.tiles[row + 1][col];
        const tile3 = this.tiles[row + 2][col];
        if (tile1.value === tile2.value && tile2.value === tile3.value) {
          matches.push([tile1, tile2, tile3]);
        }
      }
    }

    return matches;
  }

  private async handleMatches(matches: Tile[][]) {
    // 计算分数
    const matchCount = matches.flat().length;
    const baseScore = 30;
    const comboMultiplier = Math.floor(matchCount / 3);
    this.score += baseScore * comboMultiplier;
    this.updateScore();

    // 移除匹配的方块
    const matchedTiles = new Set(matches.flat());
    await Promise.all(
      Array.from(matchedTiles).map(tile => this.removeTile(tile))
    );

    // 填充空缺
    await this.fillGaps();

    // 检查新的匹配
    const newMatches = this.findMatches();
    if (newMatches.length > 0) {
      await this.handleMatches(newMatches);
    }
  }

  private async fillGaps() {
    // 方块下落
    for (let col = 0; col < this.gridSize; col++) {
      let emptyRow = this.gridSize - 1;
      while (emptyRow >= 0) {
        if (!this.tiles[emptyRow][col].isMatched) {
          emptyRow--;
          continue;
        }

        // 找到上方最近的非空方块
        let sourceRow = emptyRow - 1;
        while (sourceRow >= 0 && this.tiles[sourceRow][col].isMatched) {
          sourceRow--;
        }

        if (sourceRow >= 0) {
          // 移动方块
          const tile = this.tiles[sourceRow][col];
          const x = tile.sprite.x;
          const y = this.getYPosition(emptyRow);
          await this.moveTile(tile, x, y);
          
          this.tiles[emptyRow][col] = tile;
          this.tiles[sourceRow][col].isMatched = true;
          tile.row = emptyRow;
        }
        emptyRow--;
      }
    }

    // 填充新方块
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.tiles[row][col].isMatched) {
          const x = this.getXPosition(col);
          const y = this.getYPosition(row);
          const value = this.emojis[Math.floor(Math.random() * this.emojis.length)];
          const newTile = this.createTile(x, y - this.tileSize * 2, row, col, value);
          this.tiles[row][col] = newTile;
          
          // 添加下落动画
          await this.moveTile(newTile, x, y);
        }
      }
    }

    // 检查新的匹配
    const newMatches = this.findMatches();
    if (newMatches.length > 0) {
      await this.handleMatches(newMatches);
    }
  }

  private getXPosition(col: number): number {
    const startX = (this.game.config.width as number - (this.tileSize * this.gridSize + this.padding * (this.gridSize - 1))) / 2;
    return startX + col * (this.tileSize + this.padding);
  }

  private getYPosition(row: number): number {
    return this.startY + row * (this.tileSize + this.padding);
  }

  private hasMatches(): boolean {
    // 检查水平方向是否有可能的匹配
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 2; col++) {
        const tile1 = this.tiles[row][col];
        const tile2 = this.tiles[row][col + 1];
        const tile3 = this.tiles[row][col + 2];
        if (tile1 && tile2 && tile3 && 
            tile1.value === tile2.value && 
            tile2.value === tile3.value) {
          return true;
        }
      }
    }

    // 检查垂直方向是否有可能的匹配
    for (let row = 0; row < this.gridSize - 2; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const tile1 = this.tiles[row][col];
        const tile2 = this.tiles[row + 1][col];
        const tile3 = this.tiles[row + 2][col];
        if (tile1 && tile2 && tile3 && 
            tile1.value === tile2.value && 
            tile2.value === tile3.value) {
          return true;
        }
      }
    }

    return false;
  }

  private shuffleBoard() {
    const allTiles = this.tiles.flat();
    const values = allTiles.map(tile => tile.value);
    this.shuffleArray(values);
    
    allTiles.forEach((tile, index) => {
      tile.value = values[index];
      tile.sprite.setText(values[index]);
    });
  }

  private showGameOver() {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('memory-match-best', this.score.toString());
      this.bestScoreText.setText(this.bestScore.toString());
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.game.config.width as number, this.game.config.height as number);

    const message = this.add.text(
      this.game.config.width as number / 2,
      this.game.config.height as number / 2,
      this.t('games.memoryMatch.gameOver'),
      {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      overlay.destroy();
      message.destroy();
    });
  }

  private updateScore() {
    this.scoreText.setText(this.score.toString());
  }

  private startNewGame() {
    this.tiles.flat().forEach(tile => tile.sprite.destroy());
    this.initializeGame();
  }

  private t(key: string): string {
    const i18n = (this.game as Game).i18n;
    return i18n ? i18n.t(key) : key;
  }

  private async removeTile(tile: Tile) {
    return new Promise<void>(resolve => {
      this.tweens.add({
        targets: tile.sprite,
        alpha: 0,
        scale: 0.8,
        duration: 200,
        onComplete: () => {
          tile.isMatched = true;
          resolve();
        }
      });
    });
  }
}

export default class Game extends Phaser.Game {
  i18n: any;

  constructor(config: Phaser.Types.Core.GameConfig & { i18n: any }) {
    const { i18n, ...gameConfig } = config;
    super({
      type: Phaser.AUTO,
      ...gameConfig,
      scene: MemoryMatch,
      backgroundColor: '#faf5ff'
    });
    this.i18n = i18n;
  }
} 