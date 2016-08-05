import { processSchema } from 'apollo-mantra/server';

// process all

import user from './user_schema';
import date from './date_schema';
import semester from './semester_schema';
import practical from './practical_schema';
import exercise from './exercise_schema';
import root from './root_schema';

export default function() {
  processSchema([
    date,
    user,
    exercise,
    practical,
    semester,
    root
  ]);
}
