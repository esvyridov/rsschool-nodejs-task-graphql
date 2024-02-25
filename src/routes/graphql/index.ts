import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLList, GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeIdType } from './types/memberTypeId.js';
import { PostType } from './types/post.js';
import { ProfileType } from './types/profile.js';
import { UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberType),
        resolve(parent, args, { prisma }) {
          return prisma.memberType.findMany();
        },
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: MemberTypeIdType },
        },
        resolve(parent, args, { prisma }) {
          return prisma.memberType.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve(parent, args, { prisma }) {
          return prisma.post.findMany();
        },
      },
      post: {
        type: PostType,
        args: {
          id: { type: UUIDType },
        },
        resolve(parent, args, { prisma }) {
          return prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      users: {
        type: new GraphQLList(UserType),
        resolve(parent, args, { prisma }) {
          return prisma.user.findMany();
        },
      },
      user: {
        type: UserType,
        args: {
          id: { type: UUIDType },
        },
        async resolve(parent, args, { prisma, httpErrors }) {
          return prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve(parent, args, { prisma }) {
          return prisma.profile.findMany();
        },
      },
      profile: {
        type: ProfileType,
        args: {
          id: { type: UUIDType },
        },
        resolve(parent, args, { prisma }) {
          return prisma.profile.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
    },
  }),
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          httpErrors
        }
      });
    },
  });
};

export default plugin;
