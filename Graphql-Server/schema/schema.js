const graphql = require('graphql');
const _ = require('lodash');
const Book = require('../models/book');
const Author = require('../models/author');
const User = require('../models/user');

const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLID, 
    GraphQLInt, 
    GraphQLList, 
    GraphQLNonNull } = graphql;


//Dummy data
/*var authors = [
    { name: 'Hakan GENC', age: 24, id: '1'},
    { name: 'Fuat KARA', age: 23, id: '2'},
    { name: 'Emmanuel Nteranya', age: 26, id: '3'},
    { name: 'Sakir ALP', age: 23, id: '4'},
]*/

/*var books = [
    { name: 'Name of the Wind', genre: 'Fantasy', id : '1', authorId: '1'},
    { name: 'The Final Empire', genre: 'Fantasy', id : '2', authorId: '1'},
    { name: 'The Long Earth', genre: 'Fantasy', id : '3', authorId: '2'},
    { name: 'Spiderman', genre: 'Sci-Fi', id : '4', authorId: '3'}
]*/

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) {
                //return _.find(authors, { id: parent.authorId });
                return Author.findById(parent.authorId)
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        fullname: { type: GraphQLString },
        username: { type: GraphQLString },
        password: { type: GraphQLString }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        book: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                //return _.filter(books, { authorId: parent.id });
                return Book.find({authorId: parent.id})
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                //return _.find(books, { id: args.id });
                return Book.findById(args.id)
            }
        },
        author: {
            type: AuthorType,
            args: { id : { type: GraphQLID } },
            resolve(parent, args) {
                //return _.find(authors, { id: args.id });
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                //return books
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                //return authors
                return Author.find({});
            }
        },
        allUsers: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },        
        getUser: {
            type: UserType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {                
                return User.findOne({ $and: [{username: args.username}, { password: args.password}] }).exec();
            }
        },
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args) {
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                return author.save();
            }
        },
        addUser: {
            type: UserType,
            args: {
                fullname: { type: new GraphQLNonNull(GraphQLString) },
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                let user = new User({
                    fullname: args.fullname,
                    username: args.username,
                    password: args.password
                });
                return user.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type : new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        },
        deleteBook: {
            type: BookType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Book.findByIdAndRemove(args.id).exec();
            }
        },
        login: {
            type: UserType,
            args: {
                username: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {                
                return User.findOne({ $and: [{username: args.username}, { password: args.password}] }).exec();
            }
        },
        deleteAuthor: {
            type: AuthorType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return Book.where("authorId").equals(args.id).deleteMany().exec(() =>
                       Author.findByIdAndRemove(args.id).exec()
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})
