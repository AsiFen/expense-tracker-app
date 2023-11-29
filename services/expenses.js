export default function expenseTracker() {
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
                const category = await db.oneOrNone('SELECT id FROM category WHERE category_type = $1', [category_chosen]);

                if (category) {
                    let total = amount; // Default total to amount
                    if (category.id === 2 || category.id === 5) {
                        // Monthly or Once-off
                        total *= 1;
                    } else if (category.id === 1) {
                        // Weekly
                        total *= 4;
                    } else if (category.id === 3) {
                        // Weekday
                        total *= 5 * 4;
                    } else if (category.id === 4) {
                        // Weekend
                        total *= 2 * 4;
                    } else if (category.id === 6) {
                        // Daily
                        total *= 30;
                    }

                    // Insert expense details into the expense table
                    await db.none('INSERT INTO expense (expense, amount, total, category_id) VALUES ($1, $2, $3, $4)',
                        [description, amount, total, category.id]);

                    return { message: 'Expense added successfully.' };
                } else {
                    return { error: 'Category not found.' };
                }
            } catch (error) {
                return { error: error.message };
            }
        },

        allExpenses: async () => {

        },

        expensesForCategory: async (categotyId) => {

        },

        deleteExpense: async (expenseId) => {

        },

        categoryTotals: async () => {

        }

    }
}