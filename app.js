
/*
Arcade game of Unnar Thor Bachmann.
This is my work in project 3 in Udacity's nanodegree course front-end developing.
 */
/****************************** Global variables ***************************/
var gridWidth = 101;
var gridHeight = 83;
// y positions the bugs are allowed to have.
// Grids coordinates were enemy bugs appear.
// Also used by the bonus class.
var yGridEnemy = [41.5,124.5,207.5];
var yGridBonus = yGridEnemy;
var xGridBonus = [0,101,202,303,404];
//The score matrix of the bonus item
var scoreMatrix = [200,400,600,800];
// sprite used by the player.
var heros = ['images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
];
// sprite used by the bonus item.
var bonuses = ['images/Gem Blue.png',
                'images/Gem Green.png',
                'images/Gem Orange.png',
                'images/key.png',
                'images/Selector.png',
                'images/Star.png',
                'images/Heart.png'
];
var immuneSprite = 'images/Rock.png';
/***************************** The Bonus class begins *****************************/
/*
*The Bonus class is for the bonus items which a player can collect.
*/
/*
*@description The constructor of the Bonus class. Calls the reset function which
*assigns values to all the class variables. The bonus item is reset
*multiple times during a game.
*@constructor
*/
var Bonus = function() {
    this.reset();
};
    /*
    *@description The bonus item has rank (with increasing value for the player), position
    *on the bricks, sprite according to rank and score for the player if he manages
    *to collide with it within the item's span.
    */
    Bonus.prototype.reset = function() {
        this.x = xGridBonus[Math.floor(Math.random()*5)];
        this.y = yGridBonus[Math.floor(Math.random()*3)];
        this.rank = Math.floor(Math.random()*7);
        this.sprite = bonuses[this.rank];
        this.span = Math.floor(Math.random()*10000)+1000;
        this.creationTime = Date.now() + this.span;
        this.score = scoreMatrix[this.rank];
    };
    /*
    *@description A bonus item is updated according to it's live span. If it is
    *past it's span the it is reset. Otherwise check for collision with the player.
    */
    Bonus.prototype.update = function() {
        // Item is reset when the current time span is over.
        if (Date.now() > this.creationTime + this.span) {
            this.reset();
        }
        this.collision();
    };
    /*
    *@description Draw a bonus item if it has been created.
    */
    Bonus.prototype.render = function() {
        // Item is drawn if it has been created.
        if (Date.now() > this.creationTime) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
        ctx.clearRect(0, 29, 5*gridWidth, 29);
    };
    /*
    *@description Detects collision with the player
    */
    Bonus.prototype.collision = function() {
        var dx = Math.abs(player.x - this.x);
        var dy = Math.abs(player.y - this.y);
        // Collision detected with the player
        // Some items give score while other can
        // give live or immunity.
        if (dy === 0 && dx < gridWidth/2) {
            // Collision with the heart
            if (this.rank == 6) {
                player.lives += 1;
            }
            else if (this.rank === 5) {
                // Collision with the star
                player.isImmune = true;
                player.immuneTime = Date.now() + 7000;
                console.log("a");
            }
            else if (this.rank === 4)
            {
                // Collision with the selector
                player.isImmune = true;
                player.immuneTime = Date.now() + 4000;
                console.log("b");
            }
            else {
                player.score += this.score;
            }
            this.reset();
        }
    };
/***************************** The Bonus class ends *****************************/
/***************************** The Enemy class begins *****************************/

/*
*The Enemy class is the blueprints for the bugs which the player must avoid.
*/
/*
*@description The constructor of the Enemy class. Instantiates the class variables.
*Notice that the enemy bugs start off the screen by random value.
*@constructor
*/
var Enemy = function() {
    this.updateCoordinates();
    this.updateSpeed();
    this.sprite = 'images/enemy-bug.png';
};
    /*
    *@description A ,,private function''. Only called within the class but not outside of it.
    *The update is done in a random fashion.
    */
    Enemy.prototype.updateSpeed = function() {
        // Method of creating random speed bugs.
        // A result of testing and running the
        // game over and over.
        if (Math.random() < 0.8) {
            this.vx = Math.random(1000)+200;
        }
        else {
            this.vx = Math.random(200)+500;
        }
    };
    /*
    *@description A ,,private function''. Updates the speed of the speed of the
    *enemies.
    */
    Enemy.prototype.updateCoordinates = function() {
            // Notice that the enemy starts off the screen.
            this.x = Math.floor(Math.random()*(-100));
            // Has discrite y-coordination.
            this.y = yGridEnemy[Math.floor(Math.random()*3)];
    };
    /*
    *@description The bugs are updated by vx but the effect of vx multiplied by
    *dt as suggested. If the bug is off the canvas then its
    *cooridantes and updated as well as the speed.
    *@param {number} - dt
    */
    Enemy.prototype.update = function(dt) {
        this.x = this.x + this.vx*dt;
        // Update the enemy bug once it is off
        // the screen to the right.
        if (this.x > 5*gridWidth) {
            this.updateCoordinates();
            this.updateSpeed();
        }
        // If it collides with the player then
        // it results in a loss of live.
        if (this.collision()) {
            player.lives = player.lives-1;
        }
    };
    /*
    *@description A function which draws the enemy (the bug) on screen.
    */
    Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
    /*
    *@description Detecting collision with the player and updating neccessary
    *variables.
    */
    Enemy.prototype.collision = function() {
        var dx = Math.abs(player.x - this.x);
        var dy = Math.abs(player.y - this.y);
        // Collision criteria. Notice that the
        // player collide variable is always reset.
        if (!player.isImmune && dy === 0 && dx < gridWidth/2 && player.collide === false) {
            player.collide = true;
            player.lives = player.lives - 1;
            player.reset();
        }
        else {
            player.collide = false;
        }
    };
/***************************** The Enemy class ends *****************************/
/***************************** The Player class begins *****************************/
/*
*@description The constructor of the Player class.
*/
var Player = function(x,y) {
    // x coordinate of the player.
    this.x = x;
    // y coordinate of the player.
    this.y = y;
    // velocity in x direction.
    this.vx = 0;
    // velocity in y direction.
    this.vy = 0;
    this.lives = 3;
    // index to the sprite array.
    this.index = 0;
    this.sprite = heros[this.index];
    this.collide = false;
    this.score = 0;
    this.maxScore  = 0;
    this.isImmune = false;
    this.immuneTime = 0;
};
/*
*@description Updates the position of the player on the board. The steps are taken in discrete manner
*Adds 100 to the player if he reaches the water. There is a check to ensure the player does not walk
*off the screen. If the player has collide with enemy he is reset.
*/
    Player.prototype.update = function() {
        // To do.
        if (this.collide === true) {
            this.reset();
        }
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        this.vx = 0;
        this.vy = 0;
        if (this.immuneTime < Date.now()) {
            this.isImmune = false;
        }
        // These if statement are to prevent the
        // player from running off the screen.
        if (this.x > 5*gridWidth-1) {
            this.x -= gridWidth;
        }
        if (this.x < 0*gridWidth-1) {
            this.x += gridWidth;
        }
        if (this.y > 5*gridHeight-1) {
            this.y -= gridHeight;
        }
        if (this.y <= -12) {
            this.score += 100;
            this.reset();
        }
};
    /*
    *@description Draws the player on screen and updates the scores.
    */
    Player.prototype.render = function() {
        // Player renders normally
        if (!this.isImmune) {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
        else {
            ctx.drawImage(Resources.get(immuneSprite), this.x, this.y);
        }
        var strLives = "Lives: "+ player.lives;
        var strScore = "Scores: " + player.score;
        ctx.clearRect(0, 570, 505, 700);
        ctx.fillText(strLives,0,620);
        ctx.fillText(strScore,200,620);
        ctx.fillText("Press arrows to move.", 0, 660);
        ctx.fillText("Other keys change hero.", 0, 690);

    };
    /*
    *@description Arrows move the player on screen. Different key pressing
    *changes the sprite (hero) used to draw the player.
    *Actually the player is moved when updated. Here only the speed
    *of the player is reset.
    *@param {string} direction
    */
    Player.prototype.handleInput = function(direction) {
        if (direction === 'left') {
            this.vx = -gridWidth;
        }
        else if (direction === 'right') {
            this.vx = gridWidth;
        }
        else if (direction === 'up') {
            this.vy = -gridHeight;
        }
        else if (direction === 'down') {
            this.vy = gridHeight;
        }
        else {
            this.index = (this.index+1) % heros.length;
            this.sprite = heros[this.index];
        }
    };
    /*
    *@description Resets the player and updated the max score if neccessary.
    */
    Player.prototype.reset = function() {
        this.x = 2*gridWidth;
        this.y = 5*gridHeight-gridHeight/2;
        this.collide = false;
        // update the maximum score if current score is higher than
        // the maximum score and all lives are lost.
        if (this.maxScore < this.score && this.lives === 0) {
            this.maxScore = this.score;
            ctx.clearRect(2*gridWidth, 0, 2*gridWidth, 25);
            ctx.fillText("Max Score:" + player.maxScore,2*gridWidth,25);
        }
    };
/***************************** The Player class ends *****************************/
//The players, the enemys and the bonus item instantiated.
allEnemies = [new Enemy(),new Enemy(), new Enemy()];
player = new Player(2*gridWidth,5*gridHeight-gridHeight/2);
bonus = new Bonus();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
