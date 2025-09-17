declare module 'ical.js' {
  export interface Component {
    getAllSubcomponents(name: string): Component[];
  }

  export interface Event {
    uid: string;
    summary: string;
    description: string;
    location: string;
    startDate: {
      toJSDate(): Date;
      isDate: boolean;
    };
    endDate: {
      toJSDate(): Date;
    };
    isRecurring(): boolean;
    iterator(): Iterator;
    getOccurrenceDetails(occurrence: any): {
      endDate: {
        toJSDate(): Date;
      };
    };
  }

  export interface Iterator {
    next(): any;
  }

  export function parse(icsData: string): any;
  
  export class Component {
    constructor(jcalData: any);
    getAllSubcomponents(name: string): Component[];
  }

  export class Event {
    constructor(vevent: Component);
    uid: string;
    summary: string;
    description: string;
    location: string;
    startDate: {
      toJSDate(): Date;
      isDate: boolean;
    };
    endDate: {
      toJSDate(): Date;
    };
    isRecurring(): boolean;
    iterator(): Iterator;
    getOccurrenceDetails(occurrence: any): {
      endDate: {
        toJSDate(): Date;
      };
    };
  }

  const ICAL: {
    parse: typeof parse;
    Component: typeof Component;
    Event: typeof Event;
  };

  export default ICAL;
}