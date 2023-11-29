import assert from 'assert';
import pgPromise from 'pg-promise';
import expenseTracker from '../services/expenses.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://asisipho:asisipho123@localhost:5432/users';
const db = pgPromise()(connectionString);

describe('Expense Tracker Functions', () => {
    beforeEach(async function () {
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

    it('should handle when category is not found', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('nonexistent_category', 50, 'brunch');

        assert.equal(result.error, 'Category not found.');

    });


});