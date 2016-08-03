import { processSchema } from 'meteor/tomi:apollo-mantra';
import user from './user_schema';
import semester from './semester_schema';
import practical from './practical_schema';
import exercise from './exercise_schema';
import root from './root_schema';
export default function () {
    processSchema([
        user,
        exercise,
        practical,
        semester,
        root
    ]);
}
