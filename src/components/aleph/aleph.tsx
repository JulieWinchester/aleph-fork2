import {
  Component,
  Prop,
  State,
  Method,
  Event,
  EventEmitter
} from "@stencil/core";
import { Store, Action } from "@stencil/redux";
import {
  appSetSrc,
  appSetSrcLoaded,
  appAddTool,
  appRemoveTool,
  appSelectTool,
  appUpdateTool,
  appLoadTools,
  appSetDisplayMode,
  appSetOrientation,
  appSetToolsVisible,
  appSetToolsEnabled,
  appSetOptionsVisible,
  appSetOptionsEnabled,
  appSetBoundingBoxVisible,
  appSetSlicesIndex,
  appSetSlicesWindowWidth,
  appSetSlicesWindowCenter,
  appSetVolumeSteps,
  appSetVolumeWindowWidth,
  appSetVolumeWindowCenter,
  appSetAngleToolEnabled,
  appSetAnnotationToolEnabled,
  appSetRulerToolEnabled
} from "../../redux/actions";
import { configureStore } from "../../redux/store";
import { Tool } from "../../interfaces/interfaces";
import { Orientation } from "../../enums/Orientation";
import { DisplayMode } from "../../enums/DisplayMode";
import { GetUtils, ThreeUtils, CreateUtils } from "../../utils/utils";
import { Constants } from "../../Constants";
import { MeshFileType } from "../../enums/MeshFileType";
type Entity = import("aframe").Entity;
type Scene = import("aframe").Scene;

@Component({
  tag: "uv-aleph",
  styleUrl: "aleph.css",
  shadow: false
})
export class Aleph {
  //#region Private variables
  private _srcLoadedHandler: any;
  private _stack: any;
  private _stackHelper: AMI.StackHelper;

  private _targetEntity: Entity;
  private _scene: Scene;
  private _scale: number;
  private _validTarget: boolean;
  private _maxMeshDistance: number;
  private _camera: Entity;

  private _intersectingTool: boolean;
  //#endregion

  //#region Redux states, props & methods
  @Prop({ context: "store" }) store: Store;
  @Prop() dracoDecoderPath: string | null;
  @Prop() width: string = "640px";
  @Prop() height: string = "480px";

  appSetSrc: Action;
  appSetSrcLoaded: Action;
  appAddTool: Action;
  appRemoveTool: Action;
  appSelectTool: Action;
  appUpdateTool: Action;
  appLoadTools: Action;
  appSetDisplayMode: Action;
  appSetOrientation: Action;
  appSetToolsVisible: Action;
  appSetToolsEnabled: Action;
  appSetOptionsVisible: Action;
  appSetOptionsEnabled: Action;
  appSetBoundingBoxVisible: Action;
  appSetSlicesIndex: Action;
  appSetSlicesWindowWidth: Action;
  appSetSlicesWindowCenter: Action;
  appSetVolumeSteps: Action;
  appSetVolumeWindowWidth: Action;
  appSetVolumeWindowCenter: Action;
  appSetAngleToolEnabled: Action;
  appSetAnnotationToolEnabled: Action;
  appSetRulerToolEnabled: Action;

  @State() src: string | null;
  @State() srcLoaded: boolean;
  @State() selectedTool: string;
  @State() tools: Tool[];
  @State() displayMode: DisplayMode;
  @State() orientation: Orientation;
  @State() toolsVisible: boolean;
  @State() toolsEnabled: boolean;
  @State() optionsVisible: boolean;
  @State() optionsEnabled: boolean;
  @State() boundingBoxVisible: boolean;
  @State() slicesIndex: number;
  @State() slicesWindowWidth: number;
  @State() slicesWindowCenter: number;
  @State() volumeSteps: number;
  @State() volumeWindowWidth: number;
  @State() volumeWindowCenter: number;
  @State() angleToolEnabled: boolean;
  @State() annotationToolEnabled: boolean;
  @State() rulerToolEnabled: boolean;

  @Method()
  async load(src: string) {
    // validate
    const fileExtension: string = GetUtils.getFileExtension(src);

    if (Object.values(MeshFileType).includes(fileExtension)) {
      if (this.displayMode !== DisplayMode.MESH) {
        throw new Error(
          "When setting 'src' to a mesh file you must set 'displayMode' to 'mesh'"
        );
      }
    } else {
      if (this.displayMode === DisplayMode.MESH) {
        throw new Error(
          "When setting 'src' to a non-mesh file you must set 'displayMode' to either 'slices' or 'volume'"
        );
      }
    }

    this.appSetSrc(src);
  }

  @Method()
  async setDisplayMode(displayMode: DisplayMode) {
    this.appSetDisplayMode(displayMode);
  }

  @Method()
  async loadAnnotations(tools: any) {
    // remove all existing tools
    while (this.tools.length) {
      this.appRemoveTool(this.tools[this.tools.length - 1].id);
    }

    tools = JSON.parse(tools);

    this.appLoadTools(tools);
  }

  @Event() onLoad: EventEmitter;
  @Event() onSave: EventEmitter;
  //#endregion

  componentWillLoad() {
    CreateUtils.createAframeComponents();

    this.store.setStore(configureStore({}));

    this.store.mapStateToProps(this, state => {
      const {
        app: {
          src,
          srcLoaded,
          selectedTool,
          tools,
          displayMode,
          orientation,
          toolsVisible,
          toolsEnabled,
          optionsVisible,
          optionsEnabled,
          boundingBoxVisible,
          THREEJSSceneNeedsUpdate,
          slicesIndex,
          slicesWindowWidth,
          slicesWindowCenter,
          volumeSteps,
          volumeWindowWidth,
          volumeWindowCenter,
          angleToolEnabled,
          annotationToolEnabled,
          rulerToolEnabled
        }
      } = state;

      return {
        src,
        srcLoaded,
        selectedTool,
        tools,
        displayMode,
        orientation,
        toolsVisible,
        toolsEnabled,
        optionsVisible,
        optionsEnabled,
        boundingBoxVisible,
        THREEJSSceneNeedsUpdate,
        slicesIndex,
        slicesWindowWidth,
        slicesWindowCenter,
        volumeSteps,
        volumeWindowWidth,
        volumeWindowCenter,
        angleToolEnabled,
        annotationToolEnabled,
        rulerToolEnabled
      };
    });

    this.store.mapDispatchToProps(this, {
      appSetSrc,
      appSetSrcLoaded,
      appAddTool,
      appRemoveTool,
      appSelectTool,
      appUpdateTool,
      appLoadTools,
      appSetDisplayMode,
      appSetOrientation,
      appSetToolsVisible,
      appSetToolsEnabled,
      appSetOptionsVisible,
      appSetOptionsEnabled,
      appSetBoundingBoxVisible,
      appSetSlicesIndex,
      appSetSlicesWindowWidth,
      appSetSlicesWindowCenter,
      appSetVolumeSteps,
      appSetVolumeWindowWidth,
      appSetVolumeWindowCenter,
      appSetAngleToolEnabled,
      appSetAnnotationToolEnabled,
      appSetRulerToolEnabled
    });

    // set up event handlers
    this._srcLoadedHandler = this._srcLoaded.bind(this);
    this._addToolHandler = this._addToolHandler.bind(this);
    this._validTargetHandler = this._validTargetHandler.bind(this);
    this._meshDistanceHandler = this._meshDistanceHandler.bind(this);
    this._toolSelectedHandler = this._toolSelectedHandler.bind(this);
    this._intersectingToolHandler = this._intersectingToolHandler.bind(this);
    this._intersectionClearedHandler = this._intersectionClearedHandler.bind(
      this
    );
    this._toolMovedHandler = this._toolMovedHandler.bind(this);
  }

  //#region Rendering Methods

  private _renderSpinner() {
    if (!this.srcLoaded) {
      return (
        <a-box
          animation="property: rotation; to: 0 360 0; loop: true; dur: 1500; easing: easeInOutQuad"
          position="0 0 -1"
          rotation="0.5 0 0"
          scale=".03 .03 .03"
          color="#cecece"
        />
      );
    }

    return null;
  }

  private _renderSrc() {
    if (!this.src) {
      return null;
    }

    switch (this.displayMode) {
      case DisplayMode.MESH: {
        return (
          <a-entity
            al-tool-spawner={`
              toolsEnabled: ${this.toolsEnabled};
            `}
            class="collidable"
            id="targetEntity"
            ref={(el: Entity) => (this._targetEntity = el)}
            al-gltf-model={`
                src: url(${this.src});
                dracoDecoderPath: ${this.dracoDecoderPath};
              `}
            position="0 0 0"
            scale="1 1 1"
          />
        );
      }
      default: {
        return (
          <a-entity
            al-tool-spawner={`
            toolsEnabled: ${this.toolsEnabled};
          `}
            class="collidable targets"
            id="targetEntity"
            ref={(el: Entity) => (this._targetEntity = el)}
            al-volumetric-model={`
                src: url(${this.src});
              `}
            position="0 0 0"
            scale="1 1 1"
          />
        );
      }
    }
  }
  private _renderTools(): JSX.Element {
    const outTools: JSX.Element[] = [];
    const dataTools: Tool[] = this.tools;

    for (var i = 0; i < dataTools.length; i++) {
      if (i < dataTools.length) {
        const tool: Tool = dataTools[i];
        outTools.push(
          <a-entity
            class="collidable"
            id={tool.id}
            position={tool.position}
            al-tool={`
              targetId: ${tool.targetId};
              scale: ${tool.scale};
              selected: ${this.selectedTool === tool.id};
              toolsEnabled: ${this.toolsEnabled};
            `}
          />
        );
      }
    }
    return outTools;
  }

  private _renderLights(): JSX.Element {
    return [
      <a-entity
        light="type: directional; color: #ffffff; intensity: 0.75"
        position="1 1 1"
      />,
      <a-entity
        light="type: directional; color: #002958; intensity: 0.5"
        position="-1 -1 -1"
      />,
      <a-entity light="type: ambient; color: #d0d0d0; intensity: 1" />
    ];
  }

  private _renderCamera(): JSX.Element {
    if (this.srcLoaded) {
      let orbitData = GetUtils.getOrbitData(this._targetEntity);

      return (
        <a-camera
          fps-counter
          ref={el => (this._camera = el)}
          cursor="rayOrigin: mouse"
          raycaster="objects: .collidable"
          fov={Constants.cameraValues.fov}
          near={Constants.cameraValues.near}
          far={Constants.cameraValues.far}
          look-controls="enabled: false"
          position="0 0 0"
          rotation="0 0 0"
          orbit-controls={`
        maxPolarAngle: ${Constants.cameraValues.maxPolarAngle};
        minDistance: ${Constants.cameraValues.minDistance};
        screenSpacePanning: true;
        rotateSpeed: ${Constants.cameraValues.rotateSpeed};
        zoomSpeed: ${Constants.cameraValues.zoomSpeed};
        enableDamping: true;
        dampingFactor: ${Constants.cameraValues.dampingFactor};
        target: ${ThreeUtils.vector3ToString(orbitData.sceneCenter)};
        initialPosition: ${ThreeUtils.vector3ToString(
          orbitData.initialPosition
        )};
      `}
        />
      );
    } else {
      return (
        <a-camera
          ref={el => (this._camera = el)}
          fov={Constants.cameraValues.fov}
          near={Constants.cameraValues.near}
          far={Constants.cameraValues.far}
          look-controls="enabled: false"
        />
      );
    }
  }

  private _renderScene(): JSX.Element {
    return (
      <a-scene
        embedded
        renderer="colorManagement: true;"
        vr-mode-ui="enabled: false"
        ref={el => (this._scene = el)}
      >
        {this._renderSpinner()}
        {this._renderSrc()}
        {this._renderTools()}
        {this._renderLights()}
        {this._renderCamera()}
      </a-scene>
    );
  }

  private _renderControlPanel(): JSX.Element {
    // todo: tunnel state
    return (
      <al-control-panel
        angleToolEnabled={this.angleToolEnabled}
        annotationToolEnabled={this.annotationToolEnabled}
        boundingBoxVisible={this.boundingBoxVisible}
        displayMode={this.displayMode}
        optionsEnabled={this.optionsEnabled}
        optionsVisible={this.optionsVisible}
        orientation={this.orientation}
        rulerToolEnabled={this.rulerToolEnabled}
        selectedTool={this.selectedTool}
        slicesIndex={this.slicesIndex}
        slicesWindowCenter={this.slicesWindowCenter}
        slicesWindowWidth={this.slicesWindowWidth}
        stack={this._stack}
        stackHelper={this._stackHelper}
        tools={this.tools}
        toolsEnabled={this.toolsEnabled}
        toolsVisible={this.toolsVisible}
        volumeSteps={this.volumeSteps}
        volumeWindowCenter={this.volumeWindowCenter}
        volumeWindowWidth={this.volumeWindowWidth}
        addTool={this.appAddTool}
        removeTool={this.appRemoveTool}
        saveTools={this._saveTools.bind(this)}
        selectTool={this.appSelectTool}
        setBoundingBoxVisible={this.appSetBoundingBoxVisible}
        setDisplayMode={this.appSetDisplayMode}
        setOptionsEnabled={this.appSetOptionsEnabled}
        setOrientation={this.appSetOrientation}
        setSlicesIndex={this.appSetSlicesIndex}
        setSlicesWindowCenter={this.appSetSlicesWindowCenter}
        setSlicesWindowWidth={this.appSetSlicesWindowWidth}
        setToolsEnabled={this.appSetToolsEnabled}
        setVolumeSteps={this.appSetVolumeSteps}
        setVolumeWindowCenter={this.appSetVolumeWindowCenter}
        setVolumeWindowWidth={this.appSetVolumeWindowWidth}
      />
    );
  }

  render(): JSX.Element {
    return (
      <div
        id="al-wrapper"
        style={{
          width: this.width,
          height: this.height
        }}
      >
        {this._renderScene()}
        {this._renderControlPanel()}
      </div>
    );
  }
  //#endregion

  private _saveTools(): void {
    this.onSave.emit(JSON.stringify(this.tools));
  }

  private _srcLoaded(): void {
    const mesh: THREE.Mesh = this._targetEntity.object3DMap.mesh as THREE.Mesh;
    mesh.geometry.computeBoundingSphere();
    this._scale = mesh.geometry.boundingSphere.radius;
    this.appSetSrcLoaded(true);
    this.onLoad.emit();
  }

  private _addEventListeners(): void {
    if (this._scene) {
      this._scene.addEventListener("tool-moved", this._toolMovedHandler, false);
      this._scene.addEventListener("add-tool", this._addToolHandler, false);
      this._scene.addEventListener(
        "tool-selected",
        this._toolSelectedHandler,
        false
      );
      this._scene.addEventListener(
        "valid-target",
        this._validTargetHandler,
        false
      );
      this._scene.addEventListener(
        "mesh-distance",
        this._meshDistanceHandler,
        false
      );

      if (this._targetEntity) {
        this._targetEntity.addEventListener(
          "model-loaded",
          this._srcLoadedHandler,
          false
        );
      }

      if (this._camera) {
        this._camera.addEventListener(
          "tool-intersection",
          this._intersectingToolHandler,
          false
        );
        this._camera.addEventListener(
          "tool-intersection-cleared",
          this._intersectionClearedHandler,
          false
        );
      }
    }
  }

  componentDidLoad() {}

  componentDidUpdate() {
    this._addEventListeners();

    //TODO: Only needs to happen once, not every render
    let material = (this._camera.object3DMap.mesh as THREE.Mesh)
      .material as THREE.Material;
    if (material && !material.transparent) {
      material.transparent = true;
    }
  }

  //#region Event Handlers
  private _intersectionClearedHandler(_evt): void {
    this._intersectingTool = false;
  }

  private _intersectingToolHandler(_evt): void {
    this._intersectingTool = true;
  }

  private _addToolHandler(event: CustomEvent): void {
    if (this.toolsEnabled && this._validTarget && !this._intersectingTool) {
      let intersection: THREE.Intersection = event.detail.detail.intersection;

      const newTool: Tool = CreateUtils.createTool(
        this.tools,
        "#targetEntity",
        intersection.point,
        this._scale
      );

      this.appAddTool(newTool);
    }
  }

  private _meshDistanceHandler(event: CustomEvent): void {
    this._maxMeshDistance = event.detail.dist;
  }

  private _validTargetHandler(event: CustomEvent): void {
    this._validTarget = event.detail.payload;
  }

  private _toolSelectedHandler(event: CustomEvent): void {
    this.appSelectTool(event.detail.id);
  }

  private _toolMovedHandler(event: CustomEvent): void {
    const toolId = event.detail.id;
    const raycaster = this._camera.components.raycaster as any;
    const intersection = raycaster.getIntersection(
      this._targetEntity
    ) as THREE.Intersection;

    if (intersection) {
      this.appUpdateTool({
        id: toolId,
        position: ThreeUtils.vector3ToString(intersection.point)
      });
    } else {
      let toolPos: THREE.Vector3 = (this._scene
        .querySelector("#" + toolId)
        .getAttribute("position") as unknown) as THREE.Vector3;

      let cameraPos = new THREE.Vector3();
      this._camera.object3D.getWorldPosition(cameraPos);
      console.log(cameraPos);

      this.appUpdateTool({
        id: toolId,
        position: ThreeUtils.vector3ToString(toolPos)
      });
    }
  }
  //#endregion
}
