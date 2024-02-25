import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
      profile: {
        type: ProfileType,
        resolve(parent, args, { prisma }) {
          return prisma.profile.findUnique({
            where: {
              userId: parent.id,
            },
          });
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve(parent, args, { prisma }) {
          return prisma.post.findMany({
            where: {
              authorId: parent.id,
            },
          });
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve(parent, args, { prisma }) {
          return prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: parent.id,
                },
              },
            },
          });
        },
      },
      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve(parent, args, { prisma }) {
          return prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: parent.id,
                },
              },
            },
          });
        },
      }
    }),
  });