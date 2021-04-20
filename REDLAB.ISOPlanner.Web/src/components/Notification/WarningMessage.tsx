import * as React from 'react';
import {MessageBar, MessageBarType} from '@fluentui/react';

interface IWarningMessageProps {
  message: string;
  onDismiss: any;
}

export default class WarningMessage extends React.Component<IWarningMessageProps> {
  render() {
    
    return (
      <MessageBar
          messageBarType={MessageBarType.warning}
          onDismiss={this.props.onDismiss}
          isMultiline={true}
          truncated={false}
        >
        {this.props.message}
      </MessageBar>
    );
  }
}

