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
    const totalExpenses = await expense_Tracker.totalExpenses(); 
console.log(totalExpenses);
    res.render('index', {
        categories: categories,
        totalExpenses,
        messages: {
            error: req.flash('error'),
            success: req.flash('success')
        }
    });
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

})


//process the enviroment the port is running on
let PORT = process.env.PORT || 4545;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})