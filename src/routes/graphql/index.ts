import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeIdType } from './types/memberTypeId.js';
import { ChangePostInputType, CreatePostInputType, Post, PostType } from './types/post.js';
import { ChangeProfileInputType, CreateProfileInputType, ProfileType } from './types/profile.js';
import { ChangeUserInputType, CreateUserInputType, User, UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';
import DataLoader from 'dataloader';
import { ResolveTree, parseResolveInfo, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';

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
        async resolve(parent, args, { prisma }) {
          return prisma.post.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      users: {
        type: new GraphQLList(UserType),
        async resolve(parent, args, { prisma, loaders }, resolveInfo) {
          const { usersLoader } = loaders;
          
          const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
          const { fields } = simplifyParsedResolveInfoFragmentWithType(
            parsedResolveInfoFragment as ResolveTree,
            new GraphQLList(UserType)
          );

          const users = await prisma.user.findMany({
            include: {
              userSubscribedTo: 'userSubscribedTo' in fields,
              subscribedToUser: 'subscribedToUser' in fields,
            }
          });

          usersLoader.prime('users', users);

          return users;
        },
      },
      user: {
        type: UserType,
        args: {
          id: { type: UUIDType },
        },
        async resolve(parent, args, { prisma }) {
          return prisma.user.findUnique({
            where: {
              id: args.id,
            },
          });
        },
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        async resolve(parent, args, { prisma }) {
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

      const createUsersLoader = () => new DataLoader(async (userIds: readonly string[]) => {
        return userIds.map((userId) => null);
      });

      const createUserPostsLoader = () => new DataLoader((async (userIds: readonly string[]) => {
        const posts = await prisma.post.findMany({
          where: {
            authorId: { in: userIds as string[] }
          }
        });

        return userIds.map((userId) => posts.filter((post) => post.authorId === userId));
      }));

      const createUserProfileLoader = () => new DataLoader((async (userIds: readonly string[]) => {
        const memberTypes = await prisma.memberType.findMany();
        const profiles = await prisma.profile.findMany({
          where: {
            userId: { in: userIds as string[] }
          }
        });

        return userIds.map((userId) => {
          const profile = profiles.find((profile) => profile.userId === userId);

          if (!profile) { return undefined; }

          return {
            ...profile,
            memberType: memberTypes.find((memberType) => memberType.id === profile.memberTypeId)
          }
        });
      }));

      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma,
          loaders: {
            usersLoader: createUsersLoader(),
            userPostsLoader: createUserPostsLoader(),
            userProfileLoader: createUserProfileLoader(),
          }
        },
      });
    },
  });
};

export default plugin;
