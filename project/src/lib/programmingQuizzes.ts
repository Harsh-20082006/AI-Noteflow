import type { QuizQuestion } from './ai';

export interface ProgrammingQuiz {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  questions: QuizQuestion[];
}

export const PROGRAMMING_QUIZZES: ProgrammingQuiz[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'JS',
    description: 'Fundamentals, types, closures, and async patterns',
    color: 'from-yellow-400 to-amber-500',
    questions: [
      {
        question: 'What is the output of: console.log(typeof null)?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctIndex: 2,
        explanation: 'typeof null returns "object" — this is a long-standing JavaScript bug that cannot be fixed without breaking existing code.',
      },
      {
        question: 'Which keyword declares a block-scoped variable that can be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctIndex: 1,
        explanation: 'let declares a block-scoped, reassignable variable. var is function-scoped, and const is block-scoped but cannot be reassigned.',
      },
      {
        question: 'What does the "=== " operator do?',
        options: [
          'Assigns a value',
          'Compares values with type coercion',
          'Compares values and types without coercion',
          'Checks if a value is truthy',
        ],
        correctIndex: 2,
        explanation: 'The strict equality operator === compares both value and type without type coercion, unlike == which performs type coercion.',
      },
      {
        question: 'What is a closure in JavaScript?',
        options: [
          'A way to close the browser window',
          'A function that has access to variables in its outer lexical scope',
          'A method to terminate execution',
          'A design pattern for modules',
        ],
        correctIndex: 1,
        explanation: 'A closure is a function that retains access to variables from its outer (enclosing) lexical scope, even after the outer function has returned.',
      },
      {
        question: 'What does "async/await" resolve to?',
        options: [
          'A callback function',
          'A Promise that resolves to the awaited value',
          'A synchronous value directly',
          'An event listener',
        ],
        correctIndex: 1,
        explanation: 'async functions always return a Promise. await pauses execution until the Promise settles, then resolves to the awaited value.',
      },
      {
        question: 'Which array method creates a new array with the results of calling a function on every element?',
        options: ['forEach', 'map', 'filter', 'reduce'],
        correctIndex: 1,
        explanation: 'map() creates a new array populated with the results of calling the provided function on every element of the calling array.',
      },
      {
        question: 'What is event bubbling?',
        options: [
          'Events fire in random order',
          'Events propagate from the target element up to the document root',
          'Events only fire on the target element',
          'Events propagate from the root down to the target',
        ],
        correctIndex: 1,
        explanation: 'Event bubbling means events propagate upward from the target element through all parent elements to the document root. The opposite is event capturing.',
      },
      {
        question: 'What does "hoisting" mean in JavaScript?',
        options: [
          'Moving variables to the top of the file',
          'Variable and function declarations are moved to the top of their scope during compilation',
          'Lifting heavy objects in code',
          'Prioritizing certain functions over others',
        ],
        correctIndex: 1,
        explanation: 'Hoisting is JavaScript\'s behavior of moving variable and function declarations to the top of their containing scope during the compilation phase before execution.',
      },
    ],
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'Py',
    description: 'Syntax, data structures, OOP, and decorators',
    color: 'from-blue-400 to-blue-600',
    questions: [
      {
        question: 'What is the output of: print(type([]))?',
        options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'array'>"],
        correctIndex: 1,
        explanation: '[] creates a list, so type([]) returns <class \'list\'>. Lists are mutable, ordered collections in Python.',
      },
      {
        question: 'Which keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'lambda'],
        correctIndex: 1,
        explanation: 'The "def" keyword defines a named function in Python. "lambda" creates anonymous functions, but is not used for named function definitions.',
      },
      {
        question: 'What does the "self" parameter represent in a Python class method?',
        options: [
          'A global variable',
          'The class itself',
          'The instance of the object being operated on',
          'A reference to the parent class',
        ],
        correctIndex: 2,
        explanation: '"self" represents the instance of the class. It is automatically passed as the first argument to instance methods and allows access to instance attributes and other methods.',
      },
      {
        question: 'What is a decorator in Python?',
        options: [
          'A function that modifies the behavior of another function',
          'A design pattern for UI elements',
          'A way to add comments to code',
          'A type of class inheritance',
        ],
        correctIndex: 0,
        explanation: 'A decorator is a function that takes another function and extends or modifies its behavior without explicitly modifying it, using the @decorator syntax.',
      },
      {
        question: 'Which data structure does NOT allow duplicate elements?',
        options: ['list', 'tuple', 'set', 'array'],
        correctIndex: 2,
        explanation: 'A set is an unordered collection that does not allow duplicate elements. Lists and tuples can contain duplicates.',
      },
      {
        question: 'What is the difference between "is" and "==" in Python?',
        options: [
          'They are identical',
          '"is" checks identity (same object), "==" checks equality (same value)',
          '"is" checks equality, "==" checks identity',
          '"is" is used for strings, "==" for numbers',
        ],
        correctIndex: 1,
        explanation: '"is" checks if two references point to the same object in memory (identity), while "==" checks if two objects have the same value (equality).',
      },
      {
        question: 'What does list comprehension [x**2 for x in range(5)] produce?',
        options: ['[0, 1, 2, 3, 4]', '[0, 1, 4, 9, 16]', '[1, 4, 9, 16, 25]', '[0, 2, 4, 6, 8]'],
        correctIndex: 1,
        explanation: 'The comprehension squares each x from 0 to 4, producing [0, 1, 4, 9, 16]. range(5) generates 0, 1, 2, 3, 4.',
      },
      {
        question: 'What is the GIL in Python?',
        options: [
          'A graphics library',
          'The Global Interpreter Lock that prevents multiple threads from executing Python bytecodes simultaneously',
          'A general import loader',
          'A garbage collection interface layer',
        ],
        correctIndex: 1,
        explanation: 'The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once in CPython.',
      },
    ],
  },
  {
    id: 'java',
    name: 'Java',
    icon: 'Jv',
    description: 'OOP, JVM, collections, and generics',
    color: 'from-orange-400 to-red-500',
    questions: [
      {
        question: 'What is the parent class of all classes in Java?',
        options: ['Class', 'Object', 'Super', 'Base'],
        correctIndex: 1,
        explanation: 'Every class in Java implicitly extends the Object class, which is the root of the class hierarchy. It provides methods like equals(), hashCode(), and toString().',
      },
      {
        question: 'What does the "static" keyword mean in Java?',
        options: [
          'The variable cannot be changed',
          'The member belongs to the class rather than instances',
          'The method is thread-safe',
          'The class is final',
        ],
        correctIndex: 1,
        explanation: 'A static member belongs to the class itself rather than to any instance. It is shared across all instances and can be accessed without creating an object.',
      },
      {
        question: 'What is the JVM?',
        options: [
          'A Java testing framework',
          'The Java Virtual Machine that executes Java bytecode',
          'A Java version manager',
          'A Java visual model library',
        ],
        correctIndex: 1,
        explanation: 'The Java Virtual Machine (JVM) is an abstract machine that executes compiled Java bytecode, enabling Java\'s "write once, run anywhere" capability.',
      },
      {
        question: 'Which collection allows duplicate elements and maintains insertion order?',
        options: ['HashSet', 'TreeSet', 'ArrayList', 'HashMap'],
        correctIndex: 2,
        explanation: 'ArrayList implements the List interface, allowing duplicates and maintaining insertion order. HashSet does not allow duplicates and has no guaranteed order.',
      },
      {
        question: 'What is the difference between "==" and ".equals()" in Java?',
        options: [
          'They are the same',
          '"==" compares references, ".equals()" compares content/logical equality',
          '"==" compares content, ".equals()" compares references',
          '"==" is for primitives, ".equals()" is for objects only',
        ],
        correctIndex: 1,
        explanation: '"==" compares object references (memory addresses), while ".equals()" compares logical equality of content. For String comparison, always use .equals().',
      },
      {
        question: 'What is generics in Java?',
        options: [
          'A way to create generic-looking code',
          'A feature for type-safe collections and methods using type parameters',
          'A keyword for importing packages',
          'A method for generating documentation',
        ],
        correctIndex: 1,
        explanation: 'Generics enable types (classes and interfaces) to be parameters when defining classes, interfaces, and methods, providing stronger type checking at compile time and eliminating casts.',
      },
      {
        question: 'What does the "final" keyword do when applied to a class?',
        options: [
          'Makes the class abstract',
          'Prevents the class from being subclassed',
          'Makes all fields constant',
          'Marks the class as the last one loaded',
        ],
        correctIndex: 1,
        explanation: 'A final class cannot be subclassed. This is used to prevent inheritance, often for security or design reasons (e.g., String is final).',
      },
      {
        question: 'What is an interface in Java?',
        options: [
          'A GUI component',
          'A contract that defines method signatures without implementation',
          'A way to connect to databases',
          'A type of abstract class with all fields public',
        ],
        correctIndex: 1,
        explanation: 'An interface defines a contract — method signatures without implementation. Classes implement interfaces to provide the behavior, enabling polymorphism and multiple inheritance of type.',
      },
    ],
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: 'C++',
    description: 'Memory, pointers, STL, and OOP',
    color: 'from-indigo-400 to-blue-600',
    questions: [
      {
        question: 'What does a pointer store?',
        options: [
          'A data value directly',
          'The memory address of another variable',
          'A string literal',
          'A reference to a class',
        ],
        correctIndex: 1,
        explanation: 'A pointer stores the memory address of another variable. It is dereferenced with * to access the value at that address.',
      },
      {
        question: 'What is the difference between "struct" and "class" in C++?',
        options: [
          'They are completely different',
          'Structs can only hold data, classes can have methods',
          'The default access specifier: public for struct, private for class',
          'Structs are from C, classes are from C++ and cannot interoperate',
        ],
        correctIndex: 2,
        explanation: 'In C++, the only difference is the default access modifier: members of a struct are public by default, while members of a class are private by default. Both can have methods and inheritance.',
      },
      {
        question: 'What is RAII in C++?',
        options: [
          'A recursive algorithm interface',
          'Resource Acquisition Is Initialization — resources are tied to object lifetime',
          'A runtime assertion inspection library',
          'A random access iterator interface',
        ],
        correctIndex: 1,
        explanation: 'RAII (Resource Acquisition Is Initialization) binds the lifetime of resources (memory, files, locks) to the lifetime of objects, ensuring cleanup via destructors when objects go out of scope.',
      },
      {
        question: 'What does the "virtual" keyword enable?',
        options: [
          'Static binding',
          'Dynamic (runtime) polymorphism via virtual dispatch',
          'Inline optimization',
          'Template instantiation',
        ],
        correctIndex: 1,
        explanation: 'The virtual keyword enables dynamic dispatch — the correct overridden method is called at runtime based on the actual object type, not the pointer/reference type.',
      },
      {
        question: 'What is a smart pointer?',
        options: [
          'A pointer with AI capabilities',
          'A RAII wrapper that automatically manages memory allocation and deallocation',
          'A pointer that can point to any type',
          'A pointer used only in template programming',
        ],
        correctIndex: 1,
        explanation: 'Smart pointers (unique_ptr, shared_ptr, weak_ptr) are RAII wrappers that automatically manage memory, preventing leaks and dangling pointers by deallocating when they go out of scope.',
      },
      {
        question: 'What is the STL in C++?',
        options: [
          'The Standard Template Library — generic data structures and algorithms',
          'A string manipulation library',
          'A system testing layer',
          'A static type linker',
        ],
        correctIndex: 0,
        explanation: 'The Standard Template Library (STL) provides generic, templatized data structures (vector, map, set) and algorithms (sort, find) that work with any type through templates.',
      },
      {
        question: 'What does "const" mean when applied to a member function?',
        options: [
          'The function returns a constant',
          'The function does not modify the object\'s state',
          'The function can only be called once',
          'The function is compile-time only',
        ],
        correctIndex: 1,
        explanation: 'A const member function promises not to modify the object\'s state (member variables). It can be called on const instances of the class.',
      },
      {
        question: 'What is a template in C++?',
        options: [
          'A design document for code',
          'A feature for writing generic code that works with any type',
          'A preprocessor macro',
          'A way to format output',
        ],
        correctIndex: 1,
        explanation: 'Templates allow writing generic functions and classes that work with any data type. The compiler generates type-specific versions at compile time.',
      },
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: 'DB',
    description: 'Queries, joins, normalization, and indexing',
    color: 'from-emerald-400 to-teal-600',
    questions: [
      {
        question: 'What does the SQL JOIN clause do?',
        options: [
          'Combines rows from two or more tables based on a related column',
          'Joins two databases together',
          'Concatenates string values',
          'Merges two queries into one result',
        ],
        correctIndex: 0,
        explanation: 'JOIN combines rows from two or more tables based on a logical relationship between them, typically using a foreign key column.',
      },
      {
        question: 'What is the difference between WHERE and HAVING?',
        options: [
          'They are identical',
          'WHERE filters rows before grouping, HAVING filters after GROUP BY',
          'WHERE is for SELECT, HAVING is for UPDATE',
          'HAVING is faster than WHERE',
        ],
        correctIndex: 1,
        explanation: 'WHERE filters individual rows before grouping occurs. HAVING filters groups after GROUP BY has been applied, and can use aggregate functions like COUNT() and SUM().',
      },
      {
        question: 'What does the PRIMARY KEY constraint ensure?',
        options: [
          'The column must be a number',
          'Each row has a unique, non-null identifier',
          'The column is always indexed automatically',
          'The table can only have one row',
        ],
        correctIndex: 1,
        explanation: 'A PRIMARY KEY uniquely identifies each row in a table. It enforces NOT NULL and UNIQUE constraints, and automatically creates an index for fast lookups.',
      },
      {
        question: 'What is database normalization?',
        options: [
          'Organizing data to reduce redundancy and improve integrity',
          'Sorting data alphabetically',
          'Encrypting the database',
          'Compressing the database size',
        ],
        correctIndex: 0,
        explanation: 'Normalization is the process of organizing tables and columns to minimize data redundancy and dependency, following normal forms (1NF, 2NF, 3NF, etc.).',
      },
      {
        question: 'What does the GROUP BY clause do?',
        options: [
          'Sorts the result set',
          'Groups rows that have the same values into summary rows',
          'Creates a new table group',
          'Organizes columns together',
        ],
        correctIndex: 1,
        explanation: 'GROUP BY groups rows that share the same values in specified columns, allowing aggregate functions (COUNT, SUM, AVG) to be applied to each group separately.',
      },
      {
        question: 'What is an index in a database?',
        options: [
          'A table of contents for the database',
          'A data structure that improves the speed of data retrieval operations',
          'A backup of the database',
          'A list of user permissions',
        ],
        correctIndex: 1,
        explanation: 'An index is a data structure (typically a B-tree) that speeds up data retrieval by creating a lookup structure on one or more columns, at the cost of slower writes and extra storage.',
      },
      {
        question: 'What is the difference between INNER JOIN and LEFT JOIN?',
        options: [
          'They are the same',
          'INNER JOIN returns only matching rows; LEFT JOIN returns all left rows plus matches',
          'INNER JOIN is faster; LEFT JOIN is slower',
          'INNER JOIN is for inner tables, LEFT JOIN for outer tables',
        ],
        correctIndex: 1,
        explanation: 'INNER JOIN returns only rows that have matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right, with NULLs for unmatched right rows.',
      },
      {
        question: 'What does ACID stand for in database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Accuracy, Completeness, Integrity, Data',
          'Access, Control, Identity, Distribution',
          'Algorithm, Compute, Index, Data',
        ],
        correctIndex: 0,
        explanation: 'ACID ensures reliable transactions: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).',
      },
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    description: 'Types, generics, utility types, and narrowing',
    color: 'from-sky-400 to-blue-500',
    questions: [
      {
        question: 'What is the main benefit of TypeScript over JavaScript?',
        options: [
          'It runs faster',
          'Static type checking at compile time',
          'It has more syntax features',
          'It supports more browsers',
        ],
        correctIndex: 1,
        explanation: 'TypeScript adds static typing to JavaScript, catching type errors at compile time before runtime, improving code quality and developer experience with better tooling.',
      },
      {
        question: 'What does the "interface" keyword define in TypeScript?',
        options: [
          'A network interface',
          'A contract describing the shape of an object',
          'A class with no implementation',
          'A type of import',
        ],
        correctIndex: 1,
        explanation: 'An interface defines a contract — the shape (properties and methods) that an object must have. It is a TypeScript-only construct erased at compile time.',
      },
      {
        question: 'What is a generic in TypeScript?',
        options: [
          'A type that can be any value',
          'A way to write reusable code that works with multiple types while maintaining type safety',
          'A default type parameter',
          'A wildcard type',
        ],
        correctIndex: 1,
        explanation: 'Generics allow creating reusable components that work with a variety of types rather than a single one, preserving type safety by parameterizing types.',
      },
      {
        question: 'What does the "Partial<T>" utility type do?',
        options: [
          'Removes properties from T',
          'Makes all properties of T optional',
          'Returns half the properties of T',
          'Creates a copy of T',
        ],
        correctIndex: 1,
        explanation: 'Partial<T> constructs a type with all properties of T set to optional (adding ? to each). It is useful for update operations where only some fields are provided.',
      },
      {
        question: 'What is type narrowing in TypeScript?',
        options: [
          'Reducing the size of a type',
          'Refining a union type to a more specific type based on runtime checks',
          'Removing types from a union',
          'Converting types to strings',
        ],
        correctIndex: 1,
        explanation: 'Type narrowing refines a broad type (like a union) to a more specific type using runtime checks such as typeof, instanceof, or in operators, enabling type-safe access.',
      },
      {
        question: 'What does "as const" do when applied to a value?',
        options: [
          'Makes the value immutable with literal types',
          'Freezes the object at runtime',
          'Converts the value to a constant expression',
          'Marks it as a compile-time constant',
        ],
        correctIndex: 0,
        explanation: '"as const" tells TypeScript to infer the most specific literal types (readonly and literal values) instead of widening to general types like string or number.',
      },
      {
        question: 'What is the "unknown" type?',
        options: [
          'A type that is not yet defined',
          'A type-safe counterpart of "any" that requires type checking before use',
          'A type for undeclared variables',
          'A type that can never be assigned',
        ],
        correctIndex: 1,
        explanation: '"unknown" is the type-safe counterpart of "any". You can assign anything to unknown, but must narrow it (via type checks) before using it, preventing unsafe operations.',
      },
      {
        question: 'What does the "Pick<T, K>" utility type do?',
        options: [
          'Chooses a random property from T',
          'Constructs a type by picking the properties K from T',
          'Selects the first K items from an array type',
          'Picks the best type from a union',
        ],
        correctIndex: 1,
        explanation: 'Pick<T, K> constructs a new type by selecting only the properties specified in K from the original type T, creating a subset of the original type.',
      },
    ],
  },
];
