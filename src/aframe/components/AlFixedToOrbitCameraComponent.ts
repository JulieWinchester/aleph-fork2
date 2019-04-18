import { AframeRegistryEntry } from "../../interfaces";
import { ThreeUtils } from "../../utils";
import { Constants } from "../../Constants";
import { ComponentDefinition } from "aframe";
interface AlFixedToOrbitCameraState {
  distanceFromTarget: number;
  target: THREE.Vector3;
}

interface AlFixedToOrbitCameraDefinition extends ComponentDefinition {
  tickFunction(): void;
}

export class AlFixedToOrbitCameraComponent implements AframeRegistryEntry {
  public static get Object(): AlFixedToOrbitCameraDefinition {
    return {
      schema: {
        distanceFromTarget: { type: "number", default: 0.1 },
        target: { type: "vec3" }
      },

      init(_data?: any) {
        this.tickFunction = AFRAME.utils.throttle(
          this.tickFunction,
          Constants.minFrameMS / 2,
          this
        );

        if (this.data.target) {
          let targ = ThreeUtils.objectToVector3(this.data.target);

          this.state = {
            distanceFromTarget: this.data.distanceFromTarget,
            target: targ
          } as AlFixedToOrbitCameraState;
        } else {
          this.state = {
            distanceFromTarget: this.data.distanceFromTarget,
            target: new THREE.Vector3(0, 0, 0)
          } as AlFixedToOrbitCameraState;
        }
      },

      update(_oldData) {
        let targ = ThreeUtils.objectToVector3(this.data.target);

        this.state = {
          distanceFromTarget: this.data.distanceFromTarget,
          target: targ
        } as AlFixedToOrbitCameraState;
      },

      tickFunction() {
        let el = this.el;
        let state = this.state;

        const camPos = el.sceneEl.camera.position;
        const dir = (state.target
          .clone()
          .sub(camPos.clone()) as THREE.Vector3).normalize();

        el.object3D.position.copy(dir.multiplyScalar(state.distanceFromTarget));
        el.object3D.lookAt(camPos);
      },

      tick() {
        this.tickFunction();
      }
    } as AlFixedToOrbitCameraDefinition;
  }
  public static get Tag(): string {
    return "al-fixed-to-orbit-camera";
  }
}
