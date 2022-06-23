// Настройка холста
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;

// вычисляем ширину и высоту в ячейках
var blockSize = 40;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;

var score = 0;

var sfxCountdown = new Audio('/snake/sfx/countdown.mp3');
var sfxGo = new Audio('/snake/sfx/go.mp3');
var sfxGameOver = new Audio('/snake/sfx/gameover.mp3');

var snakeColors = {
    'r': 65,
    'g': 130,
    'b': 65
};

// скорость движения змейки
// таймаут в мс с которым будет обновляться элемент canvas
var canvasRerenderTimeoutDefault = 280;
var canvasRerenderTimeout = 280;

// коды клавиш клавитатуры для управления змейкой
var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

//  ФУНКЦИИ-ПОМОГАЙКИ
// ф-ция взята со stackoverflow
// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
var mobileAndTabletCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var valueOfPercentFromNumber = function(number, percent) {
    return Math.floor((number / 100) * percent);
}

var getRandomIntInRange = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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


// ФУНКЦИИ ДЛЯ ИГРЫ
var showDPad = function(){
    $("#d-pad-wrapper").css("display", "block");
}

var hideDPad = function(){
    $("#d-pad-wrapper").css("display", "none");
}

var getRandomBorderColor = function(){
    listOfPrettyColors = [
        'Brown',
        'BurlyWood',
        'CadetBlue',
        'Chocolate',
        'Coral',
        'CornflowerBlue',
        'DarkOliveGreen',
        'DarkKhaki',
        'DarkSeaGreen',
        'DarkSalmon',
        'DarkSlateGrey',
        'Olive',
        'Teal'
    ];

    var randomInt = getRandomIntInRange(0, listOfPrettyColors.length-1);
    return listOfPrettyColors[randomInt];
};

var borderColor = getRandomBorderColor();

var drawCanvasBorder = function() {
    ctx.fillStyle = borderColor;
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
  $("#score-message").addClass("score-message-anim");
  $("#score-message").on('animationend', ()=>{
    $("#score-message").removeClass("score-message-anim");
  })
}

var scoreSetMessage = function(appleType){
    if(appleType.typeName == 'default'){
        $("#score-message").css("color", "Crimson");
        $("#score-message").text("+1");
    } else if(appleType.typeName == 'size'){
        $("#score-message").css("color", "LimeGreen");
        $("#score-message").text("+1 -ДЛИНА");
    } else if(appleType.typeName == 'speed'){
        $("#score-message").css("color", "Gold");
        $("#score-message").text("+1 -СКОРОСТЬ");
    } else if(appleType.typeName == 'score'){
        $("#score-message").css("color", "Indigo");
        $("#score-message").text("СЧЁТ +15%");
    } else if(appleType.typeName == 'black'){
        $("#score-message").css("color", "Black");
        $("#score-message").text("СЧЁТ +15% -ДЛИНА -СКОРОСТЬ");
    } 
}

// уменьшить таймаут перерисовки canvas
// и увеличить т.о скорость змейки
decreaseCanvasRerenderTimeoutByPercent = function(percent) {
    canvasRerenderTimeout -= valueOfPercentFromNumber(canvasRerenderTimeout, percent);
}

// увеличить таймаут перерисовки canvas
// и уменьшить т.о скорость змейки
increaseCanvasRerenderTimeoutByPercent = function(percent) {
    canvasRerenderTimeout += valueOfPercentFromNumber(canvasRerenderTimeout, percent);
}

var changeSnakeColor = function() {
    snakeColors.r -= 5;
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
    canvasRerenderTimeout = canvasRerenderTimeoutDefault;
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
            $("#countdown").addClass("bouncein-anim");
            $("#countdown").on('animationend', ()=>{
                $("#countdown").removeClass("bouncein-anim");
            });
            sfxCountdown.play();
        } else if (countdown === 0) {
            $("#countdown").text("GO!");
            $("#countdown").addClass("bouncein-anim");
            $("#countdown").on('animationend', ()=>{
                $("#countdown").removeClass("bouncein-anim");
            });
            sfxGo.play();
        }

        if (countdown === -1) {
           clearInterval(countdownInterval);
           startGame();
        }
    }, 1000);
}

var startGame = function(){
    hideCountdown();

    showScore();

    if(mobileAndTabletCheck() === true){
        showDPad();
    }

    gamePaused = false;
}

var showStartMenu = function() {
    if ($("#start-menu").hasClass("hidden")) {
        $("#start-menu").removeClass("hidden");
    }

    $("#start-menu").addClass("scale-in-anim");
}

var hideStartMenu = function() {
    $("#start-menu").addClass("hidden");
    $("#start-menu").removeClass("scale-in-anim");
}

var showGameOverMenu = function() {
    if ($("#game-over-menu").hasClass("hidden")) {
        $("#game-over-menu").removeClass("hidden");
        $("#game-over-menu").addClass("scale-in-anim");
        $("#game-over-score").text(`Ваш счёт: ${score}`);
        sfxGameOver.play();
        hideDPad();
    }
}

var hideGameOverMenu = function() {
    $("#game-over-menu").addClass("hidden");
    $("#game-over-menu").removeClass("scale-in-anim");
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
        increaseScore();
        scoreSetMessage(apple.appleType);
        apple.activateBonus(this);
        apple.playScoreSfx();
        apple.move();
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
            scoreToGenerate: 15,
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
        appleTimeout: new Audio('/snake/sfx/appleTimeout.mp3'),
        appleMove: new Audio('/snake/sfx/appleMove.mp3'),
        score1: new Audio('/snake/sfx/score1.mp3'),
        score2: new Audio('/snake/sfx/score2.mp3'),
        score3: new Audio('/snake/sfx/score3.mp3'),
        score4: new Audio('/snake/sfx/score4.mp3'),
        score5: new Audio('/snake/sfx/score5.mp3'),
        size: new Audio('/snake/sfx/size.mp3'),
        speed: new Audio('/snake/sfx/speed.mp3'),
        score: new Audio('/snake/sfx/score.mp3'),
        black: new Audio('/snake/sfx/black.mp3')
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
    // проверяет шансы выпадения бонусных яблочек от самого редкого (черное яблоко) у самому частому (жёлтое)
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
    canvasRerenderTimeout = canvasRerenderTimeout + valueOfPercentFromNumber(canvasRerenderTimeout, 40);
}

Apple.prototype.activateSizeBonus = function(snake) {
    // сокращаем змейку на 1/3 от длины
    var numOfSegments = Math.floor(snake.getSegmentsLength() / 3);
    snake.removeSegments(numOfSegments);
}

Apple.prototype.activateScoreBonus = function() {
    score += valueOfPercentFromNumber(score, 15);
}

Apple.prototype.activateBlackBonus = function(snake) {

    score += valueOfPercentFromNumber(score, 15);

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
        this.draw('#faf2c8')
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

// управление
$("#control-up").bind('touchstart', function() {
    // alert('up')
    snake.setDirection('up');
    $("#control-up").addClass("pressed")
});

$("#control-up").bind('touchend', function(){
    $("#control-up").removeClass("pressed")
});

$("#control-down").bind('touchstart', function() {
    // alert('down')
    snake.setDirection('down');
    $("#control-down").addClass("pressed")
});

$("#control-down").bind('touchend', function(){
    $("#control-down").removeClass("pressed")
});

$("#control-left").bind('touchstart', function() {
    // alert('left')
    snake.setDirection('left');
    $("#control-left").addClass("pressed")
});

$("#control-left").bind('touchend', function(){
    $("#control-left").removeClass("pressed")
});

$("#control-right").bind('touchstart', function() {
    // alert('right')
    snake.setDirection('right');
    $("#control-right").addClass("pressed")
});

$("#control-right").bind('touchend', function(){
    $("#control-right").removeClass("pressed")
});