import { RenderState } from "../../../../d3/core/material/RenderState";
import { CommandUniformMap } from "../../../../d3/core/scene/Scene3DShaderDeclaration";
import { ShaderPass } from "../../../../d3/shader/ShaderPass";
import { CommandEncoder } from "../../../../layagl/CommandEncoder";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Stat } from "../../../../utils/Stat";
import { ShaderCompileDefineBase } from "../../../../webgl/utils/ShaderCompileDefineBase";
import { CullMode } from "../../../RenderEnum/CullMode";
import { RenderStateType } from "../../../RenderEnum/RenderStateType";
import { IRenderShaderInstance } from "../../../RenderInterface/IRenderShaderInstance";
import { Shader3D } from "../../../RenderShader/Shader3D";
import { ShaderData } from "../../../RenderShader/ShaderData";
import { ShaderVariable } from "../../../RenderShader/ShaderVariable";
import { RenderStateCommand } from "../../../RenderStateCommand";
import { RenderStateContext } from "../../../RenderStateContext";


/**
 * @internal
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class ShaderInstance {
	/**@internal */
	private _shaderPass: ShaderCompileDefineBase|ShaderPass;

	private _renderShaderInstance:IRenderShaderInstance;

	/**@internal */
	_sceneUniformParamsMap: CommandEncoder;
	/**@internal */
	_cameraUniformParamsMap: CommandEncoder;
	/**@internal */
	_spriteUniformParamsMap: CommandEncoder;
	/**@internal */
	_materialUniformParamsMap: CommandEncoder;
	/**@internal */
	private _customUniformParamsMap: any[] = [];
	/**@internal */
	private _stateParamsMap: any[] = [];

	/**@internal */
	_uploadMark: number = -1;
	/**@internal */
	_uploadMaterial: ShaderData;
	/**@internal RenderIDTODO*/
	_uploadRender: any;
	/** @internal */
	_uploadRenderType: number = -1;
	/**@internal CamneraTOD*/
	_uploadCameraShaderValue: ShaderData;
	/**@internal SceneIDTODO*/
	_uploadScene: any;

	_cullStateCMD:RenderStateCommand = new RenderStateCommand();

	/**
	 * 创建一个 <code>ShaderInstance</code> 实例。
	 */
	constructor(vs: string, ps: string, attributeMap: any, shaderPass: ShaderCompileDefineBase) {
		//super(vs,ps,attributeMap);
		this._renderShaderInstance = LayaGL.renderEngine.createShaderInstance(vs,ps,attributeMap);
		this._shaderPass = shaderPass;
		this._create();
	}
	

	/**
	 * @internal TODO3D
	 */
	protected _create(): void {		
		this._sceneUniformParamsMap = new CommandEncoder();
		this._cameraUniformParamsMap = new CommandEncoder();
		this._spriteUniformParamsMap = new CommandEncoder();
		this._materialUniformParamsMap = new CommandEncoder();
		const sceneParams = CommandUniformMap.createGlobalUniformMap("Scene3D");
		const spriteParms = CommandUniformMap.createGlobalUniformMap("Sprite3D");
		const cameraParams = CommandUniformMap.createGlobalUniformMap("BaseCamera");
		const customParams = CommandUniformMap.createGlobalUniformMap("Custom");
		let i,n;
		let data:ShaderVariable[] = this._renderShaderInstance.getUniformMap();
		for(i=0,n=data.length;i<n;i++){
			let one:ShaderVariable = data[i];
			if(sceneParams.hasPtrID(one.dataOffset)){
				this._sceneUniformParamsMap.addShaderUniform(one);
			}else if(cameraParams.hasPtrID(one.dataOffset)){
				this._cameraUniformParamsMap.addShaderUniform(one);
			}else if(spriteParms.hasPtrID(one.dataOffset)){
				this._spriteUniformParamsMap.addShaderUniform(one);
			}else if(customParams.hasPtrID(one.dataOffset)){
				this._customUniformParamsMap||(this._customUniformParamsMap = []);
				this._customUniformParamsMap[one.dataOffset] = one;
			}else{
				this._materialUniformParamsMap.addShaderUniform(one);
			}
		}
		var stateMap: {[key:string]:number} = (<ShaderPass>this._shaderPass)._stateMap;
		for (var s in stateMap)
			this._stateParamsMap[stateMap[s]] = Shader3D.propertyNameToID(s);
	}



	

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		this._renderShaderInstance.destroy();
		this._sceneUniformParamsMap = null;
		this._cameraUniformParamsMap = null;
		this._spriteUniformParamsMap = null;
		this._materialUniformParamsMap = null
		this._customUniformParamsMap = null;
		this._stateParamsMap = null;

		this._uploadMaterial = null;
		this._uploadRender = null;
		this._uploadCameraShaderValue = null;
		this._uploadScene = null;
	}
	

	//miner RenderState  removeTODO

	/**
	 * @internal
	 */
	 private _getRenderState(shaderDatas: any, stateIndex: number): any {
		var stateID: any = this._stateParamsMap[stateIndex];
		if (stateID == null)
			return null;
		else
			return shaderDatas[stateID];
	}

	bind(){
		return this._renderShaderInstance.bind();
	}

	uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: ShaderData, uploadUnTexture: boolean){
		Stat.shaderCall+=LayaGL.renderEngine.uploadUniforms(this._renderShaderInstance,shaderUniform,shaderDatas,uploadUnTexture);
	}

	/**
	 * @internal
	 */
	uploadRenderStateBlendDepth(shaderDatas: ShaderData): void {
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var datas: any = shaderDatas.getData();

		var depthWrite: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_WRITE);
		var depthTest: any = this._getRenderState(datas, Shader3D.RENDER_STATE_DEPTH_TEST);
		var blend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND);
		var stencilRef:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_REF);
		var stencilTest:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_TEST);
		var stencilWrite:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_WRITE);
		var stencilOp:any = this._getRenderState(datas,Shader3D.RENDER_STATE_STENCIL_OP);
		depthWrite == null && (depthWrite = renderState.depthWrite);
		depthTest == null && (depthTest = renderState.depthTest);
		blend == null && (blend = renderState.blend);
		stencilRef == null && (stencilRef = renderState.stencilRef);
		stencilTest ==null && (stencilTest = renderState.stencilTest);
		stencilWrite == null && (stencilTest = renderState.stencilWrite);
		stencilOp ==null && (stencilOp = renderState.stencilOp);

		RenderStateContext.setDepthMask(depthWrite);
		if (depthTest === RenderState.DEPTHTEST_OFF)
		RenderStateContext.setDepthTest(false);
		else {
			RenderStateContext.setDepthTest(true);
			RenderStateContext.setDepthFunc(depthTest);
		}
		//blend
		switch (blend) {
			case RenderState.BLEND_DISABLE:
				RenderStateContext.setBlend(false);
				break;
			case RenderState.BLEND_ENABLE_ALL:
				var blendEquation: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION);
				var srcBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC);
				var dstBlend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST);
				blendEquation == null && (blendEquation = renderState.blendEquation);
				srcBlend == null && (srcBlend = renderState.srcBlend);
				dstBlend == null && (dstBlend = renderState.dstBlend);
				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquation(blendEquation);
				RenderStateContext.setBlendFunc(srcBlend, dstBlend);
				break;
			case RenderState.BLEND_ENABLE_SEPERATE:
				var blendEquationRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_RGB);
				var blendEquationAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_EQUATION_ALPHA);
				var srcRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_RGB);
				var dstRGB: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_RGB);
				var srcAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_SRC_ALPHA);
				var dstAlpha: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND_DST_ALPHA);
				blendEquationRGB == null && (blendEquationRGB = renderState.blendEquationRGB);
				blendEquationAlpha == null && (blendEquationAlpha = renderState.blendEquationAlpha);
				srcRGB == null && (srcRGB = renderState.srcBlendRGB);
				dstRGB == null && (dstRGB = renderState.dstBlendRGB);
				srcAlpha == null && (srcAlpha = renderState.srcBlendAlpha);
				dstAlpha == null && (dstAlpha = renderState.dstBlendAlpha);
				RenderStateContext.setBlend(true);
				RenderStateContext.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
				RenderStateContext.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
				break;
		}

		//Stencil
		RenderStateContext.setStencilMask(stencilWrite);
		if(stencilTest==RenderState.STENCILTEST_OFF){
			RenderStateContext.setStencilTest(false);
		}else{
			RenderStateContext.setStencilTest(true);
			RenderStateContext.setStencilFunc(stencilTest,stencilRef);
			
		}
		RenderStateContext.setstencilOp(stencilOp.x,stencilOp.y,stencilOp.z);
		
		
		
	}

	/**
	 * @internal
	 */
	uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean): void {
		this._cullStateCMD.clear();
		var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
		var datas: any = shaderDatas.getData();
		var cull: any = this._getRenderState(datas, Shader3D.RENDER_STATE_CULL);
		cull == null && (cull = renderState.cull);

		var forntFace: number;
		switch (cull) {
			case RenderState.CULL_NONE:
				this._cullStateCMD.addCMD(RenderStateType.CullFace,false);
				break;
			case RenderState.CULL_FRONT:
				this._cullStateCMD.addCMD(RenderStateType.CullFace,true);
				if(isTarget==invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace =CullMode.Back;
				this._cullStateCMD.addCMD(RenderStateType.FrontFace,forntFace);
				break;
			case RenderState.CULL_BACK:
				this._cullStateCMD.addCMD(RenderStateType.CullFace,true);
				if(isTarget!=invertFront)
					forntFace = CullMode.Front;//gl.CCW
				else
					forntFace =CullMode.Back;
				this._cullStateCMD.addCMD(RenderStateType.FrontFace,forntFace);
				
				break;
		}
		this._cullStateCMD.applyCMD();
	}

	/**
	 * @internal
	 */
	uploadCustomUniform(index: number, data: any): void {
		Stat.shaderCall += LayaGL.renderEngine.uploadCustomUniforms(this._renderShaderInstance,this._customUniformParamsMap, index, data);
	}
}
