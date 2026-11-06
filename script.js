class DominoGame {
    constructor() {
        this.board = [];
        this.playerHand = [];
        this.computerHand = [];
        this.boneyard = [];
        this.currentPlayer = 'player'; // 'player' или 'computer'
        this.gameOver = false;

        this.boardEl = document.getElementById('board');
        this.playerHandEl = document.getElementById('player-hand');
        this.computerCountEl = document.getElementById('computer-count');
        this.playerCountEl = document.getElementById('player-count');
        this.statusEl = document.getElementById('status');
        this.drawBtn = document.getElementById('draw-btn');
        this.passBtn = document.getElementById('pass-btn');
        this.boneyardEl = document.getElementById('boneyard');

        this.drawBtn.addEventListener('click', () => this.drawFromBoneyard());
        this.passBtn.addEventListener('click', () => this.passTurn());

        this.initGame();
    }

    initGame() {
        this.generateBones();
        this.shuffleBones();
        this.dealBones();
        this.checkForDoubleSix();
        this.updateUI();
    }

    generateBones() {
        this.boneyard = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                this.boneyard.push([i, j]);
            }
        }
    }

    shuffleBones() {
        for (let i = this.boneyard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.boneyard[i], this.boneyard[j]] = [this.boneyard[j], this.boneyard[i]];
        }
    }

    dealBones() {
        this.playerHand = [];
        this.computerHand = [];
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.boneyard.pop());
            this.computerHand.push(this.boneyard.pop());
        }
    }

    checkForDoubleSix() {
        const playerHasDS = this.playerHand.some(bone => bone[0] === 6 && bone[1] === 6);
        const computerHasDS = this.computerHand.some(bone => bone[0] === 6 && bone[1] === 6);

        if (playerHasDS) {
            this.board.push([6, 6]);
            this.playerHand = this.playerHand.filter(bone => !(bone[0] === 6 && bone[1] === 6));
            this.currentPlayer = 'computer';
        } else if (computerHasDS) {
            this.board.push([6, 6]);
            this.computerHand = this.computerHand.filter(bone => !(bone[0] === 6 && bone[1] === 6));
            this.currentPlayer = 'player';
        } else {
            this.currentPlayer = 'player';
        }
    }

    updateUI() {
        this.renderBoard();
        this.renderPlayerHand();
        this.renderBoneyard();
        this.updateCounts();
        this.updateStatus();
        this.updateControls();
    }

    renderBoard() {
        this.boardEl.innerHTML = '';
        if (this.board.length === 0) return;

        this.board.forEach((bone, index) => {
            const boneEl = this.createBoneElement(bone);
            boneEl.classList.add('on-board');
            // Змейка: поворот каждой второй костяшки (кроме первой)
            if (index > 0 && index % 2 !== 0) {
                boneEl.style.transform = 'rotate(90deg)';
            }
            this.boardEl.appendChild(boneEl);
        });
    }

    renderPlayerHand() {
        this.playerHandEl.innerHTML = '';
        this.playerHand.forEach((bone, index) => {
            const boneEl = this.createBoneElement(bone);
            boneEl.dataset.index = index;
            boneEl.addEventListener('click', () => this.playBone(index));
            this.playerHandEl.appendChild(boneEl);
        });
    }

    renderBoneyard() {
        this.boneyardEl.innerHTML = '';
        for (let i = 0; i < this.boneyard.length; i++) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('boneyard-bone');
            this.boneyardEl.appendChild(placeholder);
        }
    }

    createBoneElement([left, right]) {
        const bone = document.createElement('div');
        bone.classList.add('bone');

        const ends = document.createElement('div');
        ends.classList.add('bone-ends');

        const leftPip = this.createPips(left);
        const rightPip = this.createPips(right);
        
        ends.appendChild(leftPip);
        ends.appendChild(rightPip);

        const center = document.createElement('div');
        center.classList.add('bone-center');
        center.textContent = '•';

        bone.appendChild(ends);
        bone.appendChild(center);
        return bone;
    }

    createPips(count) {
        const container = document.createElement('div');
        container.classList.add('pips-container');
        for (let i = 0; i < 7; i++) {
            const pip = document.createElement('div');
            pip.classList.add('pips');
            if (i >= count) {
                pip.classList.add('pip-empty');
            }
            container.appendChild(pip);
        }
        return container;
    }

    updateCounts() {
        this.playerCountEl.textContent = this.playerHand.length;
        this.computerCountEl.textContent = this.computerHand.length;
    }

    updateStatus() {
        if (this.gameOver) {
            if (this.playerHand.length === 0) {
                this.statusEl.textContent = 'Победа! Вы вывели все кости.';
            } else if (this.computerHand.length === 0) {
                this.statusEl.textContent = 'Поражение. Компьютер вывел все кости.';
            } else {
                this.statusEl.textContent = 'Рыба! Ничьей не бывает, считаем по костям.';
            }
            return;
        }

        if (this.currentPlayer === 'player') {
            this.statusEl.textContent = 'Ваш ход.';
        } else {
            this.statusEl.textContent = 'Ход компьютера...';
            setTimeout(() => this.computerTurn(), 800);
        }
    }

    updateControls() {
        const canPlay = this.playerHand.some(bone => this.isValidMove(bone));
        const boneyardEmpty = this.boneyard.length === 0;

        this.drawBtn.disabled = canPlay || boneyardEmpty;
        this.passBtn.disabled = canPlay || boneyardEmpty;
    }

    isValidMove(bone) {
        if (this.board.length === 0) return true;
        const [leftEnd, rightEnd] = [this.board[0][0], this.board[this.board.length - 1][1]];
        return bone[0] === leftEnd || bone[1] === leftEnd || bone[0] === rightEnd || bone[1] === rightEnd;
    }

    playBone(index) {
        if (this.currentPlayer !== 'player' || this.gameOver) return;

        const bone = this.playerHand[index];
        if (!this.isValidMove(bone)) {
            this.statusEl.textContent = 'Эта кость не подходит!';
            return;
        }

        this.placeBoneOnBoard(bone);
        this.playerHand.splice(index, 1);
        
        if (this.playerHand.length === 0) {
            this.endGame('player');
            return;
        }

        this.currentPlayer = 'computer';
        this.updateUI();
    }

    placeBoneOnBoard(bone) {
        if (this.board.length === 0) {
            this.board.push(bone);
            return;
        }

        const [leftEnd, rightEnd] = [this.board[0][0], this.board[this.board.length - 1][1]];
        
        if (bone[0] === leftEnd) {
            this.board.unshift([bone[1], bone[0]]);
        } else if (bone[1] === leftEnd) {
            this.board.unshift(bone);
        } else if (bone[0] === rightEnd) {
            this.board.push(bone);
        } else if (bone[1] === rightEnd) {
            this.board.push([bone[1], bone[0]]);
        }
    }

    computerTurn() {
        if (this.gameOver || this.currentPlayer !== 'computer') return;

        // Сортировка по убыванию суммы очков (самая крупная костяшка)
        this.computerHand.sort((a, b) => (b[0] + b[1]) - (a[0] + a[1]));

        for (let i = 0; i < this.computerHand.length; i++) {
            const bone = this.computerHand[i];
            if (this.isValidMove(bone)) {
                this.placeBoneOnBoard(bone);
                this.computerHand.splice(i, 1);
                
                if (this.computerHand.length === 0) {
                    this.endGame('computer');
                    return;
                }

                this.currentPlayer = 'player';
                this.updateUI();
                return;
            }
        }

        // Если нет хода
        if (this.boneyard.length > 0) {
            this.computerHand.push(this.boneyard.pop());
            this.currentPlayer = 'player';
            this.updateUI();
        } else {
            this.currentPlayer = 'player';
            this.updateUI();
        }
    }

    drawFromBoneyard() {
        if (this.boneyard.length > 0 && !this.isValidMoveAny()) {
            this.playerHand.push(this.boneyard.pop());
            this.updateUI();
        }
    }

    isValidMoveAny() {
        return this.playerHand.some(bone => this.isValidMove(bone));
    }

    passTurn() {
        if (this.isValidMoveAny() || this.boneyard.length === 0) return;
        this.currentPlayer = 'computer';
        this.updateUI();
    }

    endGame(winner) {
        this.gameOver = true;
        this.updateUI();
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new DominoGame();
});
