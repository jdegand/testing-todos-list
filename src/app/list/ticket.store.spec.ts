import { BackendService } from "../backend.service";
import { TicketStore } from "./ticket.store";
import { TestBed } from "@angular/core/testing";
import { provideComponentStore } from "@ngrx/component-store";

const USERS = [
  { id: 1, name: 'titi' },
  { id: 2, name: 'george' },
];
const TICKETS = [
  {
    id: 0,
    description: 'Install a monitor arm',
    assigneeId: 1,
    completed: false,
  },
  {
    id: 1,
    description: 'Coucou',
    assigneeId: 1,
    completed: false,
  },
];

// maybe better to use TestBed

describe('TicketStore', () => {

  let ticketStore: TicketStore;
  let backendServiceSpy: any;

  beforeEach(() => {
    const backendServiceSpyObj = {
      newTicket: jest.fn(),
      update: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        provideComponentStore(TicketStore),
        { provide: BackendService, useValue: backendServiceSpyObj },
      ],
    });

    ticketStore = TestBed.inject(TicketStore);

    backendServiceSpy = TestBed.inject(BackendService) as unknown as typeof backendServiceSpyObj;

    ticketStore.setState({ users: USERS, tickets: TICKETS, loading: false, error: false, search: '' });
  });

  it('should be created', () => {
    expect(ticketStore).toBeTruthy();
  });

  describe('When init', () => {
    it('Then calls backend.users', async () => {

    });

    it('Then calls backend.tickets', async () => {
      //
    });

    describe('Given all api returns success response', () => {
      it('Then tickets and users should be merged ', async () => {
        //
      });
    });

    describe('Given users api returns failure response', () => {
      it('Then tickets should not have any assignee', () => {
        //
      });
    });

    describe('When adding a new ticket with success', () => {
      it('Then ticket is added to the list', async () => {
        //
      });
    });
  });
});
