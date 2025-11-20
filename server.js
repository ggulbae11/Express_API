const express = require('express');
const app = express();

app.use(express.json());

let users = [
	{id: '1', name:'Sunjae', email: 'sj111@gmail.com', age: '24'},
	{id: '2', name:'Peter', email: 'nicepeter@gmail.com', age: '28'}
];

let books = [
	{id: '1', title: 'Harry Potter', price: '15000', quantity: '12', ownerId: '1'},
	{id: '2', title: 'The load of the rings', price: '17000', quantity: '6', ownerId: '2'}
];

let userIdCounter = 
	users.length > 0 
    ? Math.max(...users.map(u => Number(u.id))) + 1 : 1;


let bookIdCounter = 
	books.length > 0 
    ? Math.max(...books.map(b => Number(b.id))) + 1 : 1;


function successResponse(data) {
	return {status: 'success', data};
}

function errorResponse(code, message) {
	return {status: 'error', error: {code, message}};
}

app.use((req, res, next) => {
	const now = new Date().toISOString();
	console.log(`[${now}] ${req.method} ${req.originalUrl} - body: ${JSON.stringify(req.body)}`);
	next();
});

app.post('/users', (req, res, next) => {
	try {
		const {name, email, age} = req.body;

		const id = String(userIdCounter++);

		const newUser = {id, name, email, age};

		users.push(newUser);

		return res.status(201).json(successResponse({user:newUser}));
	} catch (err) {
		next (err);
	}
});

app.get('/users/:id/books', (req, res) => {
	const {id} = req.params;
	const user = users.find(u => u.id === id);
	if (!user) {
		return res.status(404).json(errorResponse(404, 'User not found'));
	}

	const ownedBooks = books.filter(b => String(b.ownerId) === String(id));
	return res.status(200).json(successResponse({ user, books: ownedBooks }));
})

app.get('/users', (req, res) => {
	return res.status(200).json(successResponse({users}));
});

app.get('/users/:id', (req, res) => {
    const {id} = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json(errorResponse(404, "User not found"));
    }

    return res.status(200).json(successResponse({user}));
});

app.put('/users/:id', (req, res) =>{
	const {id} = req.params;
	const {name, email, age} = req.body || {};
	
	if (!name && !email && !age) {
		return res.status(400).json(errorResponse(400, "The information does not exist."));
	}

	const idx = users.findIndex(u => u.id ===id);

	if (idx === -1) {
		return res.status(404).json(errorResponse(404, 'User not found'));
	}
		users[idx] = {...users[idx], ...(name ? {name} : {}), ...(email ? {email} : {}), ...(age ? {age} : {})};
		return res.status(200).json(successResponse({user: users[idx]}));
});

app.delete('/users/:id', (req, res) => {
	const {id} = req.params;
	const idx = users.findIndex(u => u.id ===id);
	if (idx === -1) {
		return res.status(404).json(errorResponse(404, 'User not found'));
	}
	users.splice(idx, 1);

	return res.status(204).send();
})

//

app.post('/books', (req, res, next) => {
    try {
        const {title, price, quantity, ownerId} = req.body || {};

		const ownerExists = users.some(u => u.id === ownerId);
    	if (!ownerExists) {
      		return res.status(400).json(errorResponse(400, 'Invalid ownerId — user not found'));
    	}

        const id = String(bookIdCounter++);
        const newBook = {id, title, price, quantity, ownerId};
        books.push(newBook);
        return res.status(201).json(successResponse({book: newBook}));
    } catch (err) {
        next(err);
    }
});


app.get('/books', (req, res) => {
	return res.status(200).json(successResponse({books}));
});

app.get('/books/:id', (req, res) => {
    const {id} = req.params;
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json(errorResponse(404, "Book not found"));
    }

    return res.status(200).json(successResponse({book}));
});

app.put('/books/:id', (req, res) =>{
	const {id} = req.params;
	const {title, price, quantity} = req.body || {};
	
	if (!title && !price && !quantity) {
		return res.status(400).json(errorResponse(400, "The information does not exist."));
	}

	const idx = books.findIndex(b => b.id ===id);

	if (idx === -1) {
		return res.status(404).json(errorResponse(404, 'Book not found'));
	}
		books[idx] = {...books[idx], ...(title ? {title} : {}), ...(price ? {price} : {}), ...(quantity ? {quantity} : {})};
		return res.status(200).json(successResponse({book: books[idx]}));
});

app.delete('/books/:id', (req, res) => {
	const {id} = req.params;
	const idx = books.findIndex(b => b.id ===id);
	if (idx === -1) {
		return res.status(404).json(errorResponse(404, 'Book not found'));
	}
	books.splice(idx, 1);

	return res.status(204).send();
})


app.use((err, req, res, next) => {
	console.error('Unhandled error.', err && err.stack ? err.stack : err);
	const status = err && err.status && Number.isInteger(err.status) ? err.status : 500;
	const message = err && err.message ? err.message : 'Internal Server Error';
	return res.status(status).json(errorResponse(status, message));
});

app.use((req, res) => {
	return res.status(404).json(errorResponse(404, 'Endpoint not found.'));
});

const PORT = process.env.PORT || 3000;

app.listen (PORT, () =>{
	console.log(`API server opened on port ${PORT}`);
});
