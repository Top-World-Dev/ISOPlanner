import * as React from 'react';
import { Route, RouteProps } from "react-router-dom";
import CurrentUser from "../../models/currentuser";
import { appRoles } from '../../services/Auth/appRoles';
import { useHistory } from "react-router-dom";

interface ProtectedRouteProps extends RouteProps {
    user: CurrentUser;
    role: appRoles;
}

const ProtectedRoute: React.FunctionComponent<ProtectedRouteProps> = (props: ProtectedRouteProps) => {

    const history = useHistory();

    if (!props.user.login.userLicensed || !props.user.login.hasRole(props.role)) {
        history.replace("/not-authorized");
    }

    return (
        <Route {...props}/>
    )
}

export default ProtectedRoute;