import React from "react";
//import { useTranslation } from "react-i18next";
//import AppContext from "../../../components/App/AppContext";
import { IAdminUsersState } from "./AdminUsers";
import { Text } from "@fluentui/react";

interface IAdminUsersTabProps extends IAdminUsersState {}

const TabAudit: React.FunctionComponent<IAdminUsersTabProps> = (props: IAdminUsersTabProps) => {
  //const { t } = useTranslation();
  //const appContext = useContext(AppContext);

  return <Text>Audit</Text>;
};

export default TabAudit;
