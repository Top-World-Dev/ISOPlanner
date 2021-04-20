import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Nav, INavLink, INavStyles, INavLinkGroup, IRenderGroupHeaderProps } from "@fluentui/react";
import { useHistory } from "react-router-dom";
import { Text, Separator, ITextStyles, ISeparatorStyles } from "@fluentui/react";
import { globalFontBoldWeight } from "../../globalStyles";
import AppContext from "../../components/App/AppContext";

export interface INavMainProps {}

const NavMain: React.FunctionComponent<INavMainProps> = (props: INavMainProps) => {
  const { t } = useTranslation();
  const history = useHistory();
  const appContext = useContext(AppContext);

  const navStyles: Partial<INavStyles> = {
    root: {
      boxSizing: "border-box",
      overflowY: "auto",
    },
  };

  const navLinkGroups: INavLinkGroup[] = [
    {
      links: [
        {
          name: t("NavMain.Start"),
          url: "",
          link: "/",
          key: "start",
          icon: "GoToDashboard",
        },
        {
          name: t("NavMain.Controls"),
          disabled: !appContext.isAuthenticated,
          url: "/controls",
          link: "/controls",
          key: "controls",
          icon: "ButtonControl",
        },
        {
          name: t("NavMain.Risks"),
          disabled: !appContext.isAuthenticated,
          url: "",
          link: "/risks",
          key: "risks",
          icon: "StatusCircleExclamation",
        },
        {
          name: t("NavMain.Tasks"),
          disabled: !appContext.isAuthenticated,
          url: "",
          link: "/tasks",
          key: "tasks",
          icon: "TaskManager",
        },
        {
          name: t("NavMain.Documents"),
          disabled: !appContext.isAuthenticated,
          url: "",
          link: "/documents",
          key: "documents",
          icon: "DocumentSet",
        },
      ],
    },
    {
      name: t("NavMain.Actions.Main"),
      links: [
        {
          name: t("NavMain.Actions.NewRisk"),
          disabled: !appContext.isAuthenticated,
          url: "",
          link: "/newrisk",
          key: "action-new-risk",
          icon: "Add",
        },
        {
          name: t("NavMain.Actions.NewTask"),
          disabled: !appContext.isAuthenticated,
          url: "",
          link: "/newtask",
          key: "action-new-task",
          icon: "Add",
        },
      ],
    },
    {
      name: t("NavMain.Recent"),
      links: [
        {
          name: "Hardware failure",
          url: "",
          link: "/risks/1",
          key: "recent-items-1",
          icon: "StatusCircleExclamation",
        },
        {
          name: "Risk management",
          url: "",
          link: "/documents/2",
          key: "recent-items-2",
          icon: "WordDocument",
        },
      ],
    },
  ];

  const headerTextStyles: ITextStyles = {
    root: {
      paddingLeft: 10,
      fontWeight: globalFontBoldWeight,
    },
  };

  const headerSeparatorStyles: ISeparatorStyles = {
    root: {
      height: 1,
    },
    content: {},
  };

  return (
    <Nav
      styles={navStyles}
      groups={navLinkGroups}
      onLinkClick={(ev, item?: INavLink) => {
        item && history.push(item.link);
      }}
      onRenderGroupHeader={_onRenderGroupHeader}
    />
  );

  function _onRenderGroupHeader(group: IRenderGroupHeaderProps | undefined): JSX.Element {
    return (
      <Fragment>
        <Text styles={headerTextStyles} variant="medium">
          {group?.name}
        </Text>
        <Separator styles={headerSeparatorStyles}></Separator>
      </Fragment>
    );
  }
};

export default NavMain;
