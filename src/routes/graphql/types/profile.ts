import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLNonNull, graphql, GraphQLList, GraphQLBoolean } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType } from './memberTypeId.js';

export const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: {
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      userId: { type: GraphQLInt },
      memberTypeId: { type: GraphQLInt },
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