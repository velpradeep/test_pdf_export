import React from "react";
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import "survey-core/survey.i18n.js";
import "survey-creator-core/survey-creator-core.i18n.js";
import { ElementFactory, Question, Serializer, SvgRegistry } from "survey-core";
import { localization } from "survey-creator-core";
import { PropertyGridEditorCollection } from "survey-creator-core";
import { SliderPicker, SketchPicker, CompactPicker } from "react-color";
import { SurveyQuestionElementBase, ReactQuestionFactory } from "survey-react-ui";
import { surveyJSON } from "./survey_json";
import "survey-core/defaultV2.css";
import "survey-creator-core/survey-creator-core.css";
import "./index.css";

const CUSTOM_TYPE = "color-picker";

export class QuestionColorPickerModel extends Question {
  getType() {
    return CUSTOM_TYPE;
  }

  get colorPickerType() {
    return this.getPropertyValue("colorPickerType");
  }
  set colorPickerType(val) {
    this.setPropertyValue("colorPickerType", val);
  }

  get disableAlpha() {
    return this.getPropertyValue("disableAlpha");
  }
  set disableAlpha(val) {
    this.setPropertyValue("disableAlpha", val);
  }
}

// Add question type metadata for further serialization into JSON
Serializer.addClass(
  CUSTOM_TYPE,
  [{
    name: "colorPickerType",
    default: "Slider",
    choices: ["Slider", "Sketch", "Compact"],
    category: "general",
    visibleIndex: 2 // After the Name and Title
  }, {
    name: "disableAlpha:boolean",
    dependsOn: "colorPickerType",
    visibleIf: function (obj) {
      return obj.colorPickerType === "Sketch";
    },
    category: "general",
    visibleIndex: 3 // After the Name, Title, and Color Picker type
  }],
  function () {
    return new QuestionColorPickerModel("");
  },
  "question"
);

ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
  return new QuestionColorPickerModel(name);
});

// A class that renders questions of the new type in the UI
export class SurveyQuestionColorPicker extends SurveyQuestionElementBase {
  constructor(props) {
    super(props);
    this.state = { value: this.question.value };
  }
  get question() {
    return this.questionBase;
  }
  get value() {
    return this.question.value;
  }
  get disableAlpha() {
    return this.question.disableAlpha;
  }
  get type() {
    return this.question.colorPickerType;
  }
  handleColorChange = (data) => {
    this.question.value = data.hex;
  };
  // Support the read-only and design modes
  get style() {
    return this.question.getPropertyValue("readOnly") ||
      this.question.isDesignMode ? { pointerEvents: "none" } : undefined;
  }

  renderColor(type) {
    switch (type) {
      case "Slider": {
        return (<SliderPicker color={this.value} onChange={this.handleColorChange} />);
      }
      case "Sketch": {
        return (<SketchPicker color={this.value} disableAlpha={this.disableAlpha} onChange={this.handleColorChange} />);
      }
      case "Compact": {
        return (<CompactPicker color={this.value} onChange={this.handleColorChange} />);
      }
      default:
        return <div>Unknown type</div>;
    }
  }

  renderElement() {
    return <div style={this.style}>{this.renderColor(this.type)}</div>;
  }
}

// Register `SurveyQuestionColorPicker` as a class that renders `color-picker` questions 
ReactQuestionFactory.Instance.registerQuestion(CUSTOM_TYPE, (props) => {
  return React.createElement(SurveyQuestionColorPicker, props);
});

// Specify display names for the question type and its properties 
const locale = localization.getLocale("");
locale.qt[CUSTOM_TYPE] = "Color Picker";
locale.pe.colorPickerType = "Color picker type";
locale.pe.disableAlpha = "Disable alpha channel";

// Register an SVG icon for the question type
SvgRegistry.registerIconFromSvg(
  CUSTOM_TYPE,
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 21.4201C23.9387 22.1566 23.5894 22.8394 23.0278 23.3202C22.4662 23.8011 21.7376 24.0413 21 23.9888C20.2624 24.0413 19.5338 23.8011 18.9722 23.3202C18.4106 22.8394 18.0613 22.1566 18 21.4201C18 18.8513 21 16.2826 21 14.9932C21 16.2826 24 18.8513 24 21.4201ZM22 12.9942L11 1.99951L8.71 4.2884L10.12 5.70771L11 4.82814L18.17 11.9946L5.64 15.8028L2.83 12.9942L7.71 8.11653L9.29 9.70576C9.38296 9.79944 9.49356 9.8738 9.61542 9.92455C9.73728 9.97529 9.86799 10.0014 10 10.0014C10.132 10.0014 10.2627 9.97529 10.3846 9.92455C10.5064 9.8738 10.617 9.79944 10.71 9.70576C10.8037 9.61284 10.8781 9.5023 10.9289 9.3805C10.9797 9.2587 11.0058 9.12805 11.0058 8.99611C11.0058 8.86416 10.9797 8.73352 10.9289 8.61172C10.8781 8.48992 10.8037 8.37937 10.71 8.28645L3.71 1.28986C3.5217 1.10165 3.2663 0.995911 3 0.995911C2.7337 0.995911 2.4783 1.10165 2.29 1.28986C2.1017 1.47807 1.99591 1.73334 1.99591 1.99951C1.99591 2.26569 2.1017 2.52096 2.29 2.70917L6.29 6.70722L0 12.9942L10 22.9893L18 14.9932L22 12.9942Z" /></svg>'
);

// Register the `color-picker` as an editor for properties of the `color` type in the Survey Creator's Property Grid
PropertyGridEditorCollection.register({
  fit: function (prop) {
    return prop.type === "color";
  },
  getJSON: function () {
    return {
      type: CUSTOM_TYPE,
      colorPickerType: "Compact"
    };
  }
});

function applyBackground(color) {
  setTimeout(() => {
    const surveyEl = document.getElementsByClassName("sd-root-modern")[0];
    if (!!surveyEl) {
      surveyEl.style.setProperty("--background", color);
    }
  }, 50);
};

function handleActiveTabChange(sender, options) {
  if (options.tabName === "test" || options.tabName === "designer") {
    applyBackground(sender.survey.backgroundColor);
  }
};

function SurveyCreatorRenderComponent() {
    const options = {
        showLogicTab: true
    };
    const creator = new SurveyCreator(options);
    
    Serializer.addProperty("survey", {
      name: "backgroundColor",
      displayName: "Background color",
      type: "color",
      category: "general",
      visibleIndex: 3,
      onSetValue: (survey, value) => {
        survey.setPropertyValue("backgroundColor", value);
        applyBackground(value);
      }
    });
    
    creator.onActiveTabChanged.add(handleActiveTabChange);
    creator.JSON = surveyJSON;
    
    return (<SurveyCreatorComponent creator={creator} />);
}

export default SurveyCreatorRenderComponent;