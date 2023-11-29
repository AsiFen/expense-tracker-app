//import express  framework
import express from 'express';
//import the handlebars engine 
import exphbs from 'express-handlebars';
//import body-parsers to handle the reading of template objects?
import bodyParser from 'body-parser';
//import express flash and session to use inconjuction for displaying error & reset messages
import flash from 'express-flash';
import session from 'express-session';

//conection to the database using pg-promise and dotevn
import db from './db/connect.js'
import expenseTracker from './services/expenses.js';
//instantiate express module

let expense_Tracker = expenseTracker(db);

let app = express();

//configuring the handlebars module 
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
// initialise session middleware - flash-express depends on it
app.use(session({
    secret: "<JesusLovesYou>",
    resave: false,
    saveUninitialized: true
}));
// initialise the flash middleware
app.use(flash());
// his ensures form variables can be read from the req.body variable
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//built-in static middleware from ExpressJS to use static resources such as my CSS
app.use(express.static('public'))

app.get('/', async (req, res) => {
    let categories = await expense_Tracker.categoryNames();
    const categoriesWithTotals = await expense_Tracker.categoryTotals(); // Fetch categories with totals
    const totalExpenses = await expense_Tracker.totalExpenses(); 

    res.render('index', {
        categories: categories,
        categoriesWithTotals,
        totalExpenses,
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
});

app.get('/viewExpenses', async (req, res) => {
    try {
        const allExpenses = await expense_Tracker.allExpenses(); 

        res.render('viewExpenses', {
           allExpenses,
            messages: {
                error: req.flash('error'),
                success: req.flash('success')
            }
        });
    } catch (error) {
        req.flash('error', error.message || 'Error fetching all expenses');
        res.redirect('/viewExpenses');
    }
});

app.post('/addExpense', async (req, res) => {
    const category = req.body.category;
    const description = req.body.description;
    const amount = req.body.amount;

    try {
        const result = await expense_Tracker.addExpense(category, amount, description);

        if (result.message) {
            req.flash('success', result.message);
        } else {
            req.flash('error', result.error || 'An error occurred while adding the expense.');
        }
        res.redirect('/'); 
    } catch (error) {
        req.flash('error', error.message || 'An error occurred while processing the request.');
        res.redirect('/');
    }


}); 
app.post('/deleteExpense', async (req, res) => {
    try {
        const expenseIdToDelete = req.body.expenseId; 

        // Call the deleteExpense function from your expenseTracker with the expenseIdToDelete
        const deleteResult = await expense_Tracker.deleteExpense(expenseIdToDelete);

        if (deleteResult.message === 'Expense deleted successfully.') {
            req.flash('success', 'Expense deleted successfully.');
        } else {
            req.flash('error', 'Failed to delete expense.');
        }

        // Redirect back to the page displaying all expenses after deletion
        res.redirect('/viewExpenses');
    } catch (error) {
        // Handle any errors that might occur during the deletion process
        req.flash('error', 'An error occurred while deleting the expense.');
        res.redirect('/viewExpenses');
    }
});

app.get('/filterExpense', async (req, res) => {
    try {
        const categories = await expense_Tracker.categoryNames();
        res.render('filterExpense', { categories });
    } catch (error) {
        // Handle errors appropriately
        res.status(500).send('Error occurred while fetching categories.');
    }
});

app.post('/filterExpense', async (req, res) => {
    try {
        const category_chosen = req.body.category_chosen;
        const filteredExpenses = await expense_Tracker.expensesForCategory(category_chosen);
        const categories = await expense_Tracker.categoryNames();
        console.log(filteredExpenses);
        res.render('filterExpense', { categories, filteredExpenses, selectedCategory: category_chosen });
    } catch (error) {
        // Handle errors appropriately
        res.status(500).send('Error occurred while filtering expenses.');
    }
});


//process the enviroment the port is running on
let PORT = process.env.PORT || 4545;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})