import { Live2DCubismFramework as live2dcubismframework, Option, LogLevel} from "@framework/live2dcubismframework";
import { Live2DCubismFramework as cubismmatrix44 } from '@framework/math/cubismmatrix44';
import { MyModel } from "./mymodel";
import { LAppPal } from "./lapppal";
import * as mydefine from "../mydefine";

import Csm_CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import cubismframework = live2dcubismframework.CubismFramework;
import { mySocket } from "./mysocket";

// 画面の描画処理を担当するクラス
export class MyWindow{
  _gl: WebGLRenderingContext = null;
  _canvas: HTMLCanvasElement = null;

  constructor(){
    this._canvas = document.createElement('canvas');;
    this._canvas.width = mydefine.canvas_width;
    this._canvas.height = mydefine.canvas_height;

    document.body.appendChild(this._canvas);

    // @ts-ignore
    this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');

  }
  
  public update(){
    // 画面の初期化
    this._gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // 深度テストを有効化
    this._gl.enable(this._gl.DEPTH_TEST);

    // 近くにある物体は、遠くにある物体を覆い隠す
    this._gl.depthFunc(this._gl.LEQUAL);

    // カラーバッファや深度バッファをクリアする
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    this._gl.clearDepth(1.0);

    // 透過設定
    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);

    // this.gl.useProgram(_programId);
    // this._gl.flush();
  }

  public getGl(){
    return this._gl
  }

  public getCanvasSize(){
    let width: number = this._canvas.width;
    let height: number = this._canvas.height;

    return {width, height}
  }

  public getCanvas(){
    return this._canvas
  }

  public getFramebuffer(){
    return this._gl.getParameter(this._gl.FRAMEBUFFER_BINDING);
  }
}

// デスクトップマスコットの処理を行うクラス
export class MyApp{

  mymodel: MyModel = null;
  model_dir: string = null;
  model_name: string = null;
  CsmOption: Option = null;
  mywindow: MyWindow = null;
  mysocket: mySocket = null;
  prevTime: number = null;

  constructor(){
    this.mywindow = new MyWindow();
    this.CsmOption = new Option();

    // フレームワークの初期化
    cubismframework.startUp(this.CsmOption);
    cubismframework.initialize();

    this.mymodel = new MyModel(this.mywindow.getGl(), this.mywindow.getFramebuffer())
    this.mymodel.loadAssets(mydefine.model_dir, mydefine.model_name);

    this.mywindow.getCanvas().onmousemove = this.onmoved.bind(this);
    this.mywindow.getCanvas().onmouseleave = this.onLeaved.bind(this);
    
    this.mysocket = new mySocket("ws://localhost:7700", this.mymodel);
  }
  
  private onmoved(e: MouseEvent){
    if(this.mymodel == null) return;

    const {width, height} = this.mywindow.getCanvasSize();

    const rect = (e.target as Element).getBoundingClientRect();
    const posX: number = (e.clientX - rect.left) / width * 2 - 1;
    const posY: number = (e.clientY - rect.top) / height * -2 + 1;
    
    this.mymodel.setDragging(posX, posY);
  }

  private onLeaved(e: MouseEvent): void{
    if(this.mymodel == null) return

    this.mymodel.setDragging(0, 0);
  }

  public run(){

    // 画面の描画
    const loop = (): void => {
      
      LAppPal.updateTime();

      // 画面の更新
      this.mywindow.update();

      // 投影のための行列を定義
      let projection: Csm_CubismMatrix44 = new Csm_CubismMatrix44();

      // 描画スケールの決定
      projection.scale(1.8, 1.8);
      projection.translateRelative(0.0, 0.0)
 
      // 経過時間が4秒経過したらアニメーションを更新するためにソケット通信する
      this.decideAction();

      // モデルの更新
      this.mymodel.update();

      // モデルの描画
      this.mymodel.draw(projection);
      // ループのために再帰呼び出し
      requestAnimationFrame(loop);
    };

    loop();
  }

  private decideAction(){
    // 現在の経過時間をモデルから取得
    let currTime: number = this.mymodel.getCurrentTime();

    // 4秒経過時にモーションを決める
    if(currTime - this.prevTime > 4.0){
      this.prevTime = currTime
      this.mysocket.askAction();
    }
  }
}


let myapp = new MyApp()
myapp.run()