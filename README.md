# Express-SQLite-Auth-Boilerplate

This project is a boilerplate project that provides a complete solution for building a secure and scalable authentication API using TypeScript and SQLite. It includes built-in methods for initializing an SQLite3 database, interacting with it using TypeScript instead of SQL, and Express boilerplate that uses these methods. It also holds a basic example of user authentification that makes use of the `EntityManager` class to interact with the db through Typescript. Built-in features:

1. Password encryption using bcrypt
2. Authentification using jsonwebtoken
3. Joi validation

## Installation:

```
git clone https://github.com/Hamza-Bouhelal/Express-SQLite-Auth-Boilerplate.git
cd Express-SQLite-Auth-Boilerplate
mkdir db
copy .env.default .env
yarn
yarn dev
```

### dbManager:
The class `dbManager` provides a method to create a db.sqlite3 database, connect to it using package sqlite3, and provide a method that implements the factory design pattern to initiate instance of the `EntityManager`, A simple example of how to make use of it:

    interface UserModal extends EntityInterface {
        name: string;
        email: string;
        password: string;
    }

    const dbManager = new DbManager({ logs: false });

    //creates db.sqlite3 file if it doesn't exist, and initiates a connection to the db
    await dbManager.initDB();

    //create an entity manager from the interface UserModal, with table name "User"
    const UserManager = dbManager.getEntityManager<UserModal>("User");

    [
        { name: "John", email: "fez", password: "fez" },
        { name: "John", email: "elvis", password: "elvis" },
    ].forEach(async (user) => {
        await UserManager.save(user);
    });

    await UserManager.delete({name: "John"});

    await UserManager.find({{name: "John"}}, async (users: UserModal[]) => {
        console.log(users);
    });


