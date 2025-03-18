import { IEvents } from './base/events';
import { Form } from './common/Form';
import { IContacts } from '../types';

export class Contacts extends Form<IContacts> {
  constructor(
    container: HTMLFormElement,
    events: IEvents
  ) {
    super(container, events);
  }
}
