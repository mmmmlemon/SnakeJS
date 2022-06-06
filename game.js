// Настройка холста
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;

// вычисляем ширину и высоту в ячейках
var blockSize = 20;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

var score = 0;

var sfxCountdown = new Audio('./sfx/countdown.mp3');
var sfxGo = new Audio('./sfx/go.mp3');
var sfxGameOver = new Audio('./sfx/gameover.mp3');

var snakeColors = {
    'r': 65,
    'g': 130,
    'b': 65
};

// скорость движения змейки
// таймаут в мс с которым будет обновляться элемент canvas
var canvasRerenderTimeout = 120;

valueOfPercentFromNumber = function(number, percent) {
    return Math.floor((number / 100) * percent);
}

// уменьшить таймаут перерисовки canvas
decreaseCanvasRerenderTimeoutByPercent = function(percent) {
    canvasRerenderTimeout -= valueOfPercentFromNumber(canvasRerenderTimeout, percent);
}

increaseCanvasRerenderTimeoutByPercent = function(percent) {
    canvasRerenderTimeout += valueOfPercentFromNumber(canvasRerenderTimeout, percent);
}

increaseCanvasRerenderTimoutByValue = function(value) {
    canvasRerenderTimeout += value;
}

var getRandomIntInRange = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Рисум рамку
var drawCanvasBorder = function() {
    ctx.fillStyle = "DarkKhaki";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
}

var drawScore = function() {
    $("#score").text(`Счёт: ${score}`);
}

var increaseScore = function() {
    score++;
}

var changeSnakeColor = function() {
    snakeColors.r -= 5;
    // snakeColors.g -= 5;
}

var setSnakeColorsToInitialState = function() {
    snakeColors = {
        'r': 65,
        'g': 130,
        'b': 65
    }
}

var setSnakeToInitialState = function(snake) {
    snake.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];
    snake.direction = "right";
    snake.nextDirection = "right";

    setSnakeColorsToInitialState();
}

var setGameToInitialState = function() {
    canvasRerenderTimeout = 120;
    score = 0;
}

// обратный отсчёт перед началом игры
var countdownBeforeStart = function(countdown) {

    countdown++;

    showCountdown();

    var countdownInterval = setInterval(function() {

        countdown--;

        if (countdown > 0) {
            $("#countdown").text(countdown);
            sfxCountdown.play();
        } else if (countdown === 0) {
            $("#countdown").text("GO!");
            sfxGo.play();
        }

        if (countdown === -1) {
            hideCountdown();
            gamePaused = false;
            clearInterval(countdownInterval);
            showScore();
        }
    }, 1000);
}

var showStartMenu = function() {
    if ($("#start-menu").hasClass("hidden")) {
        $("#start-menu").removeClass("hidden");
    }
}

var hideStartMenu = function() {
    $("#start-menu").addClass("hidden");
}

var showGameOverMenu = function() {
    if ($("#game-over-menu").hasClass("hidden")) {
        $("#game-over-menu").removeClass("hidden");
        $("#game-over-score").text(`Ваш счёт: ${score}`);
        sfxGameOver.play();
    }
}

var hideGameOverMenu = function() {
    $("#game-over-menu").addClass("hidden");
}

var showCountdown = function() {
    $("#countdown-display").removeClass("hidden");
    $("#countdown").text("");
}

var hideCountdown = function() {
    $("#countdown-display").addClass("hidden");
    $("#countdown").text("");
}

var showScore = function() {
    $("#score").removeClass("hidden");
}

var hideScore = function() {
    $("#score").addClass("hidden");
}

// Отменяем действие setTimeout и выводим меню "Game Over"
var gameOver = function(snake) {
    clearTimeout(rerenderCanvas);
    showGameOverMenu();
}

// Рисуем окружность
var circle = function(x, y, radius, fillCircle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

// Задаем конструктор Block (ячейка)
var Block = function(col, row) {
    this.col = col;
    this.row = row;
}

// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function(color) {
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
}

// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function(color) {
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
}

// Проверяем находится ли эта ячейка в той же позиции что и ячейка otherBlock
Block.prototype.equal = function(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
}

// Задаем конструктор Snake (змейка)
var Snake = function() {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
}

// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function() {
    for (var i = 0; i < this.segments.length; i++) {
        this.segments[i].drawSquare(`rgb(${snakeColors.r}, ${canvasRerenderTimeout+snakeColors.g}, ${snakeColors.b})`);
    }
}

// Создаём новую голову и добавляем её к началу змейки, чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function() {
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;

    if (this.direction === "right") {
        newHead = new Block(head.col + 1, head.row);
    } else if (this.direction === "down") {
        newHead = new Block(head.col, head.row + 1);
    } else if (this.direction === "left") {
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up") {
        newHead = new Block(head.col, head.row - 1);
    }

    if (this.checkCollisions(newHead)) {
        gamePaused = true;
        gameOver();
        showGameOverMenu();
        return;
    }

    this.segments.unshift(newHead);

    if (newHead.equal(apple.position)) {
        apple.activateBonus(this);
        apple.playScoreSfx();
        apple.move();
        increaseScore();
        changeSnakeColor();
        decreaseCanvasRerenderTimeoutByPercent(7);
    } else {
        this.segments.pop();
    }
}

// Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollisions = function(head) {
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks - 1);
    var bottomCollision = (head.row === heightInBlocks - 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    for (var i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
    }

    return wallCollision || selfCollision;
}

// Задаем следующее направление движения змейки на основе нажатой клавиши
Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === "up" && newDirection === "down") {
        return;
    } else if (this.direction === "right" && newDirection === "left") {
        return;
    } else if (this.direction === "down" && newDirection === "up") {
        return;
    } else if (this.direction === "left" && newDirection === "right") {
        return;
    }

    this.nextDirection = newDirection;
};

Snake.prototype.getSegmentsLength = function() {
    return this.segments.length;
}

Snake.prototype.removeSegments = function(numOfSegments) {
    if (this.segments.length >= 6) {
        numOfSegments += 1;

        for (var i = 0; i < numOfSegments; i++) {
            this.segments.pop();
        }
    } else {
        this.segments.pop();
    }
}

// Задаем конструктор Apple (яблоко)
var Apple = function() {
    this.position = new Block(20, 20);
    this.timer = 500;
    this.appleTypes = {
        default: {
            color: 'Crimson',
            typeName: 'default',
        },
        speed: {
            color: 'Gold',
            typeName: 'speed',
            chanceDivider: 8,
            scoreToGenerate: 15,
        },
        size: {
            color: 'LimeGreen',
            typeName: 'size',
            chanceDivider: 10,
            scoreToGenerate: 15,
        },
        score: {
            color: 'Indigo',
            typeName: 'score',
            chanceDivider: 16,
            scoreToGenerate: 25,
        },
        black: {
            color: 'Black',
            typeName: 'black',
            chanceDivider: 22,
            scoreToGenerate: 15,
            gameSpeedToGenerate: 50
        }
    };
    this.appleType = this.appleTypes.default;
    this.sfx = {
        appleTimeout: new Audio('./sfx/appleTimeout.mp3'),
        appleMove: new Audio('./sfx/appleMove.mp3'),
        score1: new Audio('./sfx/score1.mp3'),
        score2: new Audio('./sfx/score2.mp3'),
        score3: new Audio('./sfx/score3.mp3'),
        score4: new Audio('./sfx/score4.mp3'),
        score5: new Audio('./sfx/score5.mp3'),
        size: new Audio('./sfx/size.mp3'),
        speed: new Audio('./sfx/speed.mp3'),
        score: new Audio('./sfx/score.mp3'),
        black: new Audio('./sfx/black.mp3')
    }
};

Apple.prototype.playScoreSfx = function() {
        var randomInt = getRandomIntInRange(1, 5);
        var key = `score${randomInt}`;
        this.sfx[key].play();

        if(this.appleType.typeName != 'default'){
            this.sfx[this.appleType.typeName].play();
        }
 
}

Apple.prototype.decreaseTimer = function() {
    this.timer -= 1;
}

Apple.prototype.clearTimer = function() {
    this.timer = 50;
}

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function(color) {
    this.position.drawCircle(color);
};

// модифицируем положение яблочка чтобы оно не было около самой рамки
Apple.prototype.modifyPosition = function(position) {
    if (position == 1) {
        position++;
    } else if (position == widthInBlocks - 2) {
        position--;
    }
    return position;
};

Apple.prototype.switchAppleTypeRandomly = function() {

    var randomInt = getRandomIntInRange(999, 9999);

    // не красиво, но работает как надо
    // а вообще было бы неплохо переписать
    // проверяет шансы выпадения яблочек от самого редкого (черное яблоко) у самому частому (жёлтое)
    if (randomInt % this.appleTypes.black.chanceDivider == 0 && score > this.appleTypes.black.scoreToGenerate && canvasRerenderTimeout < this.appleTypes.black.gameSpeedToGenerate) {
        this.appleType = this.appleTypes.black;
    } else if (randomInt % this.appleTypes.score.chanceDivider == 0 && score > this.appleTypes.score.scoreToGenerate) {
        this.appleType = this.appleTypes.score;
    } else if (randomInt % this.appleTypes.size.chanceDivider == 0 && score > this.appleTypes.size.scoreToGenerate) {
        this.appleType = this.appleTypes.size;
    } else if (randomInt % this.appleTypes.speed.chanceDivider == 0 && score > this.appleTypes.speed.scoreToGenerate) {
        this.appleType = this.appleTypes.speed;
    } else {
        this.appleType = this.appleTypes.default;
    }

}

Apple.prototype.activateBonus = function(snake) {
    if (this.appleType.typeName == 'speed') {
        this.activateSpeedBonus();
    } else if (this.appleType.typeName == 'size') {
        this.activateSizeBonus(snake);
    } else if (this.appleType.typeName == 'score') {
        this.activateScoreBonus();
    } else if (this.appleType.typeName == 'black') {
        this.activateBlackBonus(snake);
    }
}

Apple.prototype.activateSpeedBonus = function() {
    canvasRerenderTimeout = canvasRerenderTimeout + valueOfPercentFromNumber(canvasRerenderTimeout, 30);
}

Apple.prototype.activateSizeBonus = function(snake) {
    var numOfSegments = Math.floor(snake.getSegmentsLength() / 3);
    snake.removeSegments(numOfSegments);
}

Apple.prototype.activateScoreBonus = function() {
    score += valueOfPercentFromNumber(score, 15);
}

Apple.prototype.activateBlackBonus = function(snake) {

    decreaseCanvasRerenderTimeoutByPercent(20);

    var currentGameSpeed = canvasRerenderTimeout;
    var originalGameSpeed = 120;
    var speedStep = (originalGameSpeed - currentGameSpeed) / 8;

    var currentSnakeLength = snake.segments.length;
    var snakeSizeStep = Math.floor((currentSnakeLength - 3) / 8);

    var timeoutInMs = 8000;

    var timeout = setInterval(function() {
        timeoutInMs -= 1000;
        canvasRerenderTimeout += speedStep;

        if(snake.segments.length > 3){
            for(var i = 0; i < snakeSizeStep; i++){
                snake.segments.pop();
            }
        }
        if (timeoutInMs == 0) {
            clearInterval(timeout);
        }
    }, 1000);
}

// Перемещаем яблоко в новую случайную позицию (и меняем его тип случайным образом)
Apple.prototype.move = function() {
    this.clearTimer();
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;

    // корректируем позицию, чтобы яблочко не появилось около самой границы
    randomCol = this.modifyPosition(randomCol);
    randomRow = this.modifyPosition(randomRow);

    this.position = new Block(randomCol, randomRow);

    this.switchAppleTypeRandomly();
};

Apple.prototype.cycle = function() {

    if (this.timer === 0) {
        this.move();
        apple.sfx.appleMove.play();
    } else if (this.timer === 15 || this.timer === 10 || this.timer === 5) {
        this.draw('Black')
        apple.sfx.appleTimeout.play();
    } else {
        this.draw(this.appleType.color);
    }
}

// ИГРА
// пауза
var gamePaused = true;

// создаём объект-змейку и объект-яблоко
var snake = new Snake();
var apple = new Apple();

// коды клавиш клавитатуры для управления змейкой
var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

var rerenderCanvasCallback = function() {
    if (gamePaused === false) {
        ctx.clearRect(0, 0, width, height);
        drawScore();
        snake.move();
        snake.draw();
        apple.decreaseTimer();
        apple.cycle();
        drawCanvasBorder();
    }

    setTimeout(rerenderCanvasCallback, canvasRerenderTimeout);
}

var rerenderCanvas = setTimeout(rerenderCanvasCallback, canvasRerenderTimeout);

// jQuery-обработчики для клавиатуры и элементов HTML
// кнопки клавиатуры
$("body").keydown(function(event) {
    if (gamePaused === false) {
        var newDirection = directions[event.keyCode];
        if (newDirection !== undefined) {
            snake.setDirection(newDirection);
        }
    }
});

// кнопка "Начать игру" в стартовом меню
$("#start-game-button").click(function() {
    hideStartMenu();
    countdownBeforeStart(3);
    apple.move();
});

// кнопка "Начать заново" в меню Game Over
$("#restart-game-button").click(function() {
    // перезапуск игры
    setSnakeToInitialState(snake);
    setGameToInitialState();
    hideGameOverMenu();
    countdownBeforeStart(3);
    apple.move();
});

// кнопка "В главное меню"
$("#back-to-menu-button").click(function() {
    showStartMenu();
    hideGameOverMenu();
    setSnakeToInitialState(snake);
    setGameToInitialState();
});