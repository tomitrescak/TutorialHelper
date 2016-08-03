export const UPDATE = 'EXERCISE: Update';
export const INSERT_QUESTION = 'EXERCISE: Insert Question';
export function insertQuestion(exerciseId, questionId) {
    return {
        type: INSERT_QUESTION,
        exerciseId,
        questionId
    };
}
