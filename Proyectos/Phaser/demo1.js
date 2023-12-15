var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD=false, nave, nave2, bala2, bala2D = false;

var salto, right, left, sentido = 1;
var menu;

var velocidadBala, velocidadBala2 = -velocidadRandom(100,300), movSpeed = 5;
var despBala, despBala2;
var estatusMov, estatusN;
var estatusAire;
var estatuSuelo;
var resetP = false, cont = 0;

var valores=[];

var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[], 
    nnNetwork2, nnEntrenamiento2, nnSalida2, datosEntrenamiento2=[];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/psyduck-sprites.png',32 ,36);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
    juego.load.image('nave2', 'assets/game/ufo.png');
    juego.load.image('bala2', 'assets/sprites/purple_ball.png');
}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w-100, h-70, 'nave');
    bala = juego.add.sprite(w-100, h, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');

    //Creamos la nueva nave espacial.
    nave2 = juego.add.sprite(jugador.x - 25 , 25, 'nave2');
    bala2 = juego.add.sprite(jugador.x, 100, 'bala2')


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;

    //Agregamos animaciones al movimiento.
    jugador.animations.add('derecha', [15,16,17]);
    jugador.animations.add('izquierda', [12,13,14]);
    jugador.animations.add('up', [20]);
    jugador.animations.add('cry', [32,33,34]);
    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;
    jugador.animations.play('cry', 10, true);

    //Agregamos las fisicas a la nueva bala
    juego.physics.enable(bala2);
    bala2.body.colliderWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //Agregamos movilidad a Psyduck
    left = juego.input.keyboard.addKey(Phaser.Keyboard.A);
    right = juego.input.keyboard.addKey(Phaser.Keyboard.D);

    
    nnNetwork =  new synaptic.Architect.Perceptron(3, 6, 6, 1);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

    nnNetwork2 = new synaptic.Architect.Perceptron(3, 6, 6, 2); //889
    nnEntrenamiento2 = new synaptic.Trainer(nnNetwork2);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000, shuffle: true});
}

function enRedNeural2(){
    nnEntrenamiento2.train(datosEntrenamiento2, {rate: 0.0003, iterations: 10000, shuffle: true});
}

function datosDeEntrenamiento(param_entrada){
    nnSalida = nnNetwork.activate(param_entrada);
    var aire=Math.round( nnSalida[0]*100 );
    //console.log(nnSalida[0]);
    return aire > 80;
} 

function datosDeEntrenamiento2(param_entrada){
    nnSalida2 = nnNetwork2.activate(param_entrada);
    var mov = Math.round(nnSalida2[0]*100);
    var nmov = Math.round(nnSalida2[1]*100);
    console.log(param_entrada[0] + ", " + param_entrada[1] + ", " + param_entrada[2] + " " + nnSalida2[0] + " " + nnSalida2[1]);
    return nnSalida2[0] > nnSalida2[1];
}

function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                datosEntrenamiento2 = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento Red Neuronal 1: "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    console.log("","Entrenamiento Red Neuronal 2: "+ datosEntrenamiento2.length +" valores" );
                    enRedNeural2();
                    eCompleto=true;
                }
                modoAuto = true;
                cont = 0;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;
            jugador.position.x = w - 750;
            nave2.position.x = jugador.position.x - 25;
            jugador.animations.play('cry', 10, true);

        }
    }
}


function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala.body.velocity.x = 0;
    bala.position.x = w-100;
    balaD=false;

    //Agregamos para que se reseten las variables
    /*Lineas para el juego mas sencillo
    jugador.position.x = w - 750;
    nave2.position.x = jugador.position.x - 25;
    */
    bala2.body.velocity.y = 0;
    bala2.position.y = 40;
    bala2.position.x = jugador.position.x;
    bala2D = false;
    //despBala2 = 0;
}


function saltar(){
    jugador.animations.play('up', 10, true)
    jugador.body.velocity.y = -270;
}

function movR(){
    estatusMov = 1;
    estatusN = 0;
    jugador.x = jugador.x + movSpeed;
    nave2.x = nave2.x + movSpeed;
    jugador.animations.play('derecha', 10, true);
}

function movL(){
    estatusMov = 1;
    estatusN = 0;
    jugador.x = jugador.x - movSpeed;
    nave2.x = nave2.x - movSpeed;
    jugador.animations.play('izquierda', 10, true);
}

function update() {

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);
    estatus = 0;
    estatusMov = 0;
    estatusN = 1;

    if(resetP){
        return 0;
    }

    if(!jugador.body.onFloor()) {
       estatus = 1
    }

    if(jugador.position.x > 400 && sentido == 1) sentido = 0;
    else if(jugador.position.x < 25 && sentido == 0) sentido =1;
	
    despBala = Math.floor( jugador.position.x - bala.position.x );
    //despBala2 = Math.floor(jugador.position.y - bala2.position.y);
    despBala2 = Math.floor(bala2.position.y - jugador.position.y);

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }

    //Agregamos los movimientos al update
    if(modoAuto == false && right.isDown && jugador.body.onFloor()){
        movR();
    }

    if(modoAuto == false && left.isDown && jugador.body.onFloor()){
        movL();
    }
    
    if(modoAuto == true && bala.position.x > 0 && jugador.body.onFloor() && resetP == false){
        if(bala2.position.y <= h){
            if(datosDeEntrenamiento2([despBala2, velocidadBala2, bala2.position.y])){
                if(cont % 2 == 0) movR();
                else movL();
            }
        }
        if(datosDeEntrenamiento([despBala, velocidadBala, bala.position.x])){
            saltar();
        }
    }
    if(modoAuto == true && jugador.position.x > 400 && bala.position.x <= 0 ){
        resetPlayer();
    }
    if(balaD == true && bala2D == false  && bala.position.x <= 0 && resetP == false){
        disparo_nave2();
    }

    if( balaD==false && bala2D == false && resetP == false){
        disparo();
    }

    if( bala.position.x <= 0  && bala2.position.y >= h && resetP == false){
        resetVariables();
    }
    
    if( modoAuto ==false  && bala.position.x > 0 && resetP == false){
        datosEntrenamiento.push({
                'input' :  [despBala , velocidadBala, bala.position.x],
                'output':  [estatus]  
        });
        //console.log(jugador.position.x + " " + bala.position.x + " " + despBala + ", " + velocidadBala + ", " + estatus);
        if(bala2.position.y <= h){
            datosEntrenamiento2.push({
                'input' :  [despBala2 , velocidadBala2, bala2.position.y],
                'output':  [estatusMov, estatusN]  
            }); 
            console.log(jugador.position.y + ", " + despBala2 + ", " + velocidadBala2 + ", " + bala2.position.y + ", " + estatusMov + " " + estatusN);
        }      
        //console.log("Desplazamiento Bala: " + despBala2+ " Velocidad Bala: " + velocidadBala2 + " Estatus Salto: " + estatusMov);
        //console.log(despBala2 + ", " + velocidadBala2 + ", " + estatusMov);
   }
}

function resetPlayer(){
    jugador.position.x = w - 750;
    nave2.position.x = jugador.position.x - 25;
}
function disparo(){
    velocidadBala =  -1 * velocidadRandom(300,500);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
}

function disparo_nave2(){
    velocidadBala2 = -1 * velocidadRandom(100,300);
    bala2.body.velocity.y = velocidadBala2;
    bala2.body.velocity.x = 0;
    bala2D = true;
    cont = velocidadRandom(0, 10);
    //console.log(cont)
}

function colisionH(){
    console.log("COLISION");
    //resetVariables();
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}