const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

// add some blog posts on server load
BlogPosts.create(
	'Hello World',
	'This is my first blog post!',
	'John Doe',
	'2018-02-02'
);
BlogPosts.create('Second entry', 'Long time no see, blog', 'John Doe');

// return all BlogPosts items
router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});

// check for required fields ('title', 'content', 'author')
// if not included, log an error and return a 400 status code.
// if okay, add new item to BlogPosts and return it with a 201.
router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const post = BlogPosts.create(
		req.body.title,
		req.body.content,
		req.body.author,
		req.body.publishDate || Date.now()
	);
	res.status(201).json(post);
});

// when DELETE request comes in with id in path,
// try to delete that item from BlogPosts.
router.delete('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted blog post \`${req.params.id}\``);
	res.status(204).end();
});

// when PUT request comes in with updated post, ensure has
// required fields. also ensure that post id in url path, and
// post id in updated post object match. if problems with any
// of that, log error and send back status code 400. otherwise
// call `BlogPosts.update` with updated post.
router.put('/:id', jsonParser, (req, res) => {
	const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.params.id !== req.body.id) {
		const message = `Request path id (${
			req.params.id
		}) and request body id ``(${req.body.id}) must match`;
		console.error(message);
		return res.status(400).send(message);
	}
	console.log(`Updating blog post \`${req.params.id}\``);
	const updatedPost = BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
	});
	res.status(204).end();
});

module.exports = router;
