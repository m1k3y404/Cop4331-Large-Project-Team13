# Backend - Blog API

Built with Express + TypeScript + MongoDB/Mongoose. Runs on port 5000.

## Setup

Install dependencies:
```
npm install
```

Create a `.env` file in the backend folder:
```
MONGO_URI=mongodb://159.223.183.35:27017/projDB
PORT=5000
```

Start the server:
```
npm start
```

Run tests:
```
npm test
```

---

## Posts API

**GET /api/posts**
Returns all posts newest first. Supports pagination.
- `?page=1&limit=20` (defaults: page 1, 20 per page)

**POST /api/posts**
Create a new post. Tags are generated automatically from the title and content.
```json
{
  "title": "My Post",
  "content": "Post body here",
  "creator": "username"
}
```

**GET /api/posts/search?q=term**
Search posts by title, content, or tags. Returns matching posts.

**GET /api/posts/tag/:tag**
Get all posts that have a specific tag.

**GET /api/posts/user/:username**
Get all posts by a specific user.

**GET /api/posts/:id**
Get a single post by its MongoDB id.

**PUT /api/posts/:id**
Edit a post. The `creator` field in the body must match the original post creator or you get a 403. Tags are regenerated on edit.
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "creator": "username"
}
```

**DELETE /api/posts/:id**
Delete a post. Also deletes all comments on that post.

---

## Comments API

**POST /api/comments**
Add a comment to a post. Returns 404 if the post doesn't exist.
```json
{
  "postId": "mongo_object_id",
  "creator": "username",
  "content": "Comment text"
}
```

**GET /api/comments/:postId**
Get all comments for a post, oldest first.

**DELETE /api/comments/:id**
Delete a comment by id.

---

## API Docs

Go to `/api-docs` in the browser to see the Swagger UI with all routes listed. The raw spec is at `/api-docs.json` if you need to upload it to SwaggerHub for the presentation.

---

## Auto-tagging

When a post is created or edited, the backend pulls the top 5 keywords from the title and content automatically and stores them as tags. Common words like "the", "and", etc. are filtered out. Tags are searchable via `/api/posts/search` or filterable by exact tag via `/api/posts/tag/:tag`.

---

## File structure

```
backend/
  models/
    Post.ts          post schema (title, content, creator, tags, dates)
    Comment.ts       comment schema (postId, creator, content, date)
  routes/
    posts.ts         all post routes + auto-tag logic
    comments.ts      all comment routes
    login.ts         login/register (Hector's)
  tests/
    posts.test.ts    unit tests for auto-tag function
  schema.ts          user schema + db connect (Hector's)
  server.ts          app setup, route mounting, swagger
  swagger.json       OpenAPI spec
```

---

## Notes for frontend

- All responses are JSON
- Errors always come back as `{ "error": "message" }`, empty string means success
- Invalid MongoDB ids return 400, not 500
- Delete post removes its comments too so frontend doesn't have to
- Auth (JWT) is handled separately by vtgit's middleware — once that's added, creator will come from the token instead of the request body
