import React, { useContext } from 'react';
import { Persona, PersonaSize, PersonaPresence } from '@fluentui/react';
import { getRolesDisplayString } from '../../models/login';
import AppContext from "../../components/App/AppContext";

interface IPersonaProps {
}
  
export const PersonaSmall: React.FunctionComponent<IPersonaProps> = (props: IPersonaProps) => {
  
  const appContext = useContext(AppContext);

  // If a user avatar is available, return the persona with presence
  if (appContext.isAuthenticated) {
    return <Persona imageUrl={appContext.user.getAvatarURL()}
              text={appContext.user.name}
              secondaryText=''
              tertiaryText=''
              optionalText=''
              size={PersonaSize.size32}
              presence={appContext.user.presence.getPersonaPresenceFromAvailability()}
              hidePersonaDetails={true}
            />
  }

  // No avatar available, return a default icon
  return <Persona text=''
    secondaryText=''
    tertiaryText=''
    optionalText=''
    size={PersonaSize.size32}
    hidePersonaDetails={true}
    presence = {PersonaPresence.none}
  />
}
  
export const PersonaDetails: React.FunctionComponent<IPersonaProps> = (props: IPersonaProps) => {
  
  const appContext = useContext(AppContext);

  // If a user avatar is available, return the persona with presence
  if (appContext.isAuthenticated) {
    return <Persona imageUrl={appContext.user.getAvatarURL()}
              text={appContext.user.name}
              secondaryText={appContext.user.email}
              tertiaryText={getRolesDisplayString(appContext.user.login.roles)}
              optionalText=''
              size={PersonaSize.size72}
              presence={appContext.user.presence.getPersonaPresenceFromAvailability()}
              hidePersonaDetails={false}
            />
  }

  // No avatar available, return a default icon
  return <Persona text=''
    secondaryText=''
    tertiaryText=''
    optionalText=''
    size={PersonaSize.size100}
    hidePersonaDetails={false}
  />
}
