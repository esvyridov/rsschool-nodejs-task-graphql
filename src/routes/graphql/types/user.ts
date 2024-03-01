import { GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';

export type User = {
  id: string;
  name: string;
  balance:  number;
  userSubscribedTo: {
    id: string;
    name: string;
    subscribedToUser: {
        id: string;
    }[]
  }[]
};

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      async resolve(parent, args, { loaders }) {
        const { userProfileLoader } = loaders;

        const profile = await userProfileLoader.load(parent.id);

        return profile;

      },
    },
    posts: {
      type: new GraphQLList(PostType),
      async resolve(parent, args, { loaders }) {
        const { userPostsLoader } = loaders;

        const posts = await userPostsLoader.load(parent.id);

        return posts;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, { prisma, loaders }) {
        const { usersLoader, userSubscribedToLoader } = loaders;

        const users = await usersLoader.load('users');

        if (users) {
          return users.filter((u) => u.subscribedToUser?.some((ust) => ust.subscriberId === parent.id));
        }

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
      async resolve(parent, args, { prisma, loaders }) {
        const { usersLoader, subscribedToUserLoader } = loaders;

        const users = await usersLoader.load('users');

        if (users) {
          return users.filter((u) => u.userSubscribedTo?.some((ust) => ust.authorId === parent.id))
        }

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

export const CreateUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }
});

export const ChangeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
