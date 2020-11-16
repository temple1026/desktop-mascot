/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

// import { Live2DCubismFramework as live2dcubismframework } from '@framework/live2dcubismframework';
import { Live2DCubismFramework as cubismid } from '@framework/id/cubismid';
import { Live2DCubismFramework as cubismusermodel } from '@framework/model/cubismusermodel';
import { Live2DCubismFramework as icubismmodelsetting } from '@framework/icubismmodelsetting';
import { Live2DCubismFramework as cubismmodelsettingjson } from '@framework/cubismmodelsettingjson';
// import { Live2DCubismFramework as cubismdefaultparameterid } from '@framework/cubismdefaultparameterid';
import { Live2DCubismFramework as acubismmotion } from '@framework/motion/acubismmotion';
// import { Live2DCubismFramework as cubismeyeblink } from '@framework/effect/cubismeyeblink';
// import { Live2DCubismFramework as cubismbreath } from '@framework/effect/cubismbreath';
import { Live2DCubismFramework as csmvector } from '@framework/type/csmvector';
import { Live2DCubismFramework as csmmap } from '@framework/type/csmmap';
import { Live2DCubismFramework as cubismmatrix44 } from '@framework/math/cubismmatrix44';
import { Live2DCubismFramework as cubismmotion } from '@framework/motion/cubismmotion';
import { Live2DCubismFramework as cubismmotionqueuemanager } from '@framework/motion/cubismmotionqueuemanager';
// import { Live2DCubismFramework as csmstring } from '@framework/type/csmstring';
// import { Live2DCubismFramework as csmrect } from '@framework/type/csmrectf';
// import { CubismLogInfo } from '@framework/utils/cubismdebug';
// import csmRect = csmrect.csmRect;
// import csmString = csmstring.csmString;
// import InvalidMotionQueueEntryHandleValue = cubismmotionqueuemanager.InvalidMotionQueueEntryHandleValue;
import CubismMotionQueueEntryHandle = cubismmotionqueuemanager.CubismMotionQueueEntryHandle;
import CubismMotion = cubismmotion.CubismMotion;
import CubismMatrix44 = cubismmatrix44.CubismMatrix44;
import csmMap = csmmap.csmMap;
import csmVector = csmvector.csmVector;
// import CubismBreath = cubismbreath.CubismBreath;
// import BreathParameterData = cubismbreath.BreathParameterData;
// import CubismEyeBlink = cubismeyeblink.CubismEyeBlink;
import ACubismMotion = acubismmotion.ACubismMotion;
import FinishedMotionCallback = acubismmotion.FinishedMotionCallback;
// import CubismFramework = live2dcubismframework.CubismFramework;
import CubismIdHandle = cubismid.CubismIdHandle;
import CubismUserModel = cubismusermodel.CubismUserModel;
import ICubismModelSetting = icubismmodelsetting.ICubismModelSetting;
import CubismModelSettingJson = cubismmodelsettingjson.CubismModelSettingJson;
// import CubismDefaultParameterId = cubismdefaultparameterid;

import { LAppPal } from './lapppal';
// import { gl, canvas, frameBuffer} from '../renderer/index';
import { TextureInfo, LAppTextureManager } from './myTexturemanager';
import * as LAppDefine from './lappdefine';
import 'whatwg-fetch';

export class MyModel extends CubismUserModel{
  _modelHomeDir: string = null;
  _modelSetting: ICubismModelSetting = null;
  _gl: WebGLRenderingContext = null;
  _motions = new csmMap<string, ACubismMotion>();
  _allMotionCount: number;
  _motionCount: number;
  _textureManager: LAppTextureManager = null;
  _userTimeSeconds: number;
  _eyeBlinkIds = null;
  _lipSyncIds = null;
  _frameBuffer = null;
  _setupCompleted: boolean = null;
  
  constructor(gl:WebGLRenderingContext, frameBuffer: any){
    super()
    this._gl = gl
    this._textureManager = new LAppTextureManager(this._gl)
    this._userTimeSeconds = 0
    this._eyeBlinkIds = new csmVector<CubismIdHandle>();
    this._lipSyncIds = new csmVector<CubismIdHandle>();
    this._frameBuffer = frameBuffer;
    this._setupCompleted = false;
  }

  public loadAssets(dir: string, fileName: string): void {
    this._modelHomeDir = dir;

    fetch(`${this._modelHomeDir}/${fileName}`)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const setting: ICubismModelSetting = new CubismModelSettingJson(
          arrayBuffer,
          arrayBuffer.byteLength
        );

        this._modelSetting = setting
        // 結果を保存
        this.setupModel();
      });
  }

  private setupModel(){
    const modelFileName = this._modelSetting.getModelFileName();
    if (modelFileName != '') {
      fetch(`${this._modelHomeDir}/${modelFileName}`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          this.loadModel(arrayBuffer);

          // EyeBlinkIds
          const setupEyeBlinkIds = (): void => {
            const eyeBlinkIdCount: number = this._modelSetting.getEyeBlinkParameterCount();
            for (let i = 0; i < eyeBlinkIdCount; ++i) {
              this._eyeBlinkIds.pushBack(this._modelSetting.getEyeBlinkParameterId(i));
            }
          };

          // LipSyncIds
          const setupLipSyncIds = (): void => {
            const lipSyncIdCount = this._modelSetting.getLipSyncParameterCount();
            for (let i = 0; i < lipSyncIdCount; ++i) {
              this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i));
            }
          };

          setupEyeBlinkIds();
          setupLipSyncIds();

          this.loadMotions()
        });
    } else {
      LAppPal.printMessage('Model data does not exist.');
    }
  }

  private loadMotions(){
    this._allMotionCount = 0;
    this._motionCount = 0;
    const group: string[] = [];
    const motionGroupCount: number = this._modelSetting.getMotionGroupCount();

    // モーションの総数を求める
    for (let i = 0; i < motionGroupCount; i++) {
      group[i] = this._modelSetting.getMotionGroupName(i);
      this._allMotionCount += this._modelSetting.getMotionCount(group[i]);
    }

    // モーションの読み込み
    for (let i = 0; i < motionGroupCount; i++) {
      this.preLoadMotionGroup(group[i]);
    }

    this.setupRender();
    this._setupCompleted = true;
  }

  private preLoadMotionGroup(group: string){
    for (let i = 0; i < this._modelSetting.getMotionCount(group); i++) {
      const motionFileName = this._modelSetting.getMotionFileName(group, i);

      // ex) idle_0
      const name = `${group}_${i}`;
      fetch(`${this._modelHomeDir}/${motionFileName}`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          const tmpMotion: CubismMotion = this.loadMotion(
            arrayBuffer,
            arrayBuffer.byteLength,
            name
          );

          let fadeTime = this._modelSetting.getMotionFadeInTimeValue(group, i);
          if (fadeTime >= 0.0) {
            tmpMotion.setFadeInTime(fadeTime);
          }

          fadeTime = this._modelSetting.getMotionFadeOutTimeValue(group, i);
          if (fadeTime >= 0.0) {
            tmpMotion.setFadeOutTime(fadeTime);
          }
          
          tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);

          if (this._motions.getValue(name) != null) {
            ACubismMotion.delete(this._motions.getValue(name));
          }
          
          this._motions.setValue(name, tmpMotion);
        });
    }
  }

  private setupRender(){
    this.createRenderer();
    this.setupTextures();
    this.getRenderer().startUp(this._gl);
  }

  public startMotion(
    group: string,
    no: number,
    priority: number,
    onFinishedMotionHandler?: FinishedMotionCallback
  ): CubismMotionQueueEntryHandle {
    const name = `${group}_${no}`;
    let motion: CubismMotion = this._motions.getValue(name) as CubismMotion;
    let autoDelete = false;

    return this._motionManager.startMotionPriority(
      motion,
      autoDelete,
      priority
    );
  }

    /**
   * テクスチャユニットにテクスチャをロードする
   */
  private setupTextures(): void {
    // iPhoneでのアルファ品質向上のためTypescriptではpremultipliedAlphaを採用
    const usePremultiply = true;

    // テクスチャ読み込み用
    const textureCount: number = this._modelSetting.getTextureCount();

    for (
      let modelTextureNumber = 0;
      modelTextureNumber < textureCount;
      modelTextureNumber++
    ) {
      // テクスチャ名が空文字だった場合はロード・バインド処理をスキップ
      if (this._modelSetting.getTextureFileName(modelTextureNumber) == '') {
        console.log('getTextureFileName null');
        continue;
      }

      // WebGLのテクスチャユニットにテクスチャをロードする
      let texturePath = this._modelSetting.getTextureFileName(
        modelTextureNumber
      );
      texturePath = this._modelHomeDir + texturePath;

      // ロード完了時に呼び出すコールバック関数
      const onLoad = (textureInfo: TextureInfo): void => {
        this.getRenderer().bindTexture(modelTextureNumber, textureInfo.id);
      };

      // 読み込み
      this._textureManager.createTextureFromPngFile(texturePath, usePremultiply, onLoad);
      this.getRenderer().setIsPremultipliedAlpha(usePremultiply);
    }
  }

    /**
   * 更新
   */
  public update(): void {
    if(!this._setupCompleted) return;

    // LAppPal.printMessage("update")
    const deltaTimeSeconds: number = LAppPal.getDeltaTime();
    this._userTimeSeconds += deltaTimeSeconds;

    this._dragManager.update(deltaTimeSeconds);
    this._dragX = this._dragManager.getX();
    this._dragY = this._dragManager.getY();

    // モーションによるパラメータ更新の有無
    let motionUpdated = false;
    //--------------------------------------------------------------------------
    this._model.loadParameters(); // 前回セーブされた状態をロード
    if (this._motionManager.isFinished()) {
      // モーションの再生がない場合、待機モーションの中からランダムで再生する
      LAppPal.printMessage("start motion")
      this.startMotion(LAppDefine.MotionGroupIdle, 0, LAppDefine.PriorityIdle, null);

    } else {
      LAppPal.printMessage("update motion")
      motionUpdated = this._motionManager.updateMotion(
        this._model,
        deltaTimeSeconds
      ); // モーションを更新
    }
    this._model.saveParameters(); // 状態を保存
    //--------------------------------------------------------------------------

    // ドラッグによる変化
    // ドラッグによる顔の向きの調整
    // this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30); // -30から30の値を加える
    this._model.addParameterValueByIndex(0, this._dragX * 30);
    this._model.addParameterValueByIndex(1, this._dragY * 30);
    this._model.addParameterValueByIndex(2, this._dragX * this._dragY * -30);

    // ドラッグによる体の向きの調整
    this._model.addParameterValueByIndex(20, this._dragX * 10); // -10から10の値を加える

    // ドラッグによる目の向きの調整
    this._model.addParameterValueByIndex(7, this._dragX); // -1から1の値を加える
    this._model.addParameterValueByIndex(8, this._dragY);

    // this._model.addParameterValueByIndex(27, this._dragX);

    this._model.update();
  }

    /**
   * モデルを描画する処理。モデルを描画する空間のView-Projection行列を渡す。
   */
  private doDraw(): void {
    // キャンバスサイズを渡す
    let canvas = this._gl.canvas;
    const viewport: number[] = [0, 0, canvas.width, canvas.height];

    this.getRenderer().setRenderState(this._frameBuffer, viewport);
    this.getRenderer().drawModel();
  }

  /**
   * モデルを描画する処理。モデルを描画する空間のView-Projection行列を渡す。
   */
  public draw(matrix: CubismMatrix44): void {
    if(!this._setupCompleted) return;

    // 各読み込み終了後
    matrix.multiplyByMatrix(this._modelMatrix);

    this.getRenderer().setMvpMatrix(matrix);

    this.doDraw();
  }

  public getCurrentTime(){
    return this._userTimeSeconds
  }
}