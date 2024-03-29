import ConsoleIcon from "../../assets/svg/console-2.svg";
import GraphIcon from "../../assets/svg/graph.svg";
import SettingsIcon from "../../assets/svg/options.svg";
import SourceIcon from "../../assets/svg/source.svg";
import { Component, Element, h, Prop } from "@stencil/core";
import {
  ControlsType,
  DisplayMode,
  Orientation,
  Units
} from "../../enums/index.js";
import { Scroll } from "../../functional-components/Scroll";
import { AlAngle, AlEdge, AlNode } from "../../interfaces/index.js";
import i18n from "./al-control-panel.i18n.en.json";
import { ContentStrings } from "./ContentStrings";

@Component({
  tag: "al-control-panel",
  styleUrl: "al-control-panel.css",
  shadow: true
})
export class AlSettings {
  private _contentStrings: ContentStrings = i18n;

  @Element() public el!: HTMLElement;

  @Prop({ mutable: true }) public angles: Map<string, AlAngle> | null = null;
  @Prop({ mutable: true }) public boundingBoxEnabled: boolean;
  @Prop({ mutable: true }) public consoleTabEnabled: boolean = true;
  @Prop({ mutable: true }) public controlsType: ControlsType;
  @Prop({ mutable: true }) public displayMode: DisplayMode;
  @Prop({ mutable: true }) public edges: Map<string, AlEdge> | null = null;
  @Prop({ mutable: true }) public graphEnabled: boolean;
  @Prop({ mutable: true }) public graphTabEnabled: boolean = true;
  @Prop({ mutable: true }) public nodes: Map<string, AlNode> | null = null;
  @Prop({ mutable: true }) public orientation: Orientation;
  @Prop({ mutable: true }) public selected: string | null = null;
  @Prop({ mutable: true }) public settingsTabEnabled: boolean = true;
  @Prop({ mutable: true }) public slicesBrightness: number;
  @Prop({ mutable: true }) public slicesContrast: number;
  @Prop({ mutable: true }) public slicesIndex: number;
  @Prop({ mutable: true }) public slicesMaxIndex: number;
  @Prop({ mutable: true }) public srcTabEnabled: boolean = true;
  @Prop({ mutable: true }) public tabContentHeight: string | null = null;
  @Prop({ mutable: true }) public units: Units;
  @Prop({ mutable: true }) public url: string | null = null;
  @Prop({ mutable: true }) public urls: Map<string, string> | null = null;
  @Prop({ mutable: true }) public volumeBrightness: number;
  @Prop({ mutable: true }) public volumeContrast: number;
  @Prop({ mutable: true }) public volumeSteps: number;
  @Prop({ mutable: true }) public volumeStepsHighEnabled: boolean;

  private _getGraphJson(): string {
    if (this.nodes && this.edges && this.angles) {
      const graph = {
        nodes: Array.from(this.nodes),
        edges: Array.from(this.edges),
        angles: Array.from(this.angles)
      };

      return JSON.stringify(graph);
    }

    return "";
  }

  public render() {
    const tabContentHeight: string =
      this.tabContentHeight || this.el.parentElement.clientHeight + "px";

    const numTabsEnabled: number = [
      this.consoleTabEnabled,
      this.graphTabEnabled,
      this.settingsTabEnabled,
      this.srcTabEnabled
    ].filter(Boolean).length;

    return (
      <ion-app>
        <al-tabs>
          {numTabsEnabled > 1 ? (
            <ion-tab-bar>
              {this.srcTabEnabled ? (
                <ion-tab-button tab="src">
                  <ion-icon src={SourceIcon} />
                  <ion-label>{this._contentStrings.src}</ion-label>
                </ion-tab-button>
              ) : null}
              {this.settingsTabEnabled ? (
                <ion-tab-button tab="settings">
                  <ion-icon src={SettingsIcon} />
                  <ion-label>{this._contentStrings.settings}</ion-label>
                </ion-tab-button>
              ) : null}
              {this.graphTabEnabled ? (
                <ion-tab-button tab="graph">
                  <ion-icon src={GraphIcon} />
                  <ion-label>{this._contentStrings.graph}</ion-label>
                </ion-tab-button>
              ) : null}
              {this.consoleTabEnabled ? (
                <ion-tab-button tab="console">
                  <ion-icon src={ConsoleIcon} />
                  <ion-label>{this._contentStrings.console}</ion-label>
                </ion-tab-button>
              ) : null}
            </ion-tab-bar>
          ) : null}
          {this.srcTabEnabled ? (
            <ion-tab tab="src">
              <al-url-picker urls={this.urls} url={this.url}></al-url-picker>
            </ion-tab>
          ) : null}
          {this.settingsTabEnabled ? (
            <ion-tab tab="settings">
              <Scroll height={tabContentHeight}>
                <al-settings
                  bounding-box-enabled={this.boundingBoxEnabled}
                  controls-type={this.controlsType}
                  display-mode={this.displayMode}
                  graph-enabled={this.graphEnabled}
                  graph-visible={this.graphTabEnabled}
                  orientation={this.orientation}
                  slices-index={this.slicesIndex}
                  slices-max-index={this.slicesMaxIndex}
                  slices-brightness={this.slicesBrightness}
                  slices-contrast={this.slicesContrast}
                  volume-brightness={this.volumeBrightness}
                  volume-contrast={this.volumeContrast}
                  volume-steps={this.volumeSteps}
                  volume-steps-high-enabled={this.volumeStepsHighEnabled}
                  units={this.units}
                ></al-settings>
              </Scroll>
            </ion-tab>
          ) : null}
          {this.graphTabEnabled ? (
            <ion-tab tab="graph">
              <Scroll height={tabContentHeight}>
                <al-graph-editor
                  selected={this.selected}
                  nodes={this.nodes}
                  angles={this.angles}
                  edges={this.edges}
                ></al-graph-editor>
              </Scroll>
            </ion-tab>
          ) : null}
          {this.consoleTabEnabled ? (
            <ion-tab tab="console">
              <Scroll height={tabContentHeight}>
                <al-console graph={this._getGraphJson()}></al-console>
              </Scroll>
            </ion-tab>
          ) : null}
        </al-tabs>
      </ion-app>
    );
  }
}
