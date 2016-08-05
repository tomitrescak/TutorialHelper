const schema = `
  scalar Date
`;
const resolvers = {
    Date: {
        __parseValue(value) {
            return new Date(value);
        },
        __parseLiteral(ast) {
            return (parseInt(ast.value, 10));
        },
        __serialize(value) {
            return value.getTime();
        }
    }
};
const def = {
    schema,
    resolvers
};
export default def;
