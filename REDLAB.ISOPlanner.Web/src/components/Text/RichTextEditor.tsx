import React from "react";
import {
    HtmlEditor,
    Image,
    Inject,
    Link,
    QuickToolbar,
    RichTextEditorComponent,
    Toolbar,
  } from "@syncfusion/ej2-react-richtexteditor";

// import "../../../node_modules/@syncfusion/ej2-icons/styles/fabric.css";
// import "../../../node_modules/@syncfusion/ej2-base/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-buttons/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-splitbuttons/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-inputs/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-lists/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-navigations/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-popups/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-richtexteditor/styles/fabric-dark.css";

export interface IRichTextEditorProps {
  html: JSX.Element;
}

const RichTextEditor: React.FunctionComponent<IRichTextEditorProps> = (props: IRichTextEditorProps) => {

  return (
    <RichTextEditorComponent>
      {props.html}
      <Inject services={[Toolbar, Image, Link, HtmlEditor, QuickToolbar]} />
    </RichTextEditorComponent>
  );

};

export default RichTextEditor;
