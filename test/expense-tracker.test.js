import assert from 'assert';
import pgPromise from 'pg-promise';
import expenseTracker from '../services/expenses.js';

const connectionString = process.env.database_url || 'postgresql://asisipho:asisipho123@localhost:5432/users';
const db = pgPromise()(connectionString);

describe('Expense Tracker Functions', () => {
    before(async function () {
        try {
            // Clean the tables before each test run
            await db.none('DELETE FROM expense');
        } catch (err) {
            throw err;
        }
    });

    it('should add expense successfully for monthly category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('monthly', 100, 'lunch');
        assert.equal(result.message, 'Expense added successfully');

    });

    it('should add expense successfully for monthly category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('monthly', 100, 'Monthly expense');

        assert.equal(result.message, 'Expense added successfully');
        assert.equal(result.total, 100);



        // Additional assertions related to checking the actual data in the database for the monthly category can be performed here
    });

    it('should add expense successfully for weekly category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('weekly', 50, 'Weekly expense');

        assert.equal(result.message, 'Expense added successfully');
        assert.equal(result.total, 200);

    })

});