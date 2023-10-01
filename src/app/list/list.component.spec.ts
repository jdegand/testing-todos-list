import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { BackendService } from '../backend.service';
import { ListComponent } from './list.component';
import { createMockWithValues } from '@testing-library/angular/jest-utils';
import { APP_ROUTES } from '../app.route';

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

// these tests help ticket store coverage
// ListComponent was 100% before any tests were written
describe('ListComponent', () => {

    describe('Given Install inside the search input', () => {
        it('Then one row is visible', async () => {

            await setup();

            const user = userEvent.setup();

            const input = screen.getByLabelText("Search");

            await user.type(input, "Install");

            const list = screen.getByRole("list");
            const { getAllByRole } = within(list);
            const items = getAllByRole("listitem")
            expect(items.length).toBe(1);
        });
    });

    describe('When typing a description and clicking on add a new ticket', () => {
        describe('Given a success answer from API', () => {
            it('Then ticket with the description is added to the list with unassigned status', async () => {
                const { mockBackendService } = await setup();

                const user = userEvent.setup();

                mockBackendService.newTicket.mockReturnValue(of({
                    id: 3,
                    description: "asdfasdfasdf", // best to make this a jumble of letters unlikely to be in the html ?
                    assigneeId: null,
                    completed: false,
                }))

                const input = screen.getAllByRole("textbox")[1];

                await user.type(input, "asdfasdfasdf");

                const button = screen.getAllByRole("button")[0];

                await user.click(button);

                const list = screen.getByRole("list");
                const { getAllByRole } = within(list);
                const items = getAllByRole("listitem")
                expect(items.length).toBe(3);

                expect(screen.getByText("asdfasdfasdf")).toBeInTheDocument();
                // need to check for unassigned status
                // tough to grab the assignee text 
                // added a testId in the row component for it

                // tried to interpolate the ticket.id into the data-testid in row component
                // tough syntax to get right but it may be possible -> I have tried to do this before 

                const assigneeDiv = screen.getAllByTestId("assigneeDiv")[2]; // last one
                expect(assigneeDiv.textContent).toContain("unassigned");
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                const { mockBackendService } = await setup();

                const user = userEvent.setup();

                // error is unknown and doesn't have a defined shape
                mockBackendService.newTicket.mockReturnValue(throwError(() => "795fsnfksdnfjsndf"))

                const input = screen.getAllByRole("textbox")[1];

                await user.type(input, "asdfasdfasdf");

                const button = screen.getAllByRole("button")[0];

                await user.click(button);

                expect(screen.getByText("795fsnfksdnfjsndf")).toBeInTheDocument();
            });
        });
    });

    describe('When assigning first ticket to george', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is assigned to george', async () => { // george is not capitalized
                const { mockBackendService, fixture } = await setup();

                const user = userEvent.setup();

                mockBackendService.assign.mockReturnValue(of({
                    id: 0,
                    description: 'Install a monitor arm',
                    assigneeId: 2, // initially 1
                    completed: false,
                }));

                // const combobox = screen.getByRole("combobox"); you can't grab the combobox
                // Need to use async or get component to render again so the DOM is totally populated before querying

                // I used fixture.detectChanges() -> accustomed to using from karma and jasmine
                // could also try waitFor or waitForAsync
                // Looked at Thomas' solution he awaited some screen queries - I didn't know you can do that
                // I always use the other ways to deal with async issues

                // Added testIds -> I feel like this could be a case where they are beneficial
                // Any added list item -> you always have a selector and just have to update indexes
                // And you aren't really bloating the code or making unmaintainable 
                // the row component is being repeated and the selector would only be changed inside it

                fixture.detectChanges();

                const button = screen.getAllByTestId("assignBtn")[0];

                await user.click(button);

                const assigneeDiv = screen.getAllByTestId("assigneeDiv")[0];
                expect(assigneeDiv.textContent).toContain("george");
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                const { mockBackendService, fixture } = await setup();

                const user = userEvent.setup();

                mockBackendService.assign.mockReturnValue(of(throwError(() => "qwertyqwertyqwerty")));

                fixture.detectChanges();

                const button = screen.getAllByTestId("assignBtn")[0];

                await user.click(button);

                const assigneeDiv = screen.getAllByTestId("assigneeDiv")[0];
                expect(assigneeDiv.textContent).toContain("titi"); // original value

                // By using a random string that you know is unlikely to naturally appear in the document,
                // you don't have to be precise with your selector
                // however, using screen.getByText is less performant as it scans the whole document
                // So if you many tests or tests that need to be done often this would need to be changed
                expect(screen.getByText("qwertyqwertyqwerty")).toBeInTheDocument();
            });
        });
    });

    describe('When finishing first ticket', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is done', async () => {
                const { mockBackendService, fixture } = await setup();

                const user = userEvent.setup();

                // {...TICKETS[0], completed: true}
                mockBackendService.complete.mockReturnValue(of({
                    id: 0,
                    description: 'Install a monitor arm',
                    assigneeId: 1,
                    completed: true, // initially false
                }));

                fixture.detectChanges();

                const button = screen.getAllByTestId("doneBtn")[0];

                screen.debug(button)

                await user.click(button);

                expect(screen.getAllByTestId("doneDiv")[0].textContent).toContain("true");
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {

                const { mockBackendService, fixture } = await setup();

                const user = userEvent.setup();

                mockBackendService.complete.mockReturnValue(of(throwError(() => "qwertyqwertyqwerty")));

                fixture.detectChanges();

                const button = screen.getAllByTestId("doneBtn")[0];

                await user.click(button);

                expect(screen.getAllByTestId("doneDiv")[0].textContent).toContain("false");
                
                expect(screen.getByText("qwertyqwertyqwerty")).toBeInTheDocument();
            });
        });
    });

    describe('When clicking on first ticket', () => {
        it('Then we navigate to detail/0', async () => {
            //
        });
    });

});

// getting setup function right is difficult

// I originally had mockBackendService set to just an object
// influenced by this video https://www.youtube.com/watch?v=mxokTCBwg2E
// throughout the video, they disregard typing  
// key takeaway from video -> just use objects to convert from jasmine to jest

/*
const mockBackendService = {
    users: jest.fn(),
    tickets: jest.fn(),
    newTicket: jest.fn(),
    assign: jest.fn(),
    complete: jest.fn()
}
*/

// could add userEvent to setup but I already had that in many tests
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
        providers: [{ provide: BackendService, useValue: mockBackendService }],
    });

    return { fixture, mockBackendService };
};


/*
describe('ListComponent', () => {

    // Is the initial setup incomplete ?

    //let component: ListComponent;
    //let fixture: ComponentFixture<ListComponent>;

    //To change with a setup function
    //beforeEach(async () => {
    //    await TestBed.configureTestingModule({
    //        imports: [
    //            ListComponent,
    //            ReactiveFormsModule,
    //            RouterTestingModule,
    //            NoopAnimationsModule,
    //            // Missing RowComponent, AddComponent ?
    //        ],
    //        providers: [
    //            provideComponentStore(TicketStore),  // need to add the store ?
    //                // if there is no store, you can't see any rows and you can't query them
    //                // used screen.debug() 
    //                // even if store is added, you can't see the rows 
    //                // guess you don't need it then
    //            {
    //                provide: BackendService,
    //                useValue: {
    //                    users: () => of(USERS),
    //                    tickets: () => of(TICKETS),
    //                    // add more functions here
    //                    newTicket: jest.fn(), etc
    //                },
    //            },
    //        ],
    //    }).compileComponents();
    //
    //});
    //
    //beforeEach(() => {
    //    fixture = TestBed.createComponent(ListComponent);
    //    component = fixture.componentInstance;
    //    fixture.detectChanges(); // comment out and use in tests after an action?
    //});

    describe('Given Install inside the search input', () => {
        it('Then one row is visible', async () => {

            await setup();

            const user = userEvent.setup();

            const input = screen.getByLabelText("Search");

            await user.type(input, "Install");

            const list = screen.getByRole("list");
            const { getAllByRole } = within(list);
            const items = getAllByRole("listitem")
            expect(items.length).toBe(1);
        });
    });

    // this test should probably go in a add.component.spec file
    describe('When typing a description and clicking on add a new ticket', () => {
        describe('Given a success answer from API', () => {
            it('Then ticket with the description is added to the list with unassigned status', async () => {
                await setup();

                const user = userEvent.setup();

                const input = screen.getByLabelText("Search");

                await user.type(input, "New Ticket");

                const addButton = screen.getByRole('button', { name: "Add new Ticket" });

                await user.click(addButton);

                waitFor(() => {

                    const list = screen.getByRole("list");

                    const { getAllByRole } = within(list);
                    const items = getAllByRole("listitem")

                    expect(items.length).toBe(3);
                })
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                //
            });
        });
    });

    describe('When assigning first ticket to george', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is assigned to George', async () => {
                //
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                //
            });
        });
    });

    describe('When finishing first ticket', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is done', async () => {
                //
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                //
            });
        });
    });

    describe('When clicking on first ticket', () => {
        it('Then we navigate to detail/0', async () => {
            //
        });
    });
});

async function setup() {

    await render(ListComponent, {
        imports: [
            RowComponent,
            AddComponent,
            ReactiveFormsModule,
            RouterTestingModule,
            NoopAnimationsModule,
        ],
        providers: [
            //provideComponentStore(TicketStore),
            provideMockWithValues(BackendService, {
                tickets: jest.fn(() => {
                    return of(TICKETS);
                }),
                users: jest.fn(() => {
                    return of(USERS);
                }),
            }),
        ],
    });
}
*/
