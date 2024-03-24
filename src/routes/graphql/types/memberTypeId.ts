import { GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLScalarType, Kind } from 'graphql';
import { MemberTypeId } from '../../member-types/schemas.js';

const isMemberTypeId = (value: unknown): value is MemberTypeId => Object.values(MemberTypeId).some(((memberType) => memberType === value)); 

export const MemberTypeIdType = new GraphQLScalarType({
  name: 'MemberTypeId',
  serialize(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(`Invalid MemberTypeId.`);
    }
    return value;
  },
  parseValue(value) {
    if (!isMemberTypeId(value)) {
      throw new TypeError(`Invalid MemberTypeId.`);
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (isMemberTypeId(ast.value)) {
        return ast.value;
      }
    }
    return undefined;
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: MemberTypeIdType },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  },
});
