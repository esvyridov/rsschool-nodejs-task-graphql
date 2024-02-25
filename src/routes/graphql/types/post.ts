import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, graphql, GraphQLList, GraphQLBoolean } from 'graphql';
import { UUIDType } from './uuid.js';

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: { type: UUIDType },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        authorId: { type: GraphQLString },
    },
});