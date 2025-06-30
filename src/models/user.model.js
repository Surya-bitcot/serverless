import { Model } from '../db.js';

export class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email', minLength: 1, maxLength: 255 },
        profile: { type: 'string', format: 'uri', maxLength: 1024 },
      },
    };
  }
}