class SnakeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.restartBtn = document.getElementById('restartBtn');
        this.startBtn = document.getElementById('startBtn');
        
        this.tileSize = 20;
        this.snake = [];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = { x: 0, y: 0 };
        this.gameOver = false;
        this.score = 0;
        this.gameRunning = false;
        this.gameLoopId = null;
        
        this.init();
    }
    
    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '20px auto';
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.borderRadius = '8px';
        
        const gameContainer = document.querySelector('.game-container') || document.body;
        gameContainer.appendChild(this.canvas);
        
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        this.resetGame();
    }
    
    resetGame() {
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: this.tileSize, y: 0 };
        this.nextDirection = this.direction;
        this.food = this.generateFood();
        this.gameOver = false;
        this.score = 0;
        this.gameRunning = false;
        
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Счет: ${this.score}`;
        }
        
        if (this.restartBtn) {
            this.restartBtn.disabled = true;
        }
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * (this.canvas.width / this.tileSize)) * this.tileSize,
                y: Math.floor(Math.random() * (this.canvas.height / this.tileSize)) * this.tileSize
            };
        } while (this.isFoodOnSnake(foodPosition));
        return foodPosition;
    }
    
    isFoodOnSnake(position) {
        return this.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        // Предотвращаем прокрутку страницы при нажатии стрелок
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
            e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
        }
        
        let newDirection = this.direction;
        
        switch(e.key) {
            case 'ArrowUp':
                if (this.direction.y === 0) newDirection = { x: 0, y: -this.tileSize };
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) newDirection = { x: 0, y: this.tileSize };
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) newDirection = { x: -this.tileSize, y: 0 };
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) newDirection = { x: this.tileSize, y: 0 };
                break;
        }
        
        this.nextDirection = newDirection;
    }
    
    update() {
        if (this.gameOver || !this.gameRunning) return;
        
        this.direction = this.nextDirection;
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver = true;
            if (this.restartBtn) this.restartBtn.disabled = false;
            return;
        }
        
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver = true;
                if (this.restartBtn) this.restartBtn.disabled = false;
                return;
            }
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            if (this.scoreDisplay) {
                this.scoreDisplay.textContent = `Счет: ${this.score}`;
            }
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x + this.tileSize / 2,
            this.food.y + this.tileSize / 2,
            this.tileSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#0f0' : '#0a0';
            this.ctx.fillRect(segment.x, segment.y, this.tileSize, this.tileSize);
            
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                const eyeSize = this.tileSize / 5;
                const offset = this.tileSize / 3;
                
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x + offset,
                    segment.y + offset,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x + this.tileSize - offset,
                    segment.y + offset,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Счет: ${this.score}`, 10, 25);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Игра окончена!', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.fillText(`Итоговый счет: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Нажмите "Перезапустить" для новой игры', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            this.gameLoopId = setTimeout(() => this.gameLoop(), 100);
        }
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameOver = false;
            
            if (this.restartBtn) {
                this.restartBtn.disabled = true;
            }
            
            if (this.gameLoopId) {
                clearTimeout(this.gameLoopId);
            }
            
            this.gameLoop();
        }
    }
    
    restartGame() {
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        
        this.resetGame();
        this.gameRunning = true;
        this.gameLoop();
    }
}

if (document.querySelector('.game-page') || document.getElementById('startBtn')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.snakeGame = new SnakeGame();
    });
}