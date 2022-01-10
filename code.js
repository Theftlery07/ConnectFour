var placement;
var games = [];
var amount;
var going = [null,0];
var size;
var done = 0;
var winRate = [[0,0,0],[null,null,null]];
var quicker;
var turnWin = [];
var table;
var largest = 0;
var locked = false;

function startUp(){
    placement = document.getElementById("area");
    amount = document.getElementById("amoun");
    size = document.getElementById("size");
    winRate[1][0] = document.getElementById("red");
    winRate[1][1] = document.getElementById("black");
    winRate[1][2] = document.getElementById("tie");
    quicker = document.getElementById("drawing");
    table = document.getElementById("table");
    for(var i=0;i<21;i++){
        var holder = document.createElement("tr");
        for(var j=0;j<4;j++){
            holder.appendChild(document.createElement("td"));
        }
        table.appendChild(holder);
        turnWin.length+=1;
        turnWin[turnWin.length-1] = [0,0];
    }
    for(var i=0;i<3;i++){
        table.children[i].style.display = "none";
    }
    tabler();
}

function locker(){
    if(locked == false){
        locked = true;
    }
    else{
        locked = false;
    }
}

function tabler(){
    for(var i=0;i<table.children.length;i++){
        for(var j=0;j<2;j++){
            table.children[i].children[j+2].innerHTML = turnWin[i][j];
        }
        table.children[i].children[0].innerHTML = "Turn "+(i+1)+" |";
        table.children[i].children[1].innerHTML = turnWin[i][0]+turnWin[i][1];
        if(turnWin[i][0]+turnWin[i][1]>largest){
            largest = turnWin[i][0]+turnWin[i][1];
        }
    }
}

function charting(){
    var holder = table.nextElementSibling.getContext("2d");
    holder.fillStyle = "blanchedalmond";
    holder.fillRect(0,0,table.nextElementSibling.clientHeight+10,table.nextElementSibling.clientWidth+10)
    console.log(table.nextElementSibling.clientHeight);
    for(var i=0;i<table.children.length;i++){
        holder.fillStyle = "#FF0000";
        holder.fillRect(0,(i*(((470-(21*2)-(2*10))/2.85)/18))-18,(turnWin[i][0]/largest)*table.nextElementSibling.clientWidth,4);
        holder.fillStyle = "#000000";
        holder.fillRect((turnWin[i][0]/largest)*table.nextElementSibling.clientWidth,(i*(((470-(21*2)-(2*10))/2.85)/18))-18,(turnWin[i][1]/largest)*table.nextElementSibling.clientWidth,4);
    }
}

function bigger(){
    table.parentElement.style.display = "flex";
    charting()
}

function smaller(){
    if(locked == false){
        table.parentElement.style.display = "none";
    }

}

function creater(){
    var holder = document.getElementsByClassName("games");
    while(holder.length>0){
        placement.removeChild(holder[0]);
    }
    going[1]=0;
    if(going[0]!=null){
        clearInterval(going[0]);
    }
    games.length=0;
    winRate[0][0] = 0;
    winRate[0][1] = 0;
    winRate[0][2] = 0;
    winRate[1][0].innerHTML = "Red: 0 0%";
    winRate[1][1].innerHTML = "Black: 0 0%";
    winRate[1][2].innerHTML = "Tie: 0 0%";
    largest = 0;
    for(var i=0;i<turnWin.length;i++){
        turnWin[i]=[0,0];
    }
    tabler();
    charting();
    for(var i=0;i<amount.value;i++){
        games.length+=1;
        games[games.length-1] = new game([new player(),new player()],size.value,!quicker.checked);
    }
    
}

function timer(){
    if(going[1]%2 == 0){
        going[0]=setInterval(function(){go()},10);
    }
    else{
        clearInterval(going[0]);
    }
    going[1]+=1;
}

function go(){
    for(var i=0;i<games.length;i++){
        if(games[i]!=undefined){
            while(!games[i].action(games[i].players[games[i].turn%2].decide(games[i].options))){}
            if(!quicker.checked){
                games[i].drawer();
            }
            if(games[i].end()){
                done+=1;
                if(games[i].won){
                    winRate[0][(games[i].turn-1)%2] += 1;
                    turnWin[Math.floor((games[i].turn-1)/2)][(games[i].turn-1)%2]+=1;
                }
                else{
                    winRate[0][2] += 1;
                }
                games[i] = undefined;
            }
        }
    }
    if(done!=0){
        winRate[1][0].innerHTML = "Red: "+winRate[0][0]+" "+Math.round(winRate[0][0]*1000/done)/10+"%";
        winRate[1][1].innerHTML = "Black: "+winRate[0][1]+" "+Math.round(winRate[0][1]*1000/done)/10+"%";
        winRate[1][2].innerHTML = "Tie: "+winRate[0][2]+" "+Math.round(winRate[0][2]*1000/done)/10+"%";

        tabler();
        charting();
    }
    
    
    if(done == games.length){
        games.length = 0;
        console.log("fresh");
        done = 0;
        if(going[0]!=null){
            clearInterval(going[0]);
        }
    }

    // else{
    //     go();
    // }
}

function game(players,size,drawOn){
    this.won = false;
    this.players = players;
    if(drawOn){
        this.canva = document.createElement("canvas");
        this.canva.width = 7*size;
        this.canva.height = 6*size;
        this.canva.className = "games";
        this.canva.style.border = "solid black 1px";
        placement.appendChild(this.canva);
        this.twod = this.canva.getContext("2d");
    }

    this.turn = 0;
    
    this.board = [];
    this.board.length = 7;
    this.options = [];
    for(var i=0;i<this.board.length;i++){
        this.options.length+=1;
        this.options[i]=i;
    }
    for(var i=0;i<this.board.length;i++){
        this.board[i] = [];
        this.board[i].length = 6;
    }

    this.end = function(){
        if(this.turn == this.board.length*this.board[0].length){
            return true;
        }
        return this.won;
    }

    this.checker = function(place){
        var totals = [[1,1,1],[1,1,1],[1,1,1]];

        for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
                if(i-1!=0 || j-1!=0){
                    var counter = 1;
                    if(place[0]+((i-1)*counter)>=0 && place[0]+((i-1)*counter)<this.board.length && place[1]+((j-1)*counter)>=0 && place[1]+((j-1)*counter)<this.board[0].length){
                        while(this.board[place[0]+((i-1)*counter)][place[1]+((j-1)*counter)] == this.board[place[0]][place[1]]){
                            totals[i][j]+=1;
                            counter+=1
                            if(place[0]+((i-1)*counter)>=0 && place[0]+((i-1)*counter)<this.board.length && place[1]+((j-1)*counter)>=0 && place[1]+((j-1)*counter)<this.board[0].length){
                                
                            }
                            else{
                                break;
                            }
                        }
                    }
                }
            }
        }
        for(var i=0;i<3;i++){
            for(var j=0;j<3;j++){
                if(totals[i][j]>4){
                    this.board[place[0]][place[1]] = (this.turn%2)+2;
                    this.won = true;
                    return true
                }
                else if(totals[i][j]+totals[2-i][2-j]>4){
                    this.board[place[0]][place[1]] = (this.turn%2)+2;
                    this.won = true;
                    return true
                }
            }
        }
    }

    this.action = function(inp){
        if(this.board[inp][this.board[inp].length-1] != undefined){
            this.options[inp] == undefined;
            return false;
        }
        for(var i=0;i<this.board[inp].length;i++){
            if(this.board[inp][i] == undefined){
                this.board[inp][i] = this.turn%2
                this.checker([inp,i]);
                this.turn+=1;
                return true;
            }
        }
        return false;
    }

    this.drawer = function(){
        for(var i=0;i<this.board.length;i++){
            for(var j=0;j<this.board[i].length;j++){
                if(this.board[i][j]!=undefined){
                    this.twod.beginPath();
                    this.twod.arc(((this.canva.width/7)*i)+(this.canva.width/14),((this.canva.width/7)*(this.board[i].length-j-1))+(this.canva.width/14),this.canva.width/14,0,2*Math.PI);
                    if(this.board[i][j]==0){
                        this.twod.fillStyle="#FF0000";
                    }
                    else if(this.board[i][j]==1){
                        this.twod.fillStyle="#000000";
                    }
                    else if(this.board[i][j]==2){
                        this.twod.fillStyle="#00FF00";
                    }
                    else{
                        this.twod.fillStyle="#0000FF";
                    }
                    this.twod.fill();
                }
            }
        }
    }

    return this;
}

function player(){

    this.decide = function(options){
        var choice;
        while(choice == undefined){
            choice = options[Math.floor(Math.random()*options.length)];
        }
        return choice;
    }

    return this;
}