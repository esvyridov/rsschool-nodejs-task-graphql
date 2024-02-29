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
      async resolve(parent, args, { loaders }) {
        const { userSubscribedToLoader } = loaders;

        return await userSubscribedToLoader.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      async resolve(parent, args, { loaders }) {
        const { subscribedToUserLoader } = loaders;

        return await subscribedToUserLoader.load(parent.id);
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
