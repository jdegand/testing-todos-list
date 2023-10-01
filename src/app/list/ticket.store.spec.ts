import { render } from "@testing-library/angular";
import { createMockWithValues } from "@testing-library/angular/jest-utils";
import { of } from "rxjs";
import { APP_ROUTES } from "../app.route";
import { BackendService } from "../backend.service";
import { ListComponent } from "./list.component";
import { TicketStore } from "./ticket.store";
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

// TicketStore coverage is already good from list tests
// backend service needs tests - will tests improve that code coverage?
describe('TicketStore', () => {

  describe('When init', () => {
    it('Then calls backend.users', async () => {
      const {mockBackendService} = await setup();

      expect(mockBackendService.users).toHaveBeenCalled();
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

// best to just reuse this ?
const setup = async () => {

  const mockBackendService = createMockWithValues(BackendService, {
    users: jest.fn(),
    tickets: jest.fn(),
    newTicket: jest.fn(),
    assign: jest.fn(),
    complete: jest.fn()
  });

  mockBackendService.users.mockReturnValue(of(USERS));
  mockBackendService.tickets.mockReturnValue(of(TICKETS));

  const fixture = await render(ListComponent, {
    routes: APP_ROUTES,
    providers: [provideComponentStore(TicketStore), { provide: BackendService, useValue: mockBackendService }],
  });

  // have to add provideComponentStore because lifecycle methods are used in ticket store 
  // would prefer to have ticket.store use constructor and not deal with injectors 

  const store = new TicketStore(mockBackendService);

  return { fixture, store, mockBackendService };
};

/*
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
      // 
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
*/
