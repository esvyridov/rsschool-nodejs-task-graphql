import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeIdType } from './types/memberTypeId.js';
import { ChangePostInputType, CreatePostInputType, PostType } from './types/post.js';
import { ChangeProfileInputType, CreateProfileInputType, ProfileType } from './types/profile.js';
import { ChangeUserInputType, CreateUserInputType, UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';

const DEPTH_LIMIT = 5;

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
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: UserType,
        args: {
          dto: { type: new GraphQLNonNull(CreateUserInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.user.create({
            data: args.dto,
          });
        }
      },
      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.user.update({
            where: { id: args.id },
            data: args.dto,
          });
        }
      },
      deleteUser: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) }
        },
        async resolve(parent, args, { prisma }) {
          return !!(await prisma.user.delete({
            where: {
              id: args.id,
            },
          }));
        }
      },
      createPost: {
        type: PostType,
        args: {
          dto: { type: new GraphQLNonNull(CreatePostInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.post.create({
            data: args.dto,
          });
        }
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.post.update({
            where: { id: args.id },
            data: args.dto,
          });
        }
      },
      deletePost: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) }
        },
        async resolve(parent, args, { prisma }) {
          return !!(await prisma.post.delete({
            where: {
              id: args.id,
            },
          }));
        }
      },
      createProfile: {
        type: ProfileType,
        args: {
          dto: { type: new GraphQLNonNull(CreateProfileInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.profile.create({
            data: args.dto,
          });
        }
      },
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
        },
        resolve(parent, args, { prisma }) {
          return prisma.profile.update({
            where: { id: args.id },
            data: args.dto,
          });
        }
      },
      deleteProfile: {
        type: GraphQLBoolean,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) }
        },
        async resolve(parent, args, { prisma }) {
          return !!(await prisma.profile.delete({
            where: {
              id: args.id,
            },
          }));
        }
      },
      subscribeTo: {
        type: UserType,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(parent, args, { prisma }) {
          return prisma.user.update({
            where: {
              id: args.userId,
            },
            data: {
              userSubscribedTo: {
                create: {
                  authorId: args.authorId,
                },
              },
            },
          });
        }
      },
      unsubscribeFrom: {
        type: GraphQLBoolean,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        async resolve(parent, args, { prisma }) {
          return !!(await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          }));
        }
      }
    }
  })
});

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

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
      
      const errors = validate(schema, parse(query), [depthLimit(DEPTH_LIMIT)]);

      if (errors.length > 0) {
        return {
          errors,
        }
      }

      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
        },
      });
    },
  });
};

export default plugin;
