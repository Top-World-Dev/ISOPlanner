import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { PrimaryButton, DefaultButton } from "@fluentui/react";
import { useTranslation } from "react-i18next";

export interface IDialogYesNoProps {
  onYes: any;
  onNo: any;
  hidden: boolean;
  title: string;
  subText: string;
}

export const DialogYesNo: React.FunctionComponent<IDialogYesNoProps> = (props: IDialogYesNoProps) => {
  const { t } = useTranslation();

  const dialogContentProps = {
    type: DialogType.normal,
    title: props.title,
    subText: props.subText,
  };

  return (
    <Dialog hidden={props.hidden} onDismiss={props.onNo} dialogContentProps={dialogContentProps}>
      <DialogFooter>
        <PrimaryButton onClick={props.onYes} text={t("Dialogs.YesNo.Yes")} />
        <DefaultButton onClick={props.onNo} text={t("Dialogs.YesNo.No")} />
      </DialogFooter>
    </Dialog>
  );
};
