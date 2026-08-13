export interface StoreNote {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
}

export const STORE_NOTES: StoreNote[] = [
  {
    id: 'js-closures',
    title: 'Understanding JavaScript Closures',
    category: 'Frontend',
    tags: ['javascript', 'closures', 'scope', 'functions'],
    summary: 'A deep dive into closures — how functions retain access to their lexical scope, practical use cases, and common pitfalls.',
    difficulty: 'Intermediate',
    content: `# Understanding JavaScript Closures

## What is a Closure?

A **closure** is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. Closures are created every time a function is created, at function creation time.

## How Closures Work

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
\`\`\`

The inner function "closes over" the \`count\` variable. Even after \`makeCounter\` returns, the \`count\` variable persists in memory and remains accessible only through the returned function.

## Practical Use Cases

### 1. Data Privacy
Closures enable private variables that cannot be accessed from outside:

\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  return {
    deposit: (amount) => { balance += amount; },
    withdraw: (amount) => { balance -= amount; },
    getBalance: () => balance
  };
}
\`\`\`

### 2. Function Factories
Closures allow you to create configurable functions:

\`\`\`javascript
function multiplier(factor) {
  return (number) => number * factor;
}
const double = multiplier(2);
const triple = multiplier(3);
\`\`\`

### 3. Event Handlers and Callbacks
Closures preserve context in asynchronous operations and event handlers.

## Common Pitfalls

- **Memory leaks**: Closures keep references to outer variables, which can prevent garbage collection
- **Loop variable capture**: Using \`var\` in loops with closures captures the final value; use \`let\` instead
- **Unexpected behavior**: Each closure has its own scope chain

## Key Takeaways

- Closures are functions that remember their lexical scope
- They enable data privacy, function factories, and partial application
- Use \`let\` instead of \`var\` to avoid loop capture issues
- Be mindful of memory implications`,
  },
  {
    id: 'react-hooks',
    title: 'React Hooks Fundamentals',
    category: 'Frontend',
    tags: ['react', 'hooks', 'useeffect', 'usestate'],
    summary: 'Core React hooks explained: useState, useEffect, useRef, useMemo, and useCallback with practical examples.',
    difficulty: 'Intermediate',
    content: `# React Hooks Fundamentals

## What Are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from **function components**. They were introduced in React 16.8.

## useState — Managing State

\`\`\`javascript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
\`\`\`

- Returns a stateful value and a function to update it
- Initial value can be a value or a lazy initializer function
- State updates trigger re-renders

## useEffect — Side Effects

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
  return () => { /* cleanup */ };
}, [count]); // dependency array
\`\`\`

- Runs after every render by default
- With \`[]\`: runs once on mount
- With \`[deps]\`: runs when dependencies change
- Return a cleanup function to avoid memory leaks

## useRef — Mutable References

\`\`\`javascript
const inputRef = useRef(null);
// Access: inputRef.current
\`\`\`

- Persists a mutable value across renders
- Does NOT trigger re-renders when changed
- Common use: accessing DOM elements directly

## useMemo — Expensive Computations

\`\`\`javascript
const sorted = useMemo(() => expensiveSort(data), [data]);
\`\`\`

- Caches the result of a computation
- Only recalculates when dependencies change
- Use for expensive operations, not simple ones

## useCallback — Stable Function References

\`\`\`javascript
const handleClick = useCallback(() => { /* ... */ }, [deps]);
\`\`\`

- Returns a memoized version of a function
- Prevents unnecessary re-renders of child components

## Rules of Hooks

1. **Only call hooks at the top level** — not inside loops, conditions, or nested functions
2. **Only call hooks from React functions** — function components or custom hooks
3. Hook names must start with \`use\`

## Common Patterns

### Custom Hooks
\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
\`\`\`

### Fetching Data
\`\`\`javascript
useEffect(() => {
  let cancelled = false;
  fetchData().then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, []);
\`\`\``,
  },
  {
    id: 'sql-joins',
    title: 'SQL Joins Explained',
    category: 'Database',
    tags: ['sql', 'joins', 'queries', 'relational'],
    summary: 'Visual guide to INNER, LEFT, RIGHT, FULL, and CROSS joins with syntax and examples for combining tables.',
    difficulty: 'Beginner',
    content: `# SQL Joins Explained

## Why Joins?

Joins combine rows from two or more tables based on a logical relationship between them, typically using foreign keys.

## Types of Joins

### INNER JOIN
Returns only rows that have matching values in **both** tables.

\`\`\`sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;
\`\`\`

### LEFT JOIN (LEFT OUTER JOIN)
Returns **all** rows from the left table and matched rows from the right. Unmatched right columns are NULL.

\`\`\`sql
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
\`\`\`

### RIGHT JOIN (RIGHT OUTER JOIN)
Returns **all** rows from the right table and matched rows from the left. Mirror of LEFT JOIN.

\`\`\`sql
SELECT users.name, orders.total
FROM users
RIGHT JOIN orders ON users.id = orders.user_id;
\`\`\`

### FULL JOIN (FULL OUTER JOIN)
Returns all rows from **both** tables. Unmatched columns are NULL.

\`\`\`sql
SELECT users.name, orders.total
FROM users
FULL OUTER JOIN orders ON users.id = orders.user_id;
\`\`\`

### CROSS JOIN
Returns the **Cartesian product** — every row from table A combined with every row from table B.

\`\`\`sql
SELECT colors.name, sizes.name
FROM colors
CROSS JOIN sizes;
\`\`\`

## Multi-Table Joins

\`\`\`sql
SELECT u.name, o.total, p.title
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN products p ON o.product_id = p.id
WHERE o.total > 100;
\`\`\`

## Self Joins

A table can join to itself using aliases:

\`\`\`sql
SELECT e1.name AS employee, e2.name AS manager
FROM employees e1
INNER JOIN employees e2 ON e1.manager_id = e2.id;
\`\`\`

## Tips

- Use table aliases for readability
- Index join columns for performance
- INNER JOIN is the most common and efficient
- NULL handling differs between join types — test edge cases
- Use \`COALESCE\` to replace NULL values in results`,
  },
  {
    id: 'rest-api-design',
    title: 'REST API Design Best Practices',
    category: 'Backend',
    tags: ['api', 'rest', 'http', 'backend'],
    summary: 'Principles of RESTful API design: resource naming, HTTP methods, status codes, pagination, and versioning.',
    difficulty: 'Intermediate',
    content: `# REST API Design Best Practices

## What is REST?

**REST** (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP methods to operate on resources identified by URLs.

## Resource Naming

- Use **nouns**, not verbs: \`/users\` not \`/getUsers\`
- Use **plural**: \`/users\` not \`/user\`
- Use **hierarchy** for relationships: \`/users/123/orders\`
- Use **kebab-case** for multi-word: \`/order-items\`

## HTTP Methods

| Method | Purpose | Safe | Idempotent |
|--------|---------|------|------------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace entire resource | No | Yes |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | No | Yes |

## Status Codes

### 2xx — Success
- \`200 OK\` — Generic success
- \`201 Created\` — Resource created (include Location header)
- \`204 No Content\` — Success with no response body

### 4xx — Client Error
- \`400 Bad Request\` — Malformed input
- \`401 Unauthorized\` — Authentication required
- \`403 Forbidden\` — Authenticated but not allowed
- \`404 Not Found\` — Resource doesn't exist
- \`409 Conflict\` — Duplicate or state conflict
- \`422 Unprocessable Entity\` — Validation error

### 5xx — Server Error
- \`500 Internal Server Error\` — Generic server error
- \`503 Service Unavailable\` — Server overloaded or down

## Pagination

\`\`\`json
{
  "data": [...],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 1500,
    "totalPages": 75
  }
}
\`\`\`

Use \`page\`/\`perPage\` or cursor-based pagination for large datasets.

## Versioning

- URL versioning: \`/api/v1/users\`
- Header versioning: \`Accept: application/vnd.api+json;version=1\`
- URL versioning is more visible and easier to debug

## Error Format

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "message": "Email is required" }]
  }
}
\`\`\`

## Key Takeaways

- Resources are nouns, actions are HTTP methods
- Use correct status codes — they're part of the API contract
- Always paginate list endpoints
- Version your API from day one
- Return consistent error formats`,
  },
  {
    id: 'big-o',
    title: 'Big-O Notation Cheat Sheet',
    category: 'Algorithms',
    tags: ['algorithms', 'complexity', 'big-o', 'performance'],
    summary: 'A reference for time and space complexity of common data structures and algorithms, from O(1) to O(n!).',
    difficulty: 'Beginner',
    content: `# Big-O Notation Cheat Sheet

## What is Big-O?

Big-O describes the **upper bound** of an algorithm's growth rate as input size increases. It tells you how performance scales.

## Common Complexities (Best to Worst)

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array index lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Loop through array |
| O(n log n) | Linearithmic | Merge sort, quicksort (avg) |
| O(n²) | Quadratic | Bubble sort, nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci |
| O(n!) | Factorial | Brute-force permutations |

## Data Structure Operations

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1) | O(1) |
| Hash Table | — | O(1) | O(1) | O(1) |
| Binary Search Tree | O(log n) | O(log n) | O(log n) | O(log n) |
| Sorted Array | O(1) | O(log n) | O(n) | O(n) |

## Sorting Algorithms

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |

## Tips

- **Drop constants**: O(2n) → O(n)
- **Drop lower terms**: O(n² + n) → O(n²)
- **Worst case matters** for guarantees
- **Average case matters** for typical usage
- Space complexity includes recursive call stack
- Hash tables are O(1) average, O(n) worst case (collisions)`,
  },
  {
    id: 'docker-basics',
    title: 'Docker Fundamentals',
    category: 'DevOps',
    tags: ['docker', 'containers', 'devops', 'deployment'],
    summary: 'Core Docker concepts: images, containers, Dockerfile, volumes, and networking for containerized applications.',
    difficulty: 'Beginner',
    content: `# Docker Fundamentals

## What is Docker?

Docker is a platform for **building, shipping, and running** applications in **containers** — lightweight, portable, isolated environments.

## Key Concepts

- **Image**: A read-only template with application code, libraries, and dependencies
- **Container**: A running instance of an image
- **Dockerfile**: A text file with instructions to build an image
- **Volume**: Persistent storage that survives container removal
- **Network**: Communication between containers

## Basic Commands

\`\`\`bash
# Build an image
docker build -t myapp:latest .

# Run a container
docker run -p 3000:3000 myapp:latest

# List running containers
docker ps

# Stop a container
docker stop <container_id>

# Remove a container
docker rm <container_id>

# List images
docker images

# Pull/push images
docker pull nginx:latest
docker push myregistry/myapp:latest
\`\`\`

## Dockerfile Example

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
\`\`\`

## Multi-Stage Builds

\`\`\`dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

Multi-stage builds create smaller final images by copying only what's needed from the build stage.

## Volumes

\`\`\`bash
# Named volume
docker run -v mydata:/data myapp

# Bind mount (host directory)
docker run -v /host/path:/container/path myapp
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - dbdata:/var/lib/postgresql/data

volumes:
  dbdata:
\`\`\`

## Best Practices

- Use **.dockerignore** to exclude unnecessary files
- Order Dockerfile instructions from least to most frequently changing
- Use **alpine** or **slim** base images for smaller size
- Run containers as a **non-root user**
- Use multi-stage builds for production images
- Pin image versions instead of using \`latest\``,
  },
  {
    id: 'git-workflow',
    title: 'Git Workflow and Branching Strategies',
    category: 'DevOps',
    tags: ['git', 'version-control', 'workflow', 'branches'],
    summary: 'Common Git branching models including Git Flow and trunk-based development, with essential commands.',
    difficulty: 'Beginner',
    content: `# Git Workflow and Branching Strategies

## Why Branching Strategy?

A branching strategy defines how teams collaborate on a shared repository. It controls how features, fixes, and releases are integrated.

## Git Flow

The classic branching model with dedicated branches for features, releases, and hotfixes:

- **main** — production-ready code
- **develop** — integration branch for features
- **feature/\*** — individual features, branched from develop
- **release/\*** — release preparation, branched from develop
- **hotfix/\*** — urgent fixes, branched from main

\`\`\`
main ─────●──────────────●────────●
           \\             /       /
develop    ●──●──●──●──●       /
             /     \\           /
feature/a  ●──●──●           /
feature/b     ●──●──●──────●
\`\`\`

## Trunk-Based Development

All developers commit to a single branch (\`main\`). Feature flags control visibility.

- Simpler, faster integration
- Short-lived feature branches (1-2 days)
- Continuous integration is essential
- Best for small, experienced teams

## GitHub Flow

A simplified flow:
1. Create a branch from \`main\`
2. Commit changes
3. Open a pull request
4. Review and discuss
5. Merge to \`main\`
6. Deploy

## Essential Commands

\`\`\`bash
# Create and switch to a new branch
git checkout -b feature/my-feature

# Switch branches
git checkout main

# Merge a branch (fast-forward if possible)
git merge feature/my-feature

# Rebase onto latest main
git rebase main

# Stash changes temporarily
git stash
git stash pop

# View branch graph
git log --oneline --graph --all

# Cherry-pick a specific commit
git cherry-pick <commit-hash>

# Amend the last commit
git commit --amend -m "New message"

# Undo last commit, keep changes
git reset --soft HEAD~1
\`\`\`

## Best Practices

- Write **clear commit messages** (imperative mood: "Add login page")
- Keep branches **short-lived**
- **Rebase** before merging to avoid messy merge commits
- Use **pull requests** for code review
- **Never** commit directly to \`main\` in team projects
- Delete branches after merging
- Use \`.gitignore\` to exclude build artifacts and dependencies`,
  },
  {
    id: 'python-decorators',
    title: 'Python Decorators Deep Dive',
    category: 'Algorithms',
    tags: ['python', 'decorators', 'functions', 'metaprogramming'],
    summary: 'How decorators work in Python, from basic function decorators to parameterized and class-based decorators.',
    difficulty: 'Advanced',
    content: `# Python Decorators Deep Dive

## What is a Decorator?

A decorator is a function that takes another function and **extends or modifies** its behavior without explicitly modifying it. Decorators use the \`@\` syntax.

## Basic Decorator

\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before function call")
        result = func(*args, **kwargs)
        print("After function call")
        return result
    return wrapper

@my_decorator
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("World")
# Output:
# Before function call
# Hello, World!
# After function call
\`\`\`

## Preserving Function Metadata

Use \`functools.wraps\` to preserve the original function's name and docstring:

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

## Practical Examples

### Timing Decorator
\`\`\`python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
\`\`\`

### Retry Decorator
\`\`\`python
def retry(max_attempts=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt+1} failed: {e}")
        return wrapper
    return decorator

@retry(max_attempts=5)
def unreliable_api_call():
    ...
\`\`\`

## Class-Based Decorators

\`\`\`python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} of {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hi():
    print("Hi!")
\`\`\`

## Stacking Decorators

Decorators apply **bottom-up**:

\`\`\`python
@decorator_a
@decorator_b
def func():
    pass
# Equivalent to: func = decorator_a(decorator_b(func))
\`\`\`

## Key Takeaways

- Decorators are functions that wrap other functions
- Always use \`@wraps\` to preserve metadata
- Parameterized decorators require an extra nesting level
- Class-based decorators use \`__call__\`
- Built-in decorators: \`@staticmethod\`, \`@classmethod\`, \`@property\``,
  },
  {
    id: 'css-flexbox',
    title: 'CSS Flexbox Complete Guide',
    category: 'Frontend',
    tags: ['css', 'flexbox', 'layout', 'frontend'],
    summary: 'Master CSS Flexbox: container and item properties, alignment, wrapping, and practical layout patterns.',
    difficulty: 'Beginner',
    content: `# CSS Flexbox Complete Guide

## What is Flexbox?

Flexbox (Flexible Box Layout) is a one-dimensional layout model for arranging items in rows or columns with dynamic sizing.

## Container Properties

### display: flex
\`\`\`css
.container {
  display: flex;
  /* or display: inline-flex; */
}
\`\`\`

### flex-direction
\`\`\`css
.container { flex-direction: row | row-reverse | column | column-reverse; }
\`\`\`

### justify-content (main axis)
\`\`\`css
.container { justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly; }
\`\`\`

### align-items (cross axis)
\`\`\`css
.container { align-items: stretch | flex-start | flex-end | center | baseline; }
\`\`\`

### flex-wrap
\`\`\`css
.container { flex-wrap: nowrap | wrap | wrap-reverse; }
\`\`\`

### gap
\`\`\`css
.container { gap: 16px; /* or row-gap / column-gap */ }
\`\`\`

## Item Properties

### flex (shorthand)
\`\`\`css
.item { flex: 1; } /* flex-grow: 1, flex-shrink: 1, flex-basis: 0% */
.item { flex: 0 1 auto; } /* default */
.item { flex: none; } /* flex: 0 0 auto */
\`\`\`

### align-self
Override container's \`align-items\` for one item:
\`\`\`css
.item { align-self: flex-start | flex-end | center | stretch; }
\`\`\`

### order
\`\`\`css
.item { order: 2; } /* default: 0, lower comes first */
\`\`\`

## Common Patterns

### Center Everything
\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
\`\`\`

### Sticky Footer
\`\`\`css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; }
\`\`\`

### Equal-Width Columns
\`\`\`css
.row { display: flex; gap: 16px; }
.col { flex: 1; }
\`\`\`

### Holy Grail Layout
\`\`\`css
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar { flex: 0 0 250px; }
.main { flex: 1; }
\`\`\`

## Key Takeaways

- Flexbox is **one-dimensional** (row OR column)
- \`justify-content\` controls main axis, \`align-items\` controls cross axis
- \`flex: 1\` makes items grow to fill available space equally
- Use \`gap\` instead of margins for spacing between items
- For two-dimensional layouts, consider CSS Grid`,
  },
  {
    id: 'auth-jwt',
    title: 'JWT Authentication Explained',
    category: 'Security',
    tags: ['security', 'jwt', 'authentication', 'tokens'],
    summary: 'How JSON Web Tokens work: structure, signing, verification, and security considerations for auth flows.',
    difficulty: 'Intermediate',
    content: `# JWT Authentication Explained

## What is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe token format used for stateless authentication. It encodes claims (user identity, roles, expiration) as a signed JSON payload.

## JWT Structure

A JWT has three parts separated by dots: \`header.payload.signature\`

### Header
\`\`\`json
{ "alg": "HS256", "typ": "JWT" }
\`\`\`

### Payload (Claims)
\`\`\`json
{
  "sub": "user123",
  "email": "user@example.com",
  "role": "admin",
  "exp": 1735689600,
  "iat": 1704067200
}
\`\`\`

### Signature
\`\`\`
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
\`\`\`

## Authentication Flow

1. User logs in with credentials
2. Server **verifies** credentials and **creates** a JWT
3. Server sends JWT to client
4. Client stores JWT (httpOnly cookie or memory)
5. Client sends JWT in \`Authorization: Bearer <token>\` header
6. Server **verifies** signature and extracts claims

## Security Considerations

### DO
- **Always use HTTPS** — tokens are visible in transit otherwise
- Store tokens in **httpOnly cookies** (prevents XSS access)
- Use **short expiration times** (15-60 minutes)
- Implement **refresh tokens** for long sessions
- **Verify the signature** on every request
- Validate \`exp\`, \`iat\`, and \`aud\` claims

### DON'T
- Don't store tokens in \`localStorage\` (vulnerable to XSS)
- Don't put sensitive data in the payload (it's base64, not encrypted)
- Don't use \`none\` algorithm
- Don't ignore expiration checks

## Refresh Token Pattern

\`\`\`
Access Token (15 min) ──► Used for API requests
         │ expires
         ▼
Refresh Token (7 days) ──► Used to get new access token
         │ used once
         ▼
    New access token + new refresh token (rotation)
\`\`\`

## Common Claims

| Claim | Meaning |
|-------|---------|
| \`iss\` | Issuer — who created the token |
| \`sub\` | Subject — user ID |
| \`aud\` | Audience — intended recipient |
| \`exp\` | Expiration time |
| \`iat\` | Issued at time |
| \`nbf\` | Not before — valid from this time |
| \`jti\` | JWT ID — unique token identifier |

## Key Takeaways

- JWTs are **signed**, not **encrypted** — anyone can read the payload
- The signature guarantees **integrity**, not confidentiality
- Stateless auth means the server doesn't need to look up sessions
- Short-lived access tokens + long-lived refresh tokens is the standard pattern
- Always verify the signature and check expiration server-side`,
  },
  {
    id: 'system-design-scaling',
    title: 'System Design: Scaling from Zero to Million Users',
    category: 'Systems',
    tags: ['system-design', 'scaling', 'architecture', 'performance'],
    summary: 'Progressive scaling strategies: load balancers, caching, database sharding, CDNs, and microservices.',
    difficulty: 'Advanced',
    content: `# System Design: Scaling from Zero to Million Users

## The Scaling Journey

No system starts at scale. The key is evolving architecture incrementally as load grows.

## Stage 1: Single Server (~1K users)

\`\`\`
User ──► Web Server (app + database)
\`\`\`

- One server handles everything
- Vertical scaling: add more CPU/RAM
- Sufficient for small apps and MVPs

## Stage 2: Database Separation (~10K users)

\`\`\`
User ──► Web Server ──► Database Server
\`\`\`

- Separate app server from database
- Each can scale independently
- Use connection pooling

## Stage 3: Load Balancer + Multiple Servers (~100K users)

\`\`\`                  
         ┌─► Web Server 1
User ──► LB ─┼─► Web Server 2 ──► Database
         └─► Web Server 3
\`\`\`

- **Load balancer** distributes traffic across multiple servers
- Horizontal scaling: add more servers
- Enables zero-downtime deployments
- Sessions must be stateless or shared (Redis)

## Stage 4: Caching Layer (~500K users)

\`\`\`
                    ┌─► Cache (Redis) ◄──┐
User ──► LB ──► Web ─┤                    ├─► Database
                    └────────────────────┘
\`\`\`

- **Cache** hot data in Redis/Memcached
- Reduces database load dramatically
- Cache-aside pattern: check cache, fall back to DB, populate cache
- Set TTLs to avoid stale data

## Stage 5: CDN + Read Replicas (~1M users)

\`\`\`
                ┌─► CDN (static assets)
User ──► LB ──► Web ──► Cache ──► ┌─► Read Replica 1 ─┐
                                  ├─► Read Replica 2 ─┤──► Primary DB
                                  └─► Read Replica 3 ─┘
\`\`\`

- **CDN** serves static content from edge locations globally
- **Read replicas** handle read-heavy workloads
- Primary DB handles writes, replicates to read replicas
- Use eventual consistency for reads

## Stage 6: Sharding + Microservices (~10M users)

- **Database sharding**: partition data across multiple databases by key
- **Microservices**: split monolith into independent services
- **Message queues**: async processing (Kafka, RabbitMQ)
- **API gateway**: single entry point, routing, rate limiting

## Key Scaling Techniques

### Caching Strategies
- **Cache-aside**: App manages cache explicitly
- **Write-through**: Write to cache and DB simultaneously
- **Write-behind**: Write to cache, async to DB (risk of data loss)

### Database Scaling
- **Vertical**: bigger machine (limited)
- **Read replicas**: copy reads to replicas
- **Sharding**: partition by user ID, region, or hash
- **Denormalization**: trade consistency for read speed

### Asynchronous Processing
- Message queues decouple producers from consumers
- Enables retry, dead-letter queues, and backpressure
- Improves perceived performance for users

## Key Metrics to Monitor

- **Latency**: p50, p95, p99 response times
- **Throughput**: requests per second
- **Error rate**: failed requests percentage
- **Saturation**: CPU, memory, disk, network utilization

## Key Takeaways

- Scale incrementally — don't over-engineer early
- Stateless servers enable horizontal scaling
- Caching provides the biggest performance win
- Database is usually the bottleneck — protect it
- Monitor everything — you can't optimize what you can't measure`,
  },
  {
    id: 'ts-generics',
    title: 'TypeScript Generics Mastery',
    category: 'Frontend',
    tags: ['typescript', 'generics', 'types', 'type-safety'],
    summary: 'Understanding TypeScript generics: type parameters, constraints, conditional types, and real-world patterns.',
    difficulty: 'Advanced',
    content: `# TypeScript Generics Mastery

## What Are Generics?

Generics allow you to write **reusable** code that works with multiple types while maintaining full **type safety**. They are type variables that are filled in at the call site.

## Basic Generics

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);      // T = number
const str = identity("hello");         // T = string (inferred)
\`\`\`

## Generic Functions

\`\`\`typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);        // number
const s = first(["a", "b"]);       // string
\`\`\`

## Generic Interfaces and Types

\`\`\`typescript
interface Box<T> {
  value: T;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
\`\`\`

## Generic Classes

\`\`\`typescript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}

const numberStack = new Stack<number>();
numberStack.push(42);
\`\`\`

## Constraints (extends)

Restrict what types a generic can accept:

\`\`\`typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");    // OK
getLength([1, 2, 3]);  // OK
getLength(123);        // Error: number doesn't have length
\`\`\`

## Using keyof with Generics

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
const name = getProperty(user, "name");  // string
const age = getProperty(user, "age");    // number
\`\`\`

## Conditional Types

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;   // true
type B = IsString<number>;   // false

// Extract return type of a function
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`

## Utility Type Patterns

\`\`\`typescript
// Deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Pick by value type
type PickByValue<T, V> = Pick<T, {
  [K in keyof T]: T[K] extends V ? K : never
}[keyof T]>;
\`\`\`

## Real-World Example: Type-Safe API Client

\`\`\`typescript
interface Endpoints {
  '/users': { response: User[]; body: void };
  '/users/:id': { response: User; body: { id: string } };
  '/posts': { response: Post[]; body: { title: string } };
}

function api<K extends keyof Endpoints>(
  endpoint: K,
  body: Endpoints[K]['body']
): Promise<Endpoints[K]['response']> {
  // implementation
}
\`\`\`

## Key Takeaways

- Generics are **type variables** — resolved at the call site
- Use \`extends\` to constrain what types are allowed
- \`keyof\` + generics enables type-safe property access
- Conditional types (\`T extends X ? A : B\`) enable type-level logic
- \`infer\` extracts types from function signatures
- Generics are erased at runtime — purely a compile-time feature`,
  },
  {
    id: 'lang-python',
    title: 'Python Language Essentials',
    category: 'Languages',
    tags: ['python', 'syntax', 'data-structures', 'beginner'],
    summary: 'A complete tour of Python: variables, data structures, functions, classes, decorators, and idiomatic patterns.',
    difficulty: 'Beginner',
    content: `# Python Language Essentials

## Variables and Types

Python is dynamically typed. Variables are created on assignment and types are inferred.

\`\`\`python
name = "Ada"        # str
age = 36            # int
height = 1.75       # float
is_engineer = True  # bool
\`\`\`

Use \`type()\` to inspect a value's type and \`isinstance()\` to check it safely.

## Core Data Structures

### Lists — ordered, mutable
\`\`\`python
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits[0] = "apricot"
\`\`\`

### Tuples — ordered, immutable
\`\`\`python
point = (3, 4)
x, y = point  # unpacking
\`\`\`

### Dictionaries — key/value pairs
\`\`\`python
person = {"name": "Ada", "age": 36}
person["email"] = "ada@example.com"
for key, value in person.items():
    print(key, value)
\`\`\`

### Sets — unordered, unique elements
\`\`\`python
tags = {"python", "web", "data"}
tags.add("ai")
tags.discard("web")  # no error if missing
\`\`\`

## Control Flow

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

for item in collection:
    process(item)

while running:
    update()
\`\`\`

## Functions

\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Ada")              # "Hello, Ada!"
greet("Ada", "Hi")       # "Hi, Ada!"
\`\`\`

### Lambda expressions
Anonymous one-expression functions:

\`\`\`python
square = lambda x: x ** 2
nums = list(map(lambda n: n * 2, [1, 2, 3]))
\`\`\`

### List comprehensions
\`\`\`python
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

## Classes and OOP

\`\`\`python
class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name} says woof!"

rex = Dog("Rex")
print(rex.bark())
\`\`\`

### Inheritance
\`\`\`python
class Puppy(Dog):
    def bark(self):
        return f"{self.name} says yip!"
\`\`\`

## Decorators

Decorators wrap a function to add behavior without modifying it:

\`\`\`python
def log(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@log
def save(data):
    print("saved")
\`\`\`

## Idiomatic Python

- Use \`with\` for resource management: \`with open("file.txt") as f: ...\`
- Prefer comprehensions over manual loops
- Use \`enumerate()\` to get index + value: \`for i, x in enumerate(items)\`
- Use \`zip()\` to iterate multiple sequences in parallel
- String formatting: prefer f-strings (\`f"{name}"\`) over \`.format()\`

## Key Takeaways

- Python is dynamically typed and emphasizes readability
- Master lists, dicts, tuples, and sets — they cover most needs
- Comprehensions and f-strings are idiomatic and concise
- Decorators and classes enable clean, reusable code
- The Zen of Python (\`import this\`) captures the language philosophy`,
  },
  {
    id: 'lang-javascript',
    title: 'JavaScript Language Deep Dive',
    category: 'Languages',
    tags: ['javascript', 'types', 'async', 'es6'],
    summary: 'JavaScript fundamentals and beyond: types, scope, prototypes, async patterns, modules, and gotchas.',
    difficulty: 'Intermediate',
    content: `# JavaScript Language Deep Dive

## Types and Coercion

JavaScript has 8 types: \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`object\`, \`symbol\`, and \`bigint\`.

\`\`\`javascript
typeof "hi"      // "string"
typeof 42        // "number"
typeof null      // "object"  ← known bug
typeof undefined // "undefined"
typeof {}        // "object"
typeof []        // "object"  ← use Array.isArray()
\`\`\`

### Strict vs loose equality
\`\`\`javascript
0 == false      // true  (loose, with coercion)
0 === false     // false (strict, no coercion)
"42" == 42      // true
"42" === 42     // false
\`\`\`

Always prefer \`===\` unless you intentionally want coercion.

## Scope: var, let, const

| Keyword | Scope | Reassign | Hoisted |
|---------|-------|----------|---------|
| var | function | yes | yes (undefined) |
| let | block | yes | no (TDZ) |
| const | block | no | no (TDZ) |

\`\`\`javascript
{
  var x = 1;   // escapes the block
  let y = 2;   // block-scoped
  const z = 3; // block-scoped, constant binding
}
console.log(x); // 1
console.log(y); // ReferenceError
\`\`\`

## Functions and Arrow Functions

\`\`\`javascript
// Regular function — has its own \`this\`
function greet(name) { return "Hello " + name; }

// Arrow function — inherits \`this\` from enclosing scope
const greet = (name) => \`Hello \${name}\`;
\`\`\`

Arrow functions are not just shorthand: they do **not** bind their own \`this\`, \`arguments\`, \`super\`, or \`new.target\`.

## Prototypes and Classes

\`\`\`javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks\`; }
}
\`\`\`

Under the hood, classes are syntactic sugar over JavaScript's prototype chain. \`Object.create()\` and direct \`prototype\` assignment still work.

## Asynchronous JavaScript

### Callbacks
\`\`\`javascript
setTimeout(() => console.log("later"), 1000);
\`\`\`

### Promises
\`\`\`javascript
fetch("/api/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

### async/await
\`\`\`javascript
async function loadData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
\`\`\`

\`async\` functions always return a Promise. \`await\` pauses until it settles.

### Promise combinators
- \`Promise.all\` — all succeed or first rejection
- \`Promise.allSettled\` — all complete, never rejects
- \`Promise.race\` — first to settle wins
- \`Promise.any\` — first fulfillment wins

## Modules

\`\`\`javascript
// math.js
export const add = (a, b) => a + b;
export default function multiply(a, b) { return a * b; }

// main.js
import multiply, { add } from "./math.js";
\`\`\`

ES modules are static (imports hoisted, analyzed at load time). Use \`import()\` for dynamic imports.

## Arrays and Iteration

\`\`\`javascript
[1, 2, 3].map(x => x * 2)     // [2, 4, 6]
[1, 2, 3].filter(x => x > 1)  // [2, 3]
[1, 2, 3].reduce((a, b) => a + b, 0) // 6
[1, 2, 3].find(x => x > 1)    // 2
[1, 2, 3].some(x => x > 2)    // true
[1, 2, 3].every(x => x > 0)   // true
\`\`\`

\`map\`/\`filter\`/\`reduce\` return new arrays — they do not mutate the original.

## Common Gotchas

- **\`this\` binding**: regular functions get \`this\` from the call site; arrows inherit it
- **Event loop**: microtasks (Promises) run before macrotasks (setTimeout)
- **\`==\` vs \`===\`**: coercion causes surprising results — use strict equality
- **Mutating shared arrays/objects**: use spread/\`Object.assign\` for copies
- **\`0\`, \`""\`, \`null\`, \`NaN\`, \`undefined\` are falsy**: \`[]\` and \`{}\` are truthy

## Key Takeaways

- Use \`let\`/\`const\`, never \`var\` in modern code
- Prefer \`===\` and explicit type checks
- Arrow functions inherit \`this\`; regular functions bind it
- \`async/await\` is the cleanest way to write async code
- ES modules are the standard — use \`import\`/\`export\``,
  },
  {
    id: 'lang-java',
    title: 'Java Language Foundations',
    category: 'Languages',
    tags: ['java', 'oop', 'jvm', 'collections'],
    summary: 'Java from the ground up: syntax, OOP, generics, collections, exceptions, and the JVM model.',
    difficulty: 'Intermediate',
    content: `# Java Language Foundations

## Basic Syntax

\`\`\`java
public class Main {
    public static void main(String[] args) {
        String name = "Ada";
        int age = 36;
        System.out.println("Hello, " + name + "!");
    }
}
\`\`\`

Java is statically typed: every variable has a type known at compile time. Statements end with semicolons. Code lives in classes.

## Primitive Types

| Type | Size | Default |
|------|------|---------|
| byte | 8-bit | 0 |
| short | 16-bit | 0 |
| int | 32-bit | 0 |
| long | 64-bit | 0L |
| float | 32-bit | 0.0f |
| double | 64-bit | 0.0d |
| char | 16-bit | '\\u0000' |
| boolean | 1-bit | false |

Everything else is a reference type (objects).

## Classes and Objects

\`\`\`java
public class Car {
    private String model;
    private int year;

    public Car(String model, int year) {
        this.model = model;
        this.year = year;
    }

    public String getModel() { return model; }
    public int getYear() { return year; }
}

Car myCar = new Car("Civic", 2024);
System.out.println(myCar.getModel());
\`\`\`

## The Four Pillars of OOP

### Encapsulation
Bundle data and methods; control access with \`private\`/\`public\`:
\`\`\`java
private double balance;
public void deposit(double amount) { balance += amount; }
\`\`\`

### Inheritance
\`\`\`java
public class ElectricCar extends Car {
    private double batteryKwh;
    public ElectricCar(String model, int year, double batteryKwh) {
        super(model, year);
        this.batteryKwh = batteryKwh;
    }
}
\`\`\`

### Polymorphism
\`\`\`java
Car car = new ElectricCar("Model 3", 2024, 75.0);
car.getModel(); // calls Car's version unless overridden
\`\`\`

### Abstraction
Use \`abstract class\` or \`interface\` to define contracts:
\`\`\`java
public interface Drivable {
    void start();
    void stop();
}

public class Truck implements Drivable {
    public void start() { /* ... */ }
    public void stop() { /* ... */ }
}
\`\`\`

## Generics

\`\`\`java
List<String> names = new ArrayList<>();
names.add("Ada");
String first = names.get(0); // no cast needed
\`\`\`

Generics provide compile-time type safety and eliminate casts. They are erased at runtime (type erasure).

### Generic methods
\`\`\`java
public static <T> T firstOrNull(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}
\`\`\`

## Collections Framework

| Interface | Implementations | Characteristics |
|-----------|----------------|----------------|
| List | ArrayList, LinkedList | Ordered, allows duplicates |
| Set | HashSet, TreeSet | No duplicates |
| Map | HashMap, TreeMap | Key/value pairs |
| Queue | PriorityQueue, LinkedList | FIFO / priority order |

\`\`\`java
List<Integer> nums = new ArrayList<>(List.of(3, 1, 2));
Collections.sort(nums);
Set<String> unique = new HashSet<>(List.of("a", "a", "b"));
Map<String, Integer> ages = new HashMap<>();
ages.put("Ada", 36);
\`\`\`

## Exception Handling

\`\`\`java
try {
    riskyOperation();
} catch (IOException e) {
    System.err.println("I/O failed: " + e.getMessage());
} finally {
    cleanup();
}
\`\`\`

- **Checked exceptions** (e.g., \`IOException\`) must be caught or declared
- **Unchecked exceptions** (e.g., \`NullPointerException\`) extend \`RuntimeException\`
- \`try-with-resources\` auto-closes \`AutoCloseable\` resources:
\`\`\`java
try (BufferedReader br = new BufferedReader(new FileReader("f.txt"))) {
    String line = br.readLine();
}
\`\`\`

## Streams and Lambdas (Java 8+)

\`\`\`java
List<String> names = List.of("Ada", "Bo", "Cy");

names.stream()
     .filter(n -> n.length() > 1)
     .map(String::toUpperCase)
     .forEach(System.out::println);
\`\`\`

## The JVM

- Source \`.java\` → compiled \`.class\` bytecode → executed by the JVM
- "Write once, run anywhere" — the JVM abstracts the OS
- **Garbage collection** automatically frees unreachable objects
- Runtime: heap (objects), stack (method frames), metaspace (class metadata)

## Key Takeaways

- Java is statically typed and strictly object-oriented
- Master the collections framework and generics — they're used everywhere
- Prefer interfaces over concrete types for flexibility
- \`try-with-resources\` and streams make code cleaner and safer
- The JVM handles memory so you don't manage it manually`,
  },
  {
    id: 'lang-cpp',
    title: 'C++ Language Core Concepts',
    category: 'Languages',
    tags: ['cpp', 'pointers', 'memory', 'stl'],
    summary: 'C++ essentials: memory model, pointers vs references, RAII, templates, and the standard library.',
    difficulty: 'Advanced',
    content: `# C++ Language Core Concepts

## Compilation and Memory Model

C++ compiles to native machine code. Memory is divided into:
- **Stack**: local variables, automatic lifetime, LIFO
- **Heap**: dynamic allocations via \`new\`/\`delete\`, manual lifetime
- **Static/global**: program-lifetime storage
- **Const**: read-only data

\`\`\`cpp
int x = 10;            // stack
int* p = new int(20);  // heap
delete p;              // must free manually
\`\`\`

## Pointers and References

### Pointers
A pointer stores a memory address. Dereference with \`*\`, take address with \`&\`.

\`\`\`cpp
int value = 42;
int* ptr = &value;
std::cout << *ptr;  // 42
*ptr = 100;          // value is now 100
\`\`\`

### References
A reference is an alias — it must be initialized and cannot be reseated.

\`\`\`cpp
int a = 5;
int& ref = a;
ref = 10;  // a is now 10
\`\`\`

| Feature | Pointer | Reference |
|---------|---------|-----------|
| Can be null | yes | no |
| Can be reseated | yes | no |
| Must initialize | no | yes |
| Arithmetic | yes | no |

Prefer references for function parameters unless nullability or reseating is needed.

## RAII — Resource Acquisition Is Initialization

Resources (memory, files, locks) are tied to object lifetime. Constructors acquire; destructors release.

\`\`\`cpp
{
    std::ifstream file("data.txt");  // opens on construction
    // ... use file
}  // closes automatically when scope ends
\`\`\`

This is the core C++ idiom. It makes exception-safe resource management automatic.

## Smart Pointers

Modern C++ replaces raw \`new\`/\`delete\` with smart pointers from \`<memory>\`:

\`\`\`cpp
#include <memory>

std::unique_ptr<int> u = std::make_unique<int>(42);   // sole owner
std::shared_ptr<int> s = std::make_shared<int>(42);   // reference-counted
std::weak_ptr<int> w = s;                             // non-owning observer
\`\`\`

| Pointer | Ownership | When to use |
|---------|-----------|-------------|
| unique_ptr | exclusive | default choice for owned heap objects |
| shared_ptr | shared | multiple owners, ref-counted |
| weak_ptr | none | break shared_ptr cycles |

## Classes

\`\`\`cpp
class Vector {
public:
    Vector(double x, double y) : x_(x), y_(y) {}
    double magnitude() const { return std::sqrt(x_*x_ + y_*y_); }
private:
    double x_, y_;
};
\`\`\`

- Default access in \`class\` is \`private\`; in \`struct\` it's \`public\`
- Use **initializer lists** to construct members efficiently
- \`const\` member functions promise not to modify state
- The **Rule of Five**: if you define destructor, copy constructor, copy assignment, move constructor, or move assignment, define all five

## Templates

\`\`\`cpp
template <typename T>
T maximum(T a, T b) {
    return a > b ? a : b;
}

maximum(3, 7);        // int
maximum(3.14, 2.71);  // double
\`\`\`

Templates enable generic, type-safe code. The compiler generates a specialization for each type used.

## The Standard Library (STL)

### Containers
\`\`\`cpp
std::vector<int> v = {1, 2, 3};
v.push_back(4);

std::map<std::string, int> m;
m["one"] = 1;

std::unordered_set<int> s = {1, 2, 3};
\`\`\`

### Algorithms
\`\`\`cpp
#include <algorithm>

std::sort(v.begin(), v.end());
auto it = std::find(v.begin(), v.end(), 2);
int count = std::count_if(v.begin(), v.end(), [](int x){ return x > 1; });
\`\`\`

### Iterators
\`\`\`cpp
for (auto it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << " ";
}
// Range-based for (preferred)
for (int x : v) std::cout << x << " ";
\`\`\`

## Modern C++ (C++11 and later)

- **auto** for type deduction: \`auto x = 42;\`
- **Range-based for**: \`for (int x : v)\`
- **Lambda expressions**: \`auto sq = [](int x){ return x*x; };\`
- **constexpr**: compile-time computations
- **std::optional**, **std::variant** for safer value modeling
- **Move semantics** and rvalue references (\`&&\`) to avoid expensive copies

## Key Takeaways

- RAII is the foundation of safe C++ — tie resources to object lifetime
- Use smart pointers instead of raw \`new\`/\`delete\`
- Prefer references over pointers when null isn't needed
- Templates and the STL give you generic, efficient, reusable code
- Modern C++ (auto, lambdas, move semantics) is safer and more expressive than C++98`,
  },
  {
    id: 'lang-go',
    title: 'Go Language Practical Guide',
    category: 'Languages',
    tags: ['go', 'golang', 'concurrency', 'backend'],
    summary: 'Go fundamentals: goroutines, channels, structs, interfaces, error handling, and idiomatic patterns.',
    difficulty: 'Intermediate',
    content: `# Go Language Practical Guide

## Hello World

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
\`\`\`

Go is statically typed, compiled, and has garbage collection. It emphasizes simplicity and fast compilation.

## Variables and Types

\`\`\`go
var name string = "Ada"   // explicit type
age := 36                 // short declaration, type inferred
const Pi = 3.14159
\`\`\`

Common types: \`int\`, \`float64\`, \`string\`, \`bool\`, \`[]T\` (slice), \`map[K]V\`, \`struct\`.

## Functions

\`\`\`go
func add(a int, b int) int {
    return a + b
}

// Multiple return values
func divmod(a, b int) (int, int) {
    return a / b, a % b
}

q, r := divmod(17, 5)
\`\`\`

Multiple return values are idiomatic in Go, especially for returning errors.

## Error Handling

Go does not use exceptions. Functions return errors as a second value:

\`\`\`go
import "os"

file, err := os.Open("data.txt")
if err != nil {
    log.Fatal(err)
}
defer file.Close()
\`\`\`

- Always check \`err != nil\` immediately
- \`defer\` runs when the function returns — perfect for cleanup
- Create errors with \`errors.New()\` or \`fmt.Errorf()\`

## Structs

\`\`\`go
type Person struct {
    Name string
    Age  int
}

p := Person{Name: "Ada", Age: 36}
fmt.Println(p.Name)
\`\`\`

### Methods
\`\`\`go
func (p Person) Greet() string {
    return "Hi, I'm " + p.Name
}

// Pointer receiver can modify the struct
func (p *Person) HaveBirthday() {
    p.Age++
}
\`\`\`

## Interfaces

Interfaces are satisfied implicitly — no \`implements\` keyword:

\`\`\`go
type Speaker interface {
    Speak() string
}

func (p Person) Speak() string {
    return "Hello from " + p.Name
}

func announce(s Speaker) {
    fmt.Println(s.Speak())
}
\`\`\`

A type implements an interface by having all the required methods. This enables duck typing with compile-time safety.

## Slices and Maps

### Slices (dynamic arrays)
\`\`\`go
nums := []int{1, 2, 3}
nums = append(nums, 4)
for i, v := range nums {
    fmt.Println(i, v)
}
\`\`\`

### Maps
\`\`\`go
ages := map[string]int{"Ada": 36}
ages["Bo"] = 28
delete(ages, "Bo")
value, ok := ages["Ada"]  // ok is false if key missing
\`\`\`

## Concurrency

### Goroutines
Lightweight threads managed by the Go runtime:

\`\`\`go
go func() {
    fmt.Println("running in background")
}()
\`\`\`

### Channels
Typed conduits for goroutine communication:

\`\`\`go
ch := make(chan int, 1)  // buffered

go func() {
    ch <- 42   // send
}()

value := <-ch  // receive
\`\`\`

### select
\`\`\`go
select {
case msg := <-ch1:
    fmt.Println("ch1:", msg)
case msg := <-ch2:
    fmt.Println("ch2:", msg)
default:
    fmt.Println("no message")
}
\`\`\`

Go's motto: **"Do not communicate by sharing memory; instead, share memory by communicating."**

## Packages and Modules

- Every file starts with \`package <name>\`
- Exported identifiers start with a capital letter
- Use \`go mod init\` and \`go mod tidy\` to manage dependencies
- \`import\` standard library and third-party modules

## Idiomatic Go

- Run \`gofmt\` — formatting is standardized, not debated
- \`go vet\` catches common mistakes
- Prefer composition over inheritance
- Return early to reduce nesting
- Use the blank identifier \`_\` to ignore values: \`_, err := something()\`
- Tables tests are the standard testing pattern

## Key Takeaways

- Go is simple, fast-compiling, and statically typed
- Errors are values, not exceptions — check them explicitly
- Interfaces are implicit — implement methods, you're done
- Goroutines + channels make concurrency approachable
- \`defer\` handles cleanup; format with \`gofmt\``,
  },
  {
    id: 'lang-rust',
    title: 'Rust Language Fundamentals',
    category: 'Languages',
    tags: ['rust', 'ownership', 'borrowing', 'memory-safety'],
    summary: 'Rust from scratch: ownership, borrowing, lifetimes, traits, and the zero-cost safety model.',
    difficulty: 'Advanced',
    content: `# Rust Language Fundamentals

## Why Rust?

Rust provides **memory safety without a garbage collector**. The compiler enforces rules at compile time that prevent null pointer dereferences, data races, and use-after-free bugs — with zero runtime cost.

## Hello World

\`\`\`rust
fn main() {
    println!("Hello, Rust!");
}
\`\`\`

Rust is statically typed. Type annotations are often optional due to inference.

## Ownership

Ownership is Rust's core concept. Three rules:

1. Each value has a single **owner**
2. When the owner goes out of scope, the value is dropped
3. Assigning or passing a value **moves** ownership

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1;        // ownership moved to s2
// println!("{}", s1); // ERROR: s1 no longer valid
\`\`\`

For types that implement \`Copy\` (ints, bools, chars, etc.), values are copied instead of moved.

## Borrowing and References

Instead of moving ownership, borrow with references:

\`\`\`rust
fn print_len(s: &String) {  // borrows s immutably
    println!("{}", s.len());
}

let s = String::from("hello");
print_len(&s);              // pass a reference
println!("{}", s);          // s is still valid
\`\`\`

### Rules
- Any number of **immutable borrows** (\`&T\`) OR exactly one **mutable borrow** (\`&mut T\`) — not both
- References must always point to valid data (no dangling pointers)

\`\`\`rust
let mut s = String::from("hi");
{
    let r = &mut s;
    r.push_str("!");
}  // mutable borrow ends here
let r2 = &s;  // now OK to borrow immutably
\`\`\`

## Lifetimes

Lifetimes ensure references don't outlive the data they point to. The compiler usually infers them, but function signatures sometimes need explicit annotations:

\`\`\`rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
\`\`\`

\`<'a>\` says the returned reference lives at least as long as both inputs. Lifetimes are compile-time annotations — no runtime cost.

## Structs and Enums

### Structs
\`\`\`rust
struct User {
    name: String,
    age: u32,
}

let u = User { name: String::from("Ada"), age: 36 };
\`\`\`

### Enums (algebraic data types)
\`\`\`rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

let m = Message::Write(String::from("hi"));
\`\`\`

Enums can carry data — they're far more powerful than C-style enums.

### Pattern matching
\`\`\`rust
match m {
    Message::Quit => println!("bye"),
    Message::Move { x, y } => println!("move to {},{}", x, y),
    Message::Write(text) => println!("write {}", text),
}
\`\`\`

\`match\` is exhaustive — you must handle all variants.

## Traits

Traits are like interfaces but more powerful. They define shared behavior:

\`\`\`rust
trait Greet {
    fn greet(&self) -> String;
}

struct Dog;
impl Greet for Dog {
    fn greet(&self) -> String {
        String::from("Woof!")
    }
}
\`\`\`

Traits enable **trait bounds** for generics:

\`\`\`rust
fn print_greeting<T: Greet>(item: &T) {
    println!("{}", item.greet());
}
\`\`\`

## Error Handling

Rust uses \`Result<T, E>\` for recoverable errors and \`Option<T>\` for nullable values — no nulls and no exceptions.

\`\`\`rust
fn parse(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse::<i32>()
}

match parse("42") {
    Ok(n) => println!("got {}", n),
    Err(e) => println!("error: {}", e),
}
\`\`\`

- \`?\` propagates errors concisely: \`let n: i32 = parse(s)?;\`
- \`Option\` replaces null: \`enum Option<T> { Some(T), None }\`

## Collections

\`\`\`rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);

let mut m = std::collections::HashMap::new();
m.insert("a", 1);

let s: String = String::from("hello");
\`\`\`

## Cargo and Modules

- \`cargo new\` — scaffold a project
- \`cargo build\` / \`cargo run\` — compile and run
- \`cargo test\` — run tests
- \`cargo fmt\` and \`cargo clippy\` — formatting and linting
- Modules: \`mod foo;\` declares a module; \`pub\` makes items visible

## Key Takeaways

- Ownership + borrowing = memory safety without a GC
- You can have many \`&\` references OR one \`&mut\` — never both
- \`Result\` and \`Option\` replace exceptions and nulls
- Enums with pattern matching are incredibly expressive
- Traits provide shared behavior and generic constraints
- The compiler is strict, but if it compiles, it rarely crashes`,
  },
  {
    id: 'lang-typescript',
    title: 'TypeScript Language Guide',
    category: 'Languages',
    tags: ['typescript', 'types', 'generics', 'narrowing'],
    summary: 'TypeScript from basic types to advanced patterns: unions, generics, utility types, and type narrowing.',
    difficulty: 'Intermediate',
    content: `# TypeScript Language Guide

## Why TypeScript?

TypeScript adds static types to JavaScript. It catches errors at compile time, enables better IDE support, and makes refactoring safer. It compiles to plain JavaScript — types are erased at runtime.

## Basic Types

\`\`\`typescript
let name: string = "Ada";
let age: number = 36;
let isActive: boolean = true;
let nothing: null = null;
let undef: undefined = undefined;
let anyValue: any = "anything";   // opt out of checking
let unknownValue: unknown = "x";  // type-safe any
\`\`\`

Prefer \`unknown\` over \`any\` — it forces narrowing before use.

## Arrays and Tuples

\`\`\`typescript
let nums: number[] = [1, 2, 3];
let mixed: (string | number)[] = [1, "two", 3];
let tuple: [string, number] = ["Ada", 36];
\`\`\`

## Interfaces and Types

\`\`\`typescript
interface User {
    name: string;
    age: number;
    email?: string;          // optional
    readonly id: number;     // immutable
}

type Status = "active" | "inactive" | "banned";
\`\`\`

\`interface\` and \`type\` are largely interchangeable for object shapes. Use \`type\` for unions, intersections, and computed types; \`interface\` for extensible object contracts.

## Union and Intersection Types

\`\`\`typescript
type ID = string | number;             // union: either
type Admin = User & { role: "admin" }; // intersection: both
\`\`\`

## Functions

\`\`\`typescript
function greet(name: string, greeting: string = "Hello"): string {
    return \`\${greeting}, \${name}\`;
}

const arrow: (x: number) => number = (x) => x * 2;
\`\`\`

## Type Narrowing

Narrow a broad type to a specific one using runtime checks:

\`\`\`typescript
function format(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();  // narrowed to string
    }
    return value.toFixed(2);         // narrowed to number
}
\`\`\`

### Discriminated unions
\`\`\`typescript
type Result =
    | { status: "ok"; data: string }
    | { status: "error"; message: string };

function handle(r: Result) {
    if (r.status === "ok") {
        console.log(r.data);     // data accessible
    } else {
        console.log(r.message);  // message accessible
    }
}
\`\`\`

## Generics

\`\`\`typescript
function identity<T>(value: T): T {
    return value;
}

identity<string>("hi");   // explicit
identity(42);             // inferred as number

function first<T>(arr: T[]): T | undefined {
    return arr[0];
}
\`\`\`

### Generic constraints
\`\`\`typescript
function getLength<T extends { length: number }>(item: T): number {
    return item.length;
}

getLength("hello");  // OK
getLength([1, 2]);   // OK
// getLength(123);   // ERROR: number has no length
\`\`\`

## Utility Types

| Type | What it does |
|------|-------------|
| \`Partial<T>\` | All properties optional |
| \`Required<T>\` | All properties required |
| \`Readonly<T>\` | All properties readonly |
| \`Pick<T, K>\` | Select properties K from T |
| \`Omit<T, K>\` | Remove properties K from T |
| \`Record<K, V>\` | Map keys K to values V |
| \`ReturnType<F>\` | Return type of function F |
| \`Parameters<F>\` | Parameter types of function F |

\`\`\`typescript
type UserPreview = Pick<User, "name" | "age">;
type UserUpdate = Partial<Omit<User, "id">>;
type UserMap = Record<string, User>;
\`\`\`

## Type Assertions and Casting

\`\`\`typescript
const el = document.getElementById("app") as HTMLDivElement;
const value: unknown = "hello";
const str = value as string;  // narrow unknown → string
\`\`\`

Use \`as\` sparingly — it bypasses checking. Prefer type guards.

## Type Guards

\`\`\`typescript
function isString(x: unknown): x is string {
    return typeof x === "string";
}

if (isString(value)) {
    value.toUpperCase();  // safe
}
\`\`\`

## Modules

\`\`\`typescript
export interface User { /* ... */ }
export type ID = string | number;
export const defaultUser: User = { name: "Guest", age: 0 };

import { User, defaultUser } from "./types";
import type { ID } from "./types";  // type-only import
\`\`\`

Use \`import type\` to make it explicit that something is only used at compile time.

## Key Takeaways

- TypeScript catches errors before runtime and powers great tooling
- Prefer \`unknown\` over \`any\` — it forces safe narrowing
- Use union types and discriminated unions to model state
- Generics + constraints enable reusable, type-safe code
- Utility types (\`Partial\`, \`Pick\`, \`Omit\`, \`Record\`) are everyday tools
- Narrow with \`typeof\`, \`instanceof\`, \`in\`, and custom type guards`,
  },
];

export const STORE_CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Algorithms',
  'Security',
  'Systems',
  'Languages',
] as const;

export const STORE_DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;
