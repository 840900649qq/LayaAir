import { SimpleSingletonList } from "../../d3/component/SimpleSingletonList";
import { SingletonList } from "../../d3/component/SingletonList";
import { BaseRender } from "../../d3/core/render/BaseRender";
import { ISceneRenderManager } from "../RenderInterface/RenderPipelineInterface/ISceneRenderManager";

export class SceneRenderManager implements ISceneRenderManager{
    /** @internal */
	_renders: SimpleSingletonList = new SimpleSingletonList();
    _motionRenders:SingletonList<BaseRender> = new SingletonList();
    constructor(){

    }

    get list(){
        return this._renders;
    }

    set list(value){
        this._renders = value;
    }
    
    addRenderObject(object: BaseRender): void {
        this._renders.add(object);
    }
    removeRenderObject(object: BaseRender): void {
        this._renders.remove(object);
    }

    removeMotionObject(object: BaseRender): void {
        let index =object._motionIndexList;
        if(index!=-1){//remove
            let elements = this._motionRenders.elements;
            this._motionRenders.length-=1;
            elements[length]._motionIndexList = index;
            elements[index] = elements[length];
        }
        
        //TODO
    }
    updateMotionObjects(): void {
        for(let i = 0;i<this._motionRenders.length;i++){
            this._motionRenders.elements[i].bounds;
            this._motionRenders.elements[i]._motionIndexList = -1;
        }
        this._motionRenders.length = 0;
        
        //TODO
    }
    addMotionObject(object: BaseRender): void {
        if(object._motionIndexList==-1){
            object._motionIndexList = this._motionRenders.length;
            this._motionRenders.add(object);
        }
        
        //TODO
    }
    destroy(): void {
        this._renders.clearElement();
    }

}