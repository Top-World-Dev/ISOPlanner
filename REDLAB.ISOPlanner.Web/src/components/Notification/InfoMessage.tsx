import * as React from 'react';
import {MessageBar, MessageBarType} from '@fluentui/react';

interface IInfoMessageProps {
  message: string;
  onDismiss: any;
}

export default class InfoMessage extends React.Component<IInfoMessageProps> {
  render() {
    
    return (
      <MessageBar
          messageBarType={MessageBarType.info}
          onDismiss={this.props.onDismiss}
          isMultiline={true}
          truncated={false}
        >
        {this.props.message}
      </MessageBar>
    );
  }
}

