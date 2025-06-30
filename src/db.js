import dotenv from 'dotenv';
dotenv.config();

import Knex from 'knex';
import { Model } from 'objection';

// Initialize Knex connection
const knex = Knex({
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  pool: { min: 2, max: 10 }, // Optional: tune pool settings as needed
});

// Bind all Models to the Knex instance
Model.knex(knex);

export { knex, Model };
