import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { RowComponent } from './row.component';
import { APP_ROUTES } from '../../app.route';
import { Router } from '@angular/router';

const USERS = [
    { id: 1, name: 'titi' },
    { id: 2, name: 'George' },
];
const TICKET_NOT_ASSIGNED = {
    id: 0,
    description: 'Install a monitor arm',
    assignee: 'unassigned',
    completed: false,
};

const TICKET_ASSIGNED = {
    id: 1,
    description: 'Install a monitor arm',
    assignee: 'titi',
    completed: false,
};

//let router: Router;

describe('RowComponent', () => {
    describe('Given an unassigned ticket', () => {
        describe('When we assign it to titi', () => {
            it('Then assign event is emitted with ticketId 0 and userId 1', async () => {

                const user = userEvent.setup();

                const mockAssign = jest.fn();
                const mockCloseTicket = jest.fn();

                await render(RowComponent, {
                    componentInputs: {
                        ticket: TICKET_NOT_ASSIGNED,
                        users: USERS
                    },
                    componentOutputs: {
                        assign: {
                            emit: mockAssign
                        } as any,
                        closeTicket: {
                            emit: mockCloseTicket
                        } as any
                    }
                })

                await userEvent.click(screen.getByRole('combobox'));

                // options don't appear until you click the select

                expect(screen.getByText('titi')).toBeInTheDocument();

                expect(screen.getByText('George')).toBeInTheDocument();

                const assignBtn = screen.getByRole('button', { name: 'Assign' });

                //await user.selectOptions(screen.getByRole('combobox'), 'titi');  // doesn't work

                await user.click(screen.getByText('titi'));

                await user.click(assignBtn);

                expect(mockAssign).toHaveBeenCalledWith({ "ticketId": 0, "userId": 1 });
            });
        });
    });

    // after first test -> code coverage is 100%

    describe('Given an assigned ticket', () => {
        describe('When we click the done button', () => {
            it('Then closeTicket event is emitted with ticketId 1 ', async () => {

                const user = userEvent.setup();

                const mockAssign = jest.fn();
                const mockCloseTicket = jest.fn();

                await render(RowComponent, {
                    componentInputs: {
                        ticket: TICKET_ASSIGNED,
                        users: USERS
                    },
                    componentOutputs: {
                        assign: {
                            emit: mockAssign
                        } as any,
                        closeTicket: {
                            emit: mockCloseTicket
                        } as any
                    }
                });

                const doneButton = screen.getByRole('button', { name: 'Done' });

                await user.click(doneButton);

                expect(mockCloseTicket).toHaveBeenCalledWith(1);
            });
        });
    });

    /*
    describe('When clicking on ticket', () => {
        it('Then navigation should be triggered with url detail/0', async () => {

            // possible to test without TestBed ?

            const user = userEvent.setup();

            const mockAssign = jest.fn();
            const mockCloseTicket = jest.fn();

            //const navigateSpy = jest.spyOn(router,'navigate');

            // just bring in the routes and then test the click?

            await render(RowComponent, {
                routes: APP_ROUTES,
                componentInputs: {
                    ticket: TICKET_ASSIGNED, //doesn't matter
                    users: USERS
                },
                componentOutputs: {
                    assign: {
                        emit: mockAssign
                    } as any,
                    closeTicket: {
                        emit: mockCloseTicket
                    } as any
                }
            });
        });
    });
    */

    /*
    describe('When clicking on ticket', () => {
        it('Then navigation should be triggered with url detail/0', async () => {

            // possible to test without TestBed ?

            const user = userEvent.setup();

            const mockAssign = jest.fn();
            const mockCloseTicket = jest.fn();

            // just bring in the routes and then test the click?

            const mockRouter = {
                navigate: jest.fn()
            }

            await render(RowComponent, {
                routes: APP_ROUTES,
                providers: [{ provide: Router, useValue: mockRouter }],
                componentInputs: {
                    ticket: TICKET_ASSIGNED, //doesn't matter 
                    users: USERS
                },
                componentOutputs: {
                    assign: {
                        emit: mockAssign
                    } as any,
                    closeTicket: {
                        emit: mockCloseTicket
                    } as any
                }
            });


            const button = screen.getByRole('button'); // first button

            await user.click(button);

            //expect(navigateSpy).toHaveBeenCalledWith('[/detail/1]');

            expect(mockRouter.navigate).toHaveBeenCalledWith('[/detail/1]');
        });
    });
    */

});
