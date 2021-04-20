import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { PrimaryButton } from "@fluentui/react";
import { useTranslation } from "react-i18next";

export interface IDialogOkProps {
  onOk: any;
  hidden: boolean;
  title: string;
  subText: string;
}

export const DialogOk: React.FunctionComponent<IDialogOkProps> = (props: IDialogOkProps) => {
  const { t } = useTranslation();

  const dialogContentProps = {
    type: DialogType.normal,
    title: props.title,
    subText: props.subText,
  };

  return (
    <Dialog hidden={props.hidden} onDismiss={props.onOk} dialogContentProps={dialogContentProps}>
      <DialogFooter>
        <PrimaryButton onClick={props.onOk} text={t("Dialogs.Ok.Ok")} />
      </DialogFooter>
    </Dialog>
  );
};
