export default function expenseTracker(db) {
    return {

        addExpense: async (category_chosen, amount, description) => {
            //will retrieve the categoryId from the category table using the input/value given by user
            //insert expense details(description, amount, and catergoryId) into expense table
            //send message for successfull addition of expense
            //send message for when addtion of expense is unsuccessful
            //if category is :monthly or once off - multiply by 1 and add that as total,
            //Weekly - multiply 4 times 
            // Weekday - multiply(5 * 4)
            // Weekend - multiply by (2 * 4)
            // Daily  - multiply by 30 

            try {
                // Retrieve category id
                const category = await db.any('SELECT id FROM category WHERE category_type = $1', [category_chosen]);
                if (category[0].id == null) {
                    return { error: 'Category not found.' };

                } else {
                    let total = amount; // Default total to amount
                    if (category[0].id === 2 || category[0].id === 5) {
                        // Monthly or Once-off
                        total *= 1;
                    } else if (category[0].id === 1) {
                        // Weekly
                        total = amount * 4;
                    } else if (category[0].id === 3) {
                        // Weekday
                        total *= 5 * 4;
                    } else if (category[0].id === 4) {
                        // Weekend
                        total *= 2 * 4;
                    } else if (category[0].id === 6) {
                        // Daily
                        total *= 30;
                    }
                    // Insert expense details into the expense table
                    let id = await db.one('INSERT INTO expense (expense, amount, total, category_id) VALUES ($1, $2, $3, $4)RETURNING id',
                        [description, amount, total, category[0].id]);

                    return { message: 'Expense added successfully', total: total, id: id };
                }
            } catch (error) {
                return { error: error.message };
            }
        },

        allExpenses: async () => {
            try {
                // Select all expenses with category names from the expenses table and join with the category table
                const results = await db.any(`
        SELECT e.expense, e.amount, e.total, c.category_type AS category
        FROM expense e
        INNER JOIN category c ON e.category_id = c.id
    `);

                if (results.length > 0) {
                    // Return the expenses if there are any
                    return results;
                } else {
                    // Return a message when there are no expenses
                    return { message: 'No expenses found.', results };
                }
            } catch (error) {
                // Return error if there's an issue with the database query
                return { error: error.message };
            }
        },

        expensesForCategory: async (category_chosen) => {
            //use the category name to get the category id
            //select all for each category 

            try {
                // Retrieve category ID using the category name
                const category = await db.oneOrNone('SELECT id FROM category WHERE category_type = $1', [category_chosen]);

                if (!category) {
                    return { error: 'Category not found.' };
                }

                // Retrieve expenses for the specific category and calculate the total sum of their totals
                const expenses = await db.any('SELECT expense FROM expense WHERE category_id = $1', [category.id]);

                return { category: category_chosen, expenses };

            } catch (error) {
                return { error: error.message };

            }
        },

        deleteExpense: async (expenseId) => {
            //delete from expense table the expense 
            //using delete from expense where id equal given id
            try {
                // Delete the expense from the expenses table using the provided expense ID
                const deletedExpense = await db.result('DELETE FROM expense WHERE id = $1', expenseId);

                if (deletedExpense.rowCount === 1) {
                    return { message: 'Expense deleted successfully.' };
                } else {
                    return { error: 'Expense not found.' };
                }
            } catch (error) {
                return { error: error.message };
            }
        },

        categoryTotals: async () => {
            // Retrieve totals for all categories
            //use SUM function to calculate the total expense amount for each category
            //use the group by function to group based on categories
            //use join function to retriev the names of the cataegories
            try {
                // Retrieve totals for all categories with their names
                const categoryTotals = await db.any(`
                            SELECT c.category_type, SUM(e.total) AS total
                            FROM expense e
                            INNER JOIN category c ON e.category_id = c.id
                            GROUP BY c.category_type
                        `);

                return categoryTotals;
            } catch (error) {
                return { error: error.message };
            }
        },


        categoryNames: async () => {
            try {
                let results = await db.any('select category_type from category')
                return results
            } catch (error) {
                return { error: error.message };

            }
        },

        // Function to calculate total expenses
        //use sum function to sum all totals from all expenses and categories
        //return the sum or 0 if there is none
        totalExpenses: async () => {
            try {
                // Query to calculate the total expenses
                const totalExpensesQuery = await db.one('SELECT SUM(total) AS total_expenses FROM expense');

                // Extract the total expenses from the query result
                const totalExpenses = totalExpensesQuery.total_expenses || 0;

                return totalExpenses;
            } catch (error) {
                throw new Error('Error fetching total expenses: ' + error.message);
            }
        }

    }
}