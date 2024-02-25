import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, graphql, GraphQLList, GraphQLBoolean, GraphQLInputObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType, MemberTypeIdType } from './memberTypeId.js';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
    memberType: {
      type: MemberType,
      resolve(parent, args, { prisma }) {
        return prisma.memberType.findUnique({
          where: {
            id: parent.memberTypeId,
          },
        });
      },
    }
  },
});

export const CreateProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
  },
});

export const ChangeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeIdType },
  },
});
