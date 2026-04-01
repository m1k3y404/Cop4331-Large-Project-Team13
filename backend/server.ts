import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import { connectDB } from './schema.js';
import loginRoute from './routes/login.js';
import postsRoute from './routes/posts.js';
import commentsRoute from './routes/comments.js';

const require = createRequire(import.meta.url);
const swaggerSpec = require('./swagger.json') as object;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.get('/api-docs', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head><title>Team 13 API Docs</title>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
SwaggerUIBundle({ url: '/api-docs.json', dom_id: '#swagger-ui' })
</script>
</body>
</html>`);
});

app.use('/api/users', loginRoute);
app.use('/api/posts', postsRoute);
app.use('/api/comments', commentsRoute);

connectDB().then(() => {
  app.listen(5000);
});
