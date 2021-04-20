import React from "react";
import { KanbanComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-kanban";

// import "../../../node_modules/@syncfusion/ej2-base/styles/fabric.css";
// import '../../../node_modules/@syncfusion/ej2-buttons/styles/fabric.css';
// import "../../../node_modules/@syncfusion/ej2-layouts/styles/fabric.css";
// import '../../../node_modules/@syncfusion/ej2-dropdowns/styles/fabric.css';
// import '../../../node_modules/@syncfusion/ej2-inputs/styles/fabric.css';
// import "../../../node_modules/@syncfusion/ej2-navigations/styles/fabric.css";
// import "../../../node_modules/@syncfusion/ej2-popups/styles/fabric.css";
// import "../../../node_modules/@syncfusion/ej2-react-kanban/styles/fabric.css";

// import "../../../node_modules/@syncfusion/ej2-base/styles/fabric-dark.css";
// import '../../../node_modules/@syncfusion/ej2-buttons/styles/fabric-dark.css';
// import "../../../node_modules/@syncfusion/ej2-layouts/styles/fabric-dark.css";
// import '../../../node_modules/@syncfusion/ej2-dropdowns/styles/fabric-dark.css';
// import '../../../node_modules/@syncfusion/ej2-inputs/styles/fabric-dark.css';
// import "../../../node_modules/@syncfusion/ej2-navigations/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-popups/styles/fabric-dark.css";
// import "../../../node_modules/@syncfusion/ej2-react-kanban/styles/fabric-dark.css";

interface IKanbanBoardProps {
  data: Object[];
}

const KanbanBoard: React.FunctionComponent<IKanbanBoardProps> = (props: IKanbanBoardProps) => {
  return (
    <KanbanComponent
      id="kanban"
      keyField="Status"
      dataSource={props.data}
      cardSettings={{ contentField: "Summary", headerField: "Id" }}
    >
      <ColumnsDirective>
        <ColumnDirective headerText="To Do" keyField="Open" />
        <ColumnDirective headerText="In Progress" keyField="InProgress" />
        <ColumnDirective headerText="Done" keyField="Done" />
      </ColumnsDirective>
    </KanbanComponent>
  );
};

export default KanbanBoard;
