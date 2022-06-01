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

// устанавливаем счёт = 0
var score = 0;

// звуки
var sfxCountdown = new Audio('./sfx/countdown.mp3');
var sfxGo = new Audio('./sfx/go.mp3');
var sfxScore = new Audio('./sfx/score.mp3');

// скорость движения змейки
// таймаут в мс с которым будет обновляться элемент canvas
var canvasRerenderTimeout = 120;

// уменьшить таймаут перерисовки canvas
decreaseCanvasRerenderTimeout = function(){
    fivePercentOfCurrentTimeout = (canvasRerenderTimeout / 100) * 5;
    canvasRerenderTimeout -= fivePercentOfCurrentTimeout;
}

// увеличить счёт
increaseScore = function(){
    score++;
    sfxScore.play();
}

// Рисум рамку
var drawBorder = function(){
    ctx.fillStyle = "Gray";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
}

// Выводим счёт игры в левом верзнем углу
var drawScore = function(){
    $("#score").text(`Счёт: ${score}`);
}

// Отменяем действие setInterval и печатаем сообщение "Конец игры"
var gameOver = function(){
    clearTimeout(rerenderCanvas);
    ctx.font = "60px Courier";
    ctx.fillStyle = "Black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Конец игры", width / 2, height / 2);
}

// Рисуем окружность (используя функцию из главы 14)
var circle = function(x, y, radius, fillCircle){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if(fillCircle){
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

// Задаем конструктор Block (ячейка)
var Block = function (col, row){
    this.col = col;
    this.row = row;
}

// Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color){
    var x = this.col * blockSize;
    var y = this.row * blockSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, blockSize, blockSize);
}

// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function(color){
    var centerX = this.col * blockSize + blockSize / 2;
    var centerY = this.row * blockSize + blockSize / 2;
    ctx.fillStyle = color;
    circle(centerX, centerY, blockSize / 2, true);
}

// Проверяем находится ли эта ячейка в той же позиции что и ячейка otherBlock
Block.prototype.equal = function(otherBlock){
    return this.col === otherBlock.col && this.row === otherBlock.row;
}

// Задаем конструктор Snake (змейка)
var Snake = function(){
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ];

    this.direction = "right";
    this.nextDirection = "right";
}

// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function(){
    for (var i = 0; i < this.segments.length; i++){
        this.segments[i].drawSquare("LimeGreen");
    }
}

// Создаём новую голову и добавляем её к началу змейки, чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function(){
    var head = this.segments[0];
    var newHead;

    this.direction = this.nextDirection;

    if(this.direction === "right"){
        newHead = new Block(head.col +1, head.row);
    } else if(this.direction === "down"){
        newHead = new Block(head.col, head.row + 1);
    } else if(this.direction === "left"){
        newHead = new Block(head.col - 1, head.row);
    } else if (this.direction === "up"){
        newHead = new Block(head.col, head.row - 1);
    }

    if(this.checkCollisions(newHead)){
        gameOver();
        return ;
    }

    this.segments.unshift(newHead);

    if(newHead.equal(apple.position)){  
        apple.move();
        increaseScore();
        decreaseCanvasRerenderTimeout();
    } else {
        this.segments.pop();
    }
}

// Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollisions = function(head){
    var leftCollision = (head.col === 0);
    var topCollision = (head.row === 0);
    var rightCollision = (head.col === widthInBlocks -1);
    var bottomCollision = (head.row === heightInBlocks - 1);

    var wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

    var selfCollision = false;

    for(var i = 0; i < this.segments.length; i++){
        if(head.equal(this.segments[i])){
            selfCollision = true;
        }
    }

    return wallCollision || selfCollision;
}

// Задаем следующее направление движения змейки на основе нажатой клавиши
Snake.prototype.setDirection = function(newDirection){
    if(this.direction === "up" && newDirection === "down"){
        return;
    } else if(this.direction === "right" && newDirection === "left"){
        return;
    } else if(this.direction === "down" && newDirection === "up"){
        return;
    } else if(this.direction === "left" && newDirection === "right"){
        return;
    }

    this.nextDirection = newDirection;
};

// Задаем конструктор Apple (яблоко)
var Apple = function(){
    this.position = new Block(20, 20);
};

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function(){
    this.position.drawCircle("Crimson");
};

// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function(){
    var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.position = new Block(randomCol, randomRow);
};


// ИГРА

var gamePaused = true;

// создаём объект-змейку и объект-яблоко
var snake = new Snake();
var apple = new Apple();

var rerenderCanvasCallback = function(){
    if(gamePaused === false){
        ctx.clearRect(0,0, width, height);
        drawScore();
        snake.move();
        snake.draw();
        apple.draw();
        drawBorder();
    }

    setTimeout(rerenderCanvasCallback, canvasRerenderTimeout);
}

var rerenderCanvas = setTimeout(rerenderCanvasCallback, canvasRerenderTimeout);

var directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

$("body").keydown(function (event){
    var newDirection = directions[event.keyCode];
    if(newDirection !== undefined){
        snake.setDirection(newDirection);
    }
});

$("#start-game-button").click(function(){

    $("#countdown-display").css("opacity", 1);

    $("#main-menu").css("opacity", 0);
    $("#main-menu").css("z-index", -9999);

    var countdown = 4;

    var countdownInterval = setInterval(function(){
        countdown--;

        if(countdown > 0)
        { 
            $("#countdown").text(countdown); 
            sfxCountdown.play();
        }
        else if(countdown === 0)
        { 
            $("#countdown").text("GO!");
            sfxGo.play();
        }
        
        if(countdown === -1){
            $("#countdown-display").css("opacity", 0);
            gamePaused = false;
            clearInterval(countdownInterval);
            $("#score").css("opacity", 1);
        }
    }, 1000);


 



})