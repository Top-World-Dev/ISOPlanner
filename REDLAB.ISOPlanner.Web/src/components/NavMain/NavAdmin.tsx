import React, { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Nav, INavLink, INavStyles, INavLinkGroup, IRenderGroupHeaderProps } from "@fluentui/react";
import { Text, Separator, ITextStyles, ISeparatorStyles } from "@fluentui/react";
import { useHistory } from "react-router-dom";
import AppContext from "../../components/App/AppContext";
import { appRoles } from "../../services/Auth/appRoles";
import { globalFontBoldWeight } from "../../globalStyles";

interface INavadminProps {}

const NavAdmin: React.FunctionComponent<INavadminProps> = (props: INavadminProps) => {
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
      name: t("NavAdmin.Title"),
      links: [
        {
          name: t("NavAdmin.Users"),
          url: "",
          link: "/admin/users",
          key: "admin-users",
          icon: "FabricUserFolder",
        },
        {
          name: t("NavAdmin.Groups"),
          url: "",
          link: "/admin/groups",
          key: "admin-groups",
          icon: "AddGroup",
        },
        {
          name: t("NavAdmin.Norms"),
          url: "",
          link: "/admin/norms",
          key: "admin-norms",
          icon: "ProductList",
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

  if (appContext.user.login && appContext.user.login.hasRole(appRoles.Admin)) {
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
  } else {
    return null;
  }

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

export default NavAdmin;
