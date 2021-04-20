import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@fluentui/react";
import { Stack } from "@fluentui/react";
//import AppContext from "../../components/App/AppContext";
import { globalStackStylesHeight100, globalStackTokensGapSmall } from "../../globalStyles";

interface IDashboardProps {
}

interface IDashboardState {}

const DashboardContent: React.FunctionComponent<IDashboardProps> = (props: IDashboardProps) => {
  const { t } = useTranslation();

  return (
    <Stack styles={globalStackStylesHeight100} tokens={globalStackTokensGapSmall}>
      <Text variant="xLarge">{t("Dashboard.Title")}</Text>
    </Stack>
  );
}

export default class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
  render() {
    return <DashboardContent {...this.props} />;
  }
}
