import { render, screen, waitFor, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { BackendService } from '../backend.service';
import { ListComponent } from './list.component';
import { createMockWithValues } from '@testing-library/angular/jest-utils';
import { APP_ROUTES } from '../app.route';
import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
// ListComponent has 100% coverage before any tests are written
describe('ListComponent', () => {

    describe('Given Install inside the search input', () => {
        it('Then one row is visible', async () => {

            const { user } = await setup();

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
                const { mockBackendService, user } = await setup();

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

                screen.getByText("asdfasdfasdf");
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
                const { mockBackendService, user } = await setup();

                // error is unknown and doesn't have a defined shape
                mockBackendService.newTicket.mockReturnValue(throwError(() => "795fsnfksdnfjsndf"))

                const input = screen.getAllByRole("textbox")[1];

                await user.type(input, "asdfasdfasdf");

                const button = screen.getAllByRole("button")[0];

                await user.click(button);

                screen.getByText("795fsnfksdnfjsndf");
            });
        });
    });

    describe('When assigning first ticket to george', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is assigned to george', async () => {
                const { mockBackendService, fixture, user } = await setup();

                mockBackendService.assign.mockReturnValue(of({
                    id: 0,
                    description: 'Install a monitor arm',
                    assigneeId: 2, // initially 1
                    completed: false,
                }));

                // const combobox = screen.getByRole("combobox"); you can't grab the combobox
                // Need to use async or get component to render again so the DOM is totally populated before querying

                // I used fixture.detectChanges() -> accustomed to using that from karma and jasmine

                // Looked at Thomas' solution he awaited some screen queries
                // You can use also waitFor or waitForAsync to wrap the queries.  

                // Thomas' solution used within to look inside the rows -> within is good for lists

                // I added testIds -> I feel like this could be a case where they are beneficial
                // Performance-wise better than using within ? Absolutely.  2x - 4x quicker.

                // I feel like this code is a little easier to understand at first glance as well 

                fixture.detectChanges();

                const button = screen.getAllByTestId("assignBtn")[0];

                await user.click(button);

                const assigneeDiv = screen.getAllByTestId("assigneeDiv")[0];
                expect(assigneeDiv.textContent).toContain("george");
            });
        });

        /*
        // Thomas's test -> using within
        // maybe save within(rows[0]) to a variable
        // still doesn't help performance -> within is not performant

        describe('Thomas solution- When assigning first ticket to george', () => {
            describe('Given a success answer from API', () => {
                it('Then first ticket is assigned to George', async () => {
                    //
                    const { mockBackendService } = await setup();
                    const user = userEvent.setup();

                    mockBackendService.assign.mockImplementation((ticketId, userId) =>
                        of({
                            ...TICKETS[0],
                            id: ticketId,
                            assigneeId: userId,
                        })
                    );

                    let rows = await screen.findAllByRole('listitem');

                    const savedWithin = within(rows[0]);

                    const assignSelect = savedWithin.getByRole('combobox', {
                        name: /assign to/i,
                    });

                    await user.click(assignSelect);
                    await user.click(screen.getByText(/george/i));

                    await user.click(
                        savedWithin.getByRole('button', { name: /^assign$/i })
                    );

                    rows = await screen.findAllByRole('listitem');
                    savedWithin.getByText(/george/i);
                });
            })
        })
        */

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {
                const { mockBackendService, fixture, user } = await setup();

                mockBackendService.assign.mockReturnValue(of(throwError(() => "qwertyqwertyqwerty")));

                fixture.detectChanges();

                const button = screen.getAllByTestId("assignBtn")[0];

                await user.click(button);

                const assigneeDiv = screen.getAllByTestId("assigneeDiv")[0];
                expect(assigneeDiv.textContent).toContain("titi"); // original value

                // By using a random string that you know that is unlikely to naturally appear in the document,
                // you don't have to be precise with your selector
                // however, using screen.getByText is less performant as it scans the whole document
                // So if you have many tests or tests that need to be done often, this would need to be refined
                screen.getByText("qwertyqwertyqwerty");
            });
        });
    });

    describe('When finishing first ticket', () => {
        describe('Given a success answer from API', () => {
            it('Then first ticket is done', async () => {
                const { mockBackendService, fixture, user } = await setup();

                // {...TICKETS[0], completed: true}
                mockBackendService.complete.mockReturnValue(of({
                    id: 0,
                    description: 'Install a monitor arm',
                    assigneeId: 1,
                    completed: true, // initially false
                }));

                fixture.detectChanges();

                const button = screen.getAllByTestId("doneBtn")[0];

                await user.click(button);

                expect(screen.getAllByTestId("doneDiv")[0].textContent).toContain("true");
            });
        });

        describe('Given a failure answer from API', () => {
            it('Then an error is displayed at the bottom of the list', async () => {

                const { mockBackendService, fixture, user } = await setup();

                mockBackendService.complete.mockReturnValue(of(throwError(() => "qwertyqwertyqwerty")));

                fixture.detectChanges();

                const button = screen.getAllByTestId("doneBtn")[0];

                await user.click(button);

                expect(screen.getAllByTestId("doneDiv")[0].textContent).toContain("false");

                screen.getByText("qwertyqwertyqwerty");
            });
        });
    });

    describe('When clicking on first ticket', () => {
        it('Then we navigate to detail/0', async () => {
            const { user } = await setup();

            const location = TestBed.inject(Location);
            const rowButton = screen.getAllByRole('button')[0];

            await user.click(rowButton);

            waitFor(() => {
                expect(location.path()).toEqual('/detail/0');
            })
        });
    });

    describe('When clicking on first ticket', () => {
        it('Then we navigate to detail/0 with router spy', async () => {

            // this test is slightly slower than previous test

            const { user } = await setup();

            const route = TestBed.inject(Router);

            const navigateSpy = jest.spyOn(route, 'navigate');

            const rowButton = screen.getAllByRole('button')[0];

            await user.click(rowButton);

            waitFor(() => {
                expect(navigateSpy).toHaveBeenCalledWith('/detail/0');
            })
        });
    });

});

// getting setup function right is difficult

// I originally had mockBackendService set to just an object
// influenced by this video https://www.youtube.com/watch?v=mxokTCBwg2E
// throughout the video, they disregard typing  
// key takeaway from video -> just use objects to convert from jasmine to jest

//const mockBackendService = {
//    users: jest.fn(),
//    tickets: jest.fn(),
//    newTicket: jest.fn(),
//    assign: jest.fn(),
//    complete: jest.fn()
//}

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

    const user = userEvent.setup();

    return { fixture, mockBackendService, user };
};
