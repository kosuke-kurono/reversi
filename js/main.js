

// 画面を表示するためのクラス
class Gborad{
  constructor(parent){
    this.parent =document.getElementById(parent);

    // 緑のマスを64マス生成する
    this.sq = new Array(64);

    for(let i = 0; i<64; i++){
      // マスを一つ表示させるdiv要素
      let e = document.createElement('div');
      //上記で生成したdiv要素にクラス名"sq"を命名する
      e.className = "sq";

      let x =(i % 8) * 29 + 12;    //横幅の表示位置の計算
      let y =Math.floor(i / 8) * 29 +12;  //立幅の表示位置の計算

      // console.log(y);

      // 作成したクラスにスタイルを適応させる
      e.style.left =  x + "px";
      e.style.top =  y + "px";

      e.parent = this;

      
      e.myid = i;
      e.addEventListener("click", function(){this.parent.OnClick(this.myid);});
      
      
      // 石の生成～表示・非表示
      let d = document.createElement('div');
      d.className = "disc";
      d.style.display = "none";
      e.appendChild(d);
      e.disc = d;

      this.parent.appendChild(e);

      this.sq[i] = e;
    }
  }
  // x,yのマスに石を置く
  // d = 0 :石を消す
  // d = 1 :黒石を置く
  // d = 2 :白石を置く
  setDisc(x, y, d){
    let p =  y * 8 + x;
    this.sq[p].disc.style.display = d == 0 ? "none" : "block";
    if(d > 0){
      this.sq[p].disc.style.backgroundColor = d == 1 ? "black" : "white";
    }
  }
  // reversi.bdを渡して盤面を表示
  update (bd){
    for(let y=0; y<8;y++){
      for(let x=0;x<8;x++){
        this.setDisc(x,y,bd.get(x,y));
      } 
    }
  }
  OnClick(id){
    OnClickBoard(id);
  }
}
//着手に関する情報を表現するクラス
class MoveInfo{
  constructor(){
    this.turn = 0;
    this.pos = 0;
    this.flips = 0;
    this.disc = new Array(20);
  }
  clear(){
    this.turn = 0;
    this.pos = 0;
    this.flips = 0;
  }
  addFlipDisc(p){this.disc[this.flips++] = p;}
}
// 特定のマスから隣接するマスを表す配列
const VECT =[-10, -9, -8, -1, 1, 8, 9, 10];

class Reversi{
  constructor(){
    // 盤の外を含む91マスの配列を生成
    this.bd = new Array(91);
    // すべてのマスに8を代入
    for( let i=0;i<this.bd.length; i++){ this.bd[i] = 8;}
    for(let y=0; y<8; y++){
      for(let x=0; x<8; x++){
        // 番の外を外して64マスに空きマスの値0を代入
        this.bd[this.pos(x,y)] = 0;
      }
    }
    this.bd[this.pos(3,3)] = 2;
    this.bd[this.pos(4,3)] = 1;
    this.bd[this.pos(3,4)] = 1;
    this.bd[this.pos(4,4)] = 2;

    this.moveinfo = new Array(60);
    this.mp = 0;
    this.mpmax = 0;

    this.turn = 1;
  }
  pos(x,y){return (y+1) * 9 + x +1;}
  pos_x(p){return p % 9 - 1;}
  pos_y(p){return Math.floor(p/9)-1;}

  init(){
    for(let y=0; y<8; y++){
      for(let x=0; x<8; x++){
        // 番の外を外して64マスに空きマスの値0を代入
        this.bd[this.pos(x,y)] = 0;
      }
    }
    this.bd[this.pos(3,3)] = 2;
    this.bd[this.pos(4,3)] = 1;
    this.bd[this.pos(3,4)] = 1;
    this.bd[this.pos(4,4)] = 2;

    this.mp = 0;
    this.mpmax = 0;

    this.turn = 1;
  }
  get(x,y){
    return this.bd[this.pos(x,y)];
  }
  move(x,y){
    let p = this.pos(x,y);
    // 空きマスかを判定
    if(this.bd[p] != 0){
      return 0;
    }
    let moveinfo = new MoveInfo();
    let flipdiscs = 0;
    let oppdisc =this.turn == 2 ? 1 : 2;

    //隣接する８方向に相手の意思があるかを確認する
    for(let v=0 ; v<VECT.length; v++){
      let vect =VECT[v];
      let opps = 0;

      let n = p + vect;
      let flip =0;
      // 相手の意思が隣にあればさらにその隣も確認する
      while(this.bd[n] == oppdisc){
        n +=vect;
        flip++;
      }
      //次の石が自分の石であれば処理を実行する
      if(flip > 0 && this.bd[n] == this.turn){
     // 石を裏返す処理
        for(let i=0; i<flip;i++){
          this.bd[n -=vect] =this.turn;

          moveinfo.addFlipDisc( n );
        }
        // 裏返した石を数える
        flipdiscs += flip;
      }
    }
    // ８方向いずれかに打てた場合は打った箇所にも自身の石を表示させる
    if(flipdiscs > 0){
      this.bd[p] =this.turn;

      moveinfo.pos = p;
      moveinfo.turn = this.turn;
      this.moveinfo[this.mp++] = moveinfo;
      this.mpmax = this.mp;

      this.setNextTurn(); //手番を変える
    }
    return flipdiscs;
  }
  //ターンを切り替える  黒番なら白番へ移行する  白番なら黒番へ移行する 打てない場合はPass、互いに打てないと終局とする
  setNextTurn(){
    this.turn = this.turn == 2 ? 1 : 2;
    if(this.isPass(this.turn)){
      this.turn = this.turn == 2 ? 1 : 2;
      if(this.isPass(this.turn)){
        this.turn = 0;
      }
    }
  }
  isPass(turn){
    for(let y =0; y<8;y++){
      for(let x=0; x<8;x++){
        if(this.canMove(x,y,turn)){
          return false;
        }
      }
    }
    alert('パスしました');
    return true;
  }
  //打てるかどうかを判定する
  canMove(x,y,turn){
    let p = this.pos(x,y);
    // 空きマスかを判定
    if(this.bd[p] != 0){ //空きマスでなければ打てない
      return false;
    }
    let flipdiscs = 0;
    let oppdisc =this.turn == 2 ? 1 : 2;

    //隣接する８方向に相手の石があるかを確認する
    for(let v=0 ; v<VECT.length; v++){
      let vect =VECT[v];
      let opps = 0;

      let n = p + vect;
      let flip =0;
      // 相手の石が隣にあればさらにその隣も確認する
      while(this.bd[n] == oppdisc){
        n +=vect;
        flip++;
      }
      //次の石が自分の石であれば処理を実行する
      if(flip > 0 && this.bd[n] == this.turn){
        return true;
      }
    }
    return false;
  }
  unmove(){
    if(this.mp <= 0){
      return false;
    }
    let moveinfo = this.moveinfo[--this.mp];

    let opp = moveinfo.turn == 1 ? 2 : 1;

    for(let i = 0; i<moveinfo.flips; i++){
      this.bd[moveinfo.disc[i]] = opp;
    }
    this.bd[moveinfo.pos] = 0;

    this.turn = moveinfo.turn;

    return true;
  }
  forward(){
    if(this.mp >= this.mpmax){
      return false;
    }
    let moveinfo =this.moveinfo[this.mp++];
    let opp = moveinfo.turn == 1 ? 2 : 1;

    for(let i=0; i<moveinfo.flips;i++){
      this.bd[moveinfo.disc[i]] = moveinfo.turn;
    }
    this.bd[moveinfo.pos] = moveinfo.turn;
    this.setNextTurn();

      return true;
  }
}
let gBoard = null;
let gReversi = null;

function init(){
  gReversi.init();
  gBoard.update(gReversi);
}


function unmove(){
  if(gReversi.unmove()){
    gBoard.update(gReversi);
  }
}
function forward(){
  if(gReversi.forward()){
    gBoard.update(gReversi);
  }
}

function OnClickBoard(pos) {
let x = pos % 8;
let y =Math.floor(pos /8);
  if(gReversi.move(x,y) > 0){
    gBoard.update(gReversi);
  }
}
function setup(){
  noLoop();
  gBoard = new Gborad( "board");
  gReversi =new Reversi();

  gBoard.update(gReversi);

}

function draw(){
  // background(200); // 色の描画
}
