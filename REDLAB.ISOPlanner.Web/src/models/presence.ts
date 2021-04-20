import { PersonaPresence } from '@fluentui/react';

export default class Presence {

    availability: string;
    isOutOfOffice: boolean;

    constructor (availability: string, isOutOfOffice: boolean = false) {
        this.availability = availability;
        this.isOutOfOffice = isOutOfOffice;
    }

    getPersonaPresenceFromAvailability(availability: string = this.availability) : PersonaPresence {

        switch (availability) {
          case 'Busy':
          case 'BusyIdle':
            return PersonaPresence.busy;
      
          case 'Available':
          case 'AvailableIdle':
            return PersonaPresence.online;
      
          case 'Away':
          case 'BeRightBack':
            return PersonaPresence.away;
      
          case 'Offline':
            return PersonaPresence.offline;
      
          case 'DoNotDisturb':
            return PersonaPresence.dnd;
      
          default:
            return PersonaPresence.none;
        }
      }
}