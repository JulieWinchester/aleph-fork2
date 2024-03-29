import { ControlsType } from "../enums/ControlsType";
import { DisplayMode } from "../enums/DisplayMode";
import { Material } from "../enums/Material";
import { Orientation } from "../enums/Orientation";
import { Units } from "../enums/Units";
import { AlAngle, AlAppState, AlEdge, AlNode } from "../interfaces";
import { ActionTypes } from "./actions";
export declare const getInitialState: () => AlAppState;
export declare const app: (state: AlAppState, action: ActionTypes) => {
    displayMode: DisplayMode;
    src: string;
    angles: Map<string, AlAngle>;
    boundingBoxEnabled: boolean;
    camera: import("../interfaces").AlCamera;
    controlsEnabled: boolean;
    controlsType: ControlsType;
    edges: Map<string, AlEdge>;
    graphEnabled: boolean;
    material: Material;
    nodes: Map<string, AlNode>;
    orientation: Orientation;
    selected: string;
    slicesIndex: number;
    srcLoaded: boolean;
    units: Units;
    volumeSteps: number;
    volumeStepsHighEnabled: boolean;
    volumeWindowCenter: number;
    volumeWindowWidth: number;
} | {
    slicesMaxIndex: number;
    angles: Map<string, AlAngle>;
    boundingBoxEnabled: boolean;
    camera: import("../interfaces").AlCamera;
    controlsEnabled: boolean;
    controlsType: ControlsType;
    displayMode: DisplayMode;
    edges: Map<string, AlEdge>;
    graphEnabled: boolean;
    material: Material;
    nodes: Map<string, AlNode>;
    orientation: Orientation;
    selected: string;
    slicesIndex: number;
    src: string;
    srcLoaded: boolean;
    units: Units;
    volumeSteps: number;
    volumeStepsHighEnabled: boolean;
    volumeWindowCenter: number;
    volumeWindowWidth: number;
};
export declare const rootReducer: any;
