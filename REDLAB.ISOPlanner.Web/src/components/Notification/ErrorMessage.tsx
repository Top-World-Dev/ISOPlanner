import React, { useContext } from "react";
import { MessageBar, MessageBarType, MessageBarButton } from "@fluentui/react";
import logger from "../../services/Logging/logService";
import Config from "../../services/Config/configService";
import AppError from "../../utils/appError";
import AppContext from "../../components/App/AppContext";
import { useTranslation } from "react-i18next";
import { truncate } from "../../utils/string";

interface IErrorMessageProps {
  error: AppError | undefined;
  setError: Function;
}

export const ErrorMessage: React.FunctionComponent<IErrorMessageProps> = (props: IErrorMessageProps) => {
  const appContext = useContext(AppContext);
  const { t } = useTranslation();

  if (props.error === undefined) {
    return null;
  }

  logger.error(props.error);

  var msg = "";
  var action: JSX.Element | undefined;

  switch (props.error.code) {
    case "409":
      msg = t("Errors.DatabaseConflict.Message");
      action = (
        <div>
          <MessageBarButton
            onClick={() => {
              props.setError(undefined);
              appContext.reloadPage();
            }}
          >
            {t("Errors.DatabaseConflict.Action")}
          </MessageBarButton>
        </div>
      );
      break;
    default:
      msg = props.error.message;
  }

  return (
    <MessageBar
      messageBarType={MessageBarType.severeWarning}
      onDismiss={() => {
        props.setError(undefined);
      }}
      isMultiline={true}
      actions={action}
    >
      <b>{msg}</b>
      {Config.isDev() && <p>{truncate(props.error.debug, 400)}</p>}
    </MessageBar>
  );
};
