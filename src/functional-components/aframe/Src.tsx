import { FunctionalComponent, h } from "@stencil/core";
import { ControlsType, DisplayMode, Orientation } from "../../enums";

interface SrcProps extends FunctionalComponentProps {
  controlsType: ControlsType;
  displayMode: DisplayMode;
  dracoDecoderPath: string;
  graphEnabled: boolean;
  isWebGl2: boolean;
  orientation: Orientation;
  slicesIndex: number;
  slicesWindowCenter: number;
  slicesWindowWidth: number;
  src: string;
  srcLoaded: boolean;
  volumeWindowCenter: number;
  volumeWindowWidth: number;
}

export const Src: FunctionalComponent<SrcProps> = (
  {
    cb,
    controlsType,
    displayMode,
    dracoDecoderPath,
    graphEnabled,
    isWebGl2,
    orientation,
    slicesIndex,
    slicesWindowCenter,
    slicesWindowWidth,
    src,
    srcLoaded,
    volumeWindowCenter,
    volumeWindowWidth
  },
  _children
) =>
  (() => {
    if (!src) {
      return null;
    } else {
      switch (displayMode) {
        case DisplayMode.MESH: {
          return (
            <a-entity
              class="collidable"
              al-node-spawner={`
                graphEnabled: ${graphEnabled};
              `}
              al-gltf-model={`
                src: url(${src});
                dracoDecoderPath: ${dracoDecoderPath};
              `}
              position="0 0 0"
              scale="1 1 1"
              ref={ref => cb(ref)}
            />
          );
        }
        case DisplayMode.SLICES: {
          return (
            <a-entity
              id="target-entity"
              class="collidable"
              al-node-spawner={`
                graphEnabled: ${graphEnabled};
              `}
              al-volume={`
                controlsType: ${controlsType};
                displayMode: ${displayMode};
                isHighRes: false;
                isWebGl2: ${isWebGl2};
                slicesIndex: ${slicesIndex};
                slicesOrientation: ${orientation};
                slicesWindowCenter: ${slicesWindowCenter};
                slicesWindowWidth: ${slicesWindowWidth};
                src: ${src};
                srcLoaded: ${srcLoaded};
                volumeWindowCenter: ${volumeWindowCenter};
                volumeWindowWidth: ${volumeWindowWidth};
              `}
              position="0 0 0"
              ref={ref => cb(ref)}
            />
          );
        }
        // This is seperate from the slice entity as it will store the volume render,
        // preventing long load times when switching mode
        // Node spawner is on the bounding box in
        // volume mode; as the "volume" is in a different scene
        case DisplayMode.VOLUME: {
          return (
            <a-entity
              id="target-entity"
              al-volume={`
                controlsType: ${controlsType};
                displayMode: ${displayMode};
                isHighRes: false;
                isWebGl2: ${isWebGl2};
                slicesIndex: ${slicesIndex};
                slicesOrientation: ${orientation};
                slicesWindowCenter: ${slicesWindowCenter};
                slicesWindowWidth: ${slicesWindowWidth};
                src: ${src};
                srcLoaded: ${srcLoaded};
                volumeWindowCenter: ${volumeWindowCenter};
                volumeWindowWidth: ${volumeWindowWidth};
              `}
              position="0 0 0"
              ref={ref => cb(ref)}
            />
          );
        }
        default: {
          return;
        }
      }
    }
  })();
