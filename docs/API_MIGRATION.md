# Althub API Migration

The backend now supports a versioned API boundary:

```text
/api/v1
```

Existing `/api` routes remain available as compatibility routes while the frontend migrates.

## Compatibility Behavior

Legacy `/api` responses include headers:

```text
X-Althub-API-Version: legacy
X-Althub-API-Deprecated: true
X-Althub-API-Successor: /api/v1
```

Versioned `/api/v1` responses include:

```text
X-Althub-API-Version: v1
```

## Initial Resource-Style Aliases

These `/api/v1` routes are aliases over existing controllers.

| Legacy route | Versioned route |
| --- | --- |
| `GET /api/getPost` | `GET /api/v1/posts` |
| `POST /api/addPost` | `POST /api/v1/posts` |
| `POST /api/editPost` | `PATCH /api/v1/posts/:id` |
| `DELETE /api/deletePost/:id` | `DELETE /api/v1/posts/:id` |
| `PUT /api/like/:id` | `PUT /api/v1/posts/:id/like` |
| `GET /api/getPostById/:userid` | `GET /api/v1/users/:userId/posts` |
| `GET /api/getFriendsPost/all` | `GET /api/v1/posts/friends` |
| `GET /api/getEvents` | `GET /api/v1/events` |
| `POST /api/addEvent` | `POST /api/v1/events` |
| `POST /api/editEvent` | `PATCH /api/v1/events/:id` |
| `DELETE /api/deleteEvent/:id` | `DELETE /api/v1/events/:id` |
| `PUT /api/participateInEvent/:id` | `PUT /api/v1/events/:id/participation` |
| `GET /api/getUpcommingEvents` | `GET /api/v1/events/upcoming` |
| `GET /api/getEventsByInstitute/:organizerid` | `GET /api/v1/institutes/:organizerId/events` |
| `GET /api/getUsers` | `GET /api/v1/users` |
| `GET /api/searchUserById/:_id` | `GET /api/v1/users/:id` |
| `GET /api/getUsersOfInstitute/:institute` | `GET /api/v1/institutes/:institute/users` |
| `POST /api/searchUser` | `POST /api/v1/users/search` |
| `POST /api/getRandomUsers` | `POST /api/v1/users/random` |
| `PUT /api/follow/:id` | `PUT /api/v1/users/:id/follow` |
| `PUT /api/unfollow/:id` | `PUT /api/v1/users/:id/unfollow` |
| `POST /api/getnotifications` | `GET /api/v1/users/:userid/notifications` |
| `POST /api/addNotification` | `POST /api/v1/notifications` |
| `POST /api/deleteNotification` | `DELETE /api/v1/notifications/:id` |

## Backend Migration Rules

- Keep existing `/api` routes until all frontends move to `/api/v1`.
- Add new routes under `/api/v1` first.
- Prefer resource nouns over action verbs.
- Keep route access rules close to each route.
- Use `asyncHandler` or controller-level error forwarding for new async controllers.
- Do not add new `getSomething`, `addSomething`, or `editSomething` endpoint names.
