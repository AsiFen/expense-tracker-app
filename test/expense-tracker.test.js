import assert from 'assert';
import pgPromise from 'pg-promise';
import expenseTracker from '../services/expenses.js';

const connectionString = process.env.database_url || 'postgresql://asisipho:asisipho123@localhost:5432/users';
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

    it('should add expense successfully for monthly category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('monthly', 100, 'Monthly expense');

        assert.equal(result.message, 'Expense added successfully');
        assert.equal(result.total, 100);

    });

    it('should add expense successfully for weekly category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.addExpense('weekly', 50, 'Weekly expense');

        assert.equal(result.message, 'Expense added successfully');
        assert.equal(result.total, 200);

    })

    it('should return all expenses when expenses exist', async () => {
        const tracker = expenseTracker(db);

        await tracker.addExpense('weekly', 20, 'nails');
        await tracker.addExpense('daily', 4, 'hair');
        await tracker.addExpense('monthly', 20, 'party');

        const result = await tracker.allExpenses();

        assert.equal(result.length, 3);

    });

    it('should return "No expenses found." when no expenses exist', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.allExpenses();

        assert.equal(result.message, 'No expenses found.');
    });

    it('should return total expenses and total expense amount for a specific category', async () => {

        const tracker = expenseTracker(db);
        await tracker.addExpense('weekly', 11, 'amazon');
        await tracker.addExpense('once-off', 300, 'baby');
        await tracker.addExpense('monthly', 1000, 'electricity');
        await tracker.addExpense('monthly', 6750, 'rent');


        const result = await tracker.expensesForCategory('monthly');

        assert.equal(result.category, 'monthly');
        assert.deepEqual(result.expenses, [{
            expense: 'electricity'
        },
        {
            expense: 'rent'
        }]);
    });

    it('should return error for non-existing category', async () => {
        const tracker = expenseTracker(db);
        const result = await tracker.expensesForCategory('nonexistent_category');

        assert.equal(result.error, 'Category not found.'); // Check if error message matches the expected error
    });

    it('should delete an expense', async () => {
        const tracker = expenseTracker(db);
        const insertedExpense = await db.one('INSERT INTO expense (expense, amount, total, category_id) VALUES ($1, $2, $3, $4) RETURNING id', ['Test', 50, 50, 1]);

        const result = await tracker.deleteExpense(insertedExpense.id);

        assert.equal(result.message, 'Expense deleted successfully.');
    });

});